import prompts from 'prompts';
import { deployments } from 'hardhat';
import { runScript } from '../../common';
import { createERC20ControlledToken } from './createERC20ControlledToken';
import { createERC20FixedToken } from './createERC20FixedToken';
import { createERC20WrappedToken } from './createERC20WrappedToken';
import { createERC721ControlledToken } from './createERC721ControlledToken';
const { all } = deployments;

runScript(async () => {
  const tokenFactoryNames = Object.entries(await all()).filter(([name]) =>
    name.endsWith('TokenFactory'),
  );

  const {
    tokenFactory,
  }: {
    tokenFactory: {
      type: string;
      address: string;
    };
  } = await prompts({
    type: 'select',
    name: 'tokenFactory',
    message: 'Use token factory',
    choices: tokenFactoryNames.map(([type, { address }]) => ({
      title: type,
      value: {
        type,
        address,
      },
    })),
    initial: 0,
  });

  console.log();

  switch (tokenFactory?.type) {
    case 'ERC20ControlledTokenFactory':
      await createERC20ControlledToken(tokenFactory.address);
      break;

    case 'ERC20FixedTokenFactory':
      await createERC20FixedToken(tokenFactory.address);
      break;

    case 'ERC20WrappedTokenFactory':
      await createERC20WrappedToken(tokenFactory.address);
      break;

    case 'ERC721ControlledTokenFactory':
      await createERC721ControlledToken(tokenFactory.address);
      break;
  }
});
