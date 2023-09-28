import { extendEnvironment } from 'hardhat/config';

extendEnvironment((hre) => {
  const { deployments } = hre;

  deployments.logTx = async (name, methodName, tx) => {
    const { stdout } = process;

    const res = await tx;

    const { hash } = res;

    stdout.write(`executing "${name}.${methodName}" (tx: ${hash})...`);

    const { gasUsed } = await res.wait();

    stdout.write(`: performed with ${gasUsed} gas\n`);
  };
});
