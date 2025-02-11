import { time } from '@nomicfoundation/hardhat-network-helpers';
import { encodeFunctionData, formatEther, Hash, parseEther } from 'viem';
import {
  ACTStates,
  ACTSystems,
  ACTVariants,
  ACTVotingVoteKinds,
  randomAddress,
  randomEther,
  randomHex32,
} from '@/common';
import { buildHelpers, runExample } from './common';

const TOKEN = {
  variant: ACTVariants.Fungible,
  name: 'Example DAO',
  symbol: 'EXD',
};

const EPOCH_TIME = 7 * 24 * 60 * 60;

runExample(async (hre) => {
  const {
    viem: { getContractAt },
  } = hre;

  const {
    client,
    logger,
    registry,
    extensions,
    owner,
    wallets,
    computeTokenAddress,
    computeProposalHash,
  } = await buildHelpers();

  const [maintainer, relayer, ...accounts] = wallets;

  const tokenAddress = await computeTokenAddress(TOKEN.variant, TOKEN.symbol);

  await logger.logTx(
    'Top-up token using relayer',
    relayer.sendTransaction({
      to: tokenAddress,
      value: randomEther(100, 10),
    }),
  );

  logger.info('Token', {
    address: tokenAddress,
    ...TOKEN,
    balance: formatEther(await client.getBalance({ address: tokenAddress })),
  });

  await logger.logTx(
    'Creating token',
    registry.write.createToken(
      [
        TOKEN.variant,
        maintainer.account.address,
        TOKEN.name,
        TOKEN.symbol,
        [
          extensions.voting,
          extensions.signer, // For proposals with signing action
          extensions.wallet, // For proposals with executing action
        ],
      ],
      owner,
    ),
  );

  const moveToNextEpoch = async () => {
    logger.log('Increase time by 7 days');
    await time.increase(EPOCH_TIME);

    const currentEpoch = await token.read.getCurrentEpoch();

    logger.info('Token', {
      currentEpoch,
    });

    return currentEpoch as number;
  };

  const token = await getContractAt('ACTFungibleImpl', tokenAddress);

  // Token extensions
  const tokenSigner = await getContractAt('ACTSignerExtension', tokenAddress);
  const tokenVoting = await getContractAt('ACTVotingExtension', tokenAddress);
  const tokenWallet = await getContractAt('ACTWalletExtension', tokenAddress);

  for (const account of accounts) {
    const to = account.account.address;
    const value = randomEther();

    await logger.logTx(
      `Minting ${formatEther(value)} ${TOKEN.symbol} to ${to}`,
      token.write.mint([to, value], maintainer),
    );
  }

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
    totalSupply: formatEther((await token.read.totalSupply()) as bigint),
  });

  // Open transfers to all token holders and start balance tracking
  await logger.logTx(
    'Changing token state to `Tracked`',
    token.write.setState([ACTStates.Tracked], maintainer),
  );

  await logger.logTx(
    'Changing token system to `Democracy`',
    token.write.setSystem([ACTSystems.Democracy], maintainer),
  );

  logger.info('Token', {
    owner: await token.read.getOwner(),
    settings: await token.read.getSettings(),
    currentEpoch: await token.read.getCurrentEpoch(),
  });

  const [proposalCreator, ...voters] = accounts;

  let currentEpoch = await moveToNextEpoch();

  const createAndProcessProposal = async (proposalData: Hash) => {
    const proposalHash = computeProposalHash(currentEpoch, proposalData);

    await logger.logTx(
      'Submitting signing signature proposal',
      tokenVoting.write.submitProposal([proposalData], proposalCreator),
    );

    logger.info('Proposal', await tokenVoting.read.getProposal([proposalHash]));

    // Voting will start in next epoch
    currentEpoch = await moveToNextEpoch();

    logger.log('Start voting for proposal');

    logger.info('Proposal', await tokenVoting.read.getProposal([proposalHash]));

    for (const voter of voters) {
      await logger.logTx(
        `${voter.account.address} voting for proposal`,
        tokenVoting.write.submitVote(
          [proposalHash, ACTVotingVoteKinds.Accept],
          voter,
        ),
      );
    }

    logger.info('Proposal', await tokenVoting.read.getProposal([proposalHash]));

    // Voting will end in next epoch
    currentEpoch = await moveToNextEpoch();

    logger.log('Start executing proposal');

    logger.info('Proposal', await tokenVoting.read.getProposal([proposalHash]));

    await logger.logTx(
      'Executing proposal',
      tokenVoting.write.executeProposal([proposalHash], relayer),
    );

    logger.info('Proposal', await tokenVoting.read.getProposal([proposalHash]));
  };

  logger.log('Voting for adding new verified signature');

  {
    const message = {
      hash: randomHex32(),
    };

    logger.info(
      'Signature',
      await tokenSigner.read.getSignature([message.hash]),
    );

    logger.info('Signature validation', {
      // ERC 1271
      isValidSignature: await tokenSigner.read.isValidSignature([
        message.hash,
        '0x',
      ]),
      // ERC 4337
      validateSignature: await tokenSigner.read.validateSignature([
        message.hash,
      ]),
    });

    const proposalData = encodeFunctionData({
      abi: tokenSigner.abi,
      functionName: 'setSignature',
      args: [
        message.hash,
        {
          mode: 1, // infinity
          validAfter: 0,
          validUntil: 0,
        },
      ],
    });

    await createAndProcessProposal(proposalData);

    logger.info(
      'Signature',
      await tokenSigner.read.getSignature([message.hash]),
    );

    logger.info('Signature validation', {
      // ERC 1271
      isValidSignature: await tokenSigner.read.isValidSignature([
        message.hash,
        '0x',
      ]),
      // ERC 4337
      validateSignature: await tokenSigner.read.validateSignature([
        message.hash,
      ]),
    });
  }

  logger.log('Voting for executing transaction from the token contract');

  {
    const transaction = {
      to: randomAddress(),
      value: parseEther('5'),
      data: '0x',
    };

    logger.info('Transaction', transaction);

    logger.info('Recipient', {
      address: transaction.to,
      balance: formatEther(
        await client.getBalance({ address: transaction.to }),
      ),
    });

    const proposalData = encodeFunctionData({
      abi: tokenWallet.abi,
      functionName: 'executeTransaction',
      args: [transaction],
    });

    await createAndProcessProposal(proposalData);

    logger.info('Recipient', {
      address: transaction.to,
      balance: formatEther(
        await client.getBalance({ address: transaction.to }),
      ),
    });
  }

  logger.log('Voting for changing token name');

  {
    logger.info('Token', {
      name: await token.read.name(),
    });

    const proposalData = encodeFunctionData({
      abi: token.abi,
      functionName: 'setName',
      args: ['New Name'],
    });

    await createAndProcessProposal(proposalData);

    logger.info('Token', {
      name: await token.read.name(),
    });
  }
});
