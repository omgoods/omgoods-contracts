import { extendEnvironment } from 'hardhat/config';
import { Testing, TypedData } from './extensions';

extendEnvironment((hre) => {
  const { deployments, ethers } = hre;

  // extensions

  hre.testing = new Testing(hre);
  hre.typedData = new TypedData(hre);

  // deployments

  const { deploy } = deployments;

  deployments.deploy = async (name, options) => {
    const { id } = ethers;

    return deploy(name, {
      deterministicDeployment: id(name),
      ...options,
    });
  };

  deployments.getAddress = async (name) => {
    const { get } = deployments;

    const deployment = await get(name);

    return deployment?.address || null;
  };

  deployments.logTx = async (name, txP) => {
    const tx = await txP;

    const { stdout } = process;

    const { hash } = tx;

    stdout.write(`executing ${name} (tx: ${hash}) ...`);

    const { gasUsed } = await tx.wait();

    stdout.write(`: performed with ${gasUsed} gas\n`);
  };
});
