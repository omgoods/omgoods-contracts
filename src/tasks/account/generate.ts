import { task, types } from 'hardhat/config';
import { Logger } from '../common';
import { AccountTaskNames } from './constants';

task(AccountTaskNames.Generate, 'Generates the account')
  .addParam('salt', 'Some random text', undefined, types.string)
  .setAction(
    async (
      args: {
        salt: string;
      },
      hre,
    ) => {
      const {
        ethers: {
          id,
          randomBytes,
          keccak256,
          concat,
          SigningKey,
          computeAddress,
        },
      } = hre;

      const { salt } = args;

      const logger = new Logger();

      const privateKey = keccak256(concat([randomBytes(32), id(salt)]));

      const { publicKey, compressedPublicKey } = new SigningKey(privateKey);

      const address = computeAddress(publicKey);

      logger.log({
        address,
        compressedPublicKey,
        publicKey,
        privateKey,
      });
    },
  );
