import { extendEnvironment } from 'hardhat/config';

extendEnvironment((hre) => {
  const { deployments } = hre;

  deployments.getAddress = async (name) => {
    const { get } = deployments;

    const deployment = await get(name);

    return deployment?.address || null;
  };
});
