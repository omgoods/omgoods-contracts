import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { zeroAddress } from 'viem';

export default buildModule('ACT', (m) => {
  const deployer = m.getAccount(1);
  const owner = m.getAccount(0);

  const registry = m.contract('ACTRegistry', [owner], {
    from: deployer,
  });

  m.call(registry, 'initialize', [owner, [], zeroAddress, 0], { from: owner });

  return { registry };
});
