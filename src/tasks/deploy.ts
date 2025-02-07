import { task } from 'hardhat/config';
import { Hash, zeroAddress } from 'viem';
import ACTModule from '@/modules/ACT';
import ERC4337Module from '@/modules/ERC4337';

export const TASK_DEPLOY = 'deploy';

task(TASK_DEPLOY, 'Deploys all modules')
  .addFlag('silent', 'Silence the output')
  .setAction(
    async (
      args: {
        silent: boolean;
      },
      hre,
    ) => {
      const { ignition } = hre;

      const { silent } = args;

      let entryPoint: Hash | undefined;

      // TODO: get entry point for current network

      if (!entryPoint) {
        ({
          entryPoint: { address: entryPoint },
        } = await ignition.deploy(ERC4337Module, {
          displayUi: !silent,
        }));
      }

      await ignition.deploy(ACTModule, {
        displayUi: !silent,
        parameters: {
          ACTRegistry: {
            entryPoint: entryPoint || zeroAddress,
          },
        },
      });
    },
  );
