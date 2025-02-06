import { task } from 'hardhat/config';
import { zeroAddress } from 'viem';
import { resolveAddress } from '@/common';
import ACT from '@/modules/ACT';
import ERC4337 from '@/modules/ERC4337';

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

      let entryPoint: string | undefined;

      // TODO: get entry point for current network

      if (!entryPoint) {
        const erc4337 = await ignition.deploy(ERC4337, {
          displayUi: !silent,
        });

        entryPoint = resolveAddress(erc4337.entryPoint);
      }

      await ignition.deploy(ACT, {
        displayUi: !silent,
        parameters: {
          ACTRegistry: {
            entryPoint: entryPoint || zeroAddress,
          },
        },
      });
    },
  );
