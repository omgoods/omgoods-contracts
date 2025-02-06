import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('ERC4337', (m) => {
  const deployer = m.getAccount(0);

  const entryPoint = m.contract('EntryPoint', [], {
    from: deployer,
    id: 'entryPoint',
  });

  return { entryPoint };
});
