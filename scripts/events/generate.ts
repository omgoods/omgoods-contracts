import { deployments, ethers, testing, runScript } from 'hardhat';

const { getAddress } = deployments;

const { getContractAt } = ethers;

const { buildSigners, randomAddress, randomHex } = testing;

runScript(async () => {
  const signers = await buildSigners('owner', 'deployer');

  // account registry

  const accountRegistry = await getContractAt(
    'AccountRegistry',
    await getAddress('AccountRegistry'),
  );

  const account = await getContractAt(
    'AccountImpl',
    await accountRegistry.computeAccount(signers.owner),
  );

  if ((await accountRegistry.getAccountState(account)) === BigInt(0)) {
    console.log('emitting AccountCreated ...');
    await accountRegistry.createAccount(account);
  }

  const owner = randomAddress();

  console.log('emitting AccountOwnerAdded ...');
  await account.addOwner(owner);

  console.log('emitting AccountOwnerRemoved ...');
  await account.removeOwner(owner);

  console.log('emitting AccountTransactionExecuted ...');
  await account.executeTransaction(randomAddress(), 0, randomHex());

  console.log('emitting AccountTransactionsExecuted ...');
  await account.executeTransactions(
    [randomAddress(), randomAddress(), randomAddress()],
    [0, 0, 0],
    [randomHex(), randomHex(), randomHex()],
  );
});
