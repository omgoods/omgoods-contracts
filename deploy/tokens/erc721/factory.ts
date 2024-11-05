import { DeployFunction } from 'hardhat-deploy/types';

const TAG = 'tokens/erc721/factory';
const VERSION = '00-initial';

const func: DeployFunction = async (hre) => {
  const {
    deployments: { log, logHeader, deploy, read, execute, getAddress },
    getNamedAccounts,
    processEnvs,
  } = hre;

  logHeader(TAG, VERSION);

  const { deployer, owner } = await getNamedAccounts();

  const cloneTarget = await getAddress('CloneTarget');
  const forwarder = await getAddress('Forwarder');

  const guardians = processEnvs.getAddresses('GUARDIANS');

  await deploy('ERC721TokenFactory', {
    contract: 'TokenFactory',
    from: deployer,
    log: true,
    args: [
      'OM!goods NFT Factory', //
      owner,
      cloneTarget,
    ],
  });

  if (await read('ERC721TokenFactory', 'isInitialized')) {
    log('ERC721TokenFactory already initialized');
  } else {
    await execute(
      'ERC721TokenFactory',
      {
        from: owner,
        log: true,
      },
      'initialize',
      forwarder,
      guardians,
    );
  }
};

func.tags = [TAG, VERSION];
func.dependencies = ['tokens/erc721/impls/wrapped'];

module.exports = func;
