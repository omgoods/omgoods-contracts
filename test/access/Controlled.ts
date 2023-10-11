import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ZeroAddress } from 'ethers';
import { expect } from 'chai';
import { randomAddress } from '../common';
import { deployControlledMock } from './fixtures';

describe('access/Controlled // mocked', () => {
  let fixture: Awaited<ReturnType<typeof deployControlledMock>>;

  const createBeforeHook = () => {
    before(async () => {
      fixture = await loadFixture(deployControlledMock);
    });
  };

  describe('# getters', () => {
    createBeforeHook();

    describe('hasController()', () => {
      it("expect to return false if the controller doesn't exist", async () => {
        const { controlled } = fixture;

        const res = await controlled.hasController(randomAddress());

        expect(res).false;
      });

      it('expect to return true if the controller exists', async () => {
        const { controlled, signers } = fixture;

        const res = await controlled.hasController(signers.controller);

        expect(res).true;
      });
    });
  });

  describe('# setters', () => {
    describe('_setControllers()', () => {
      createBeforeHook();

      it('expect to revert when one of the controllers is the zero address', async () => {
        const { controlled } = fixture;

        const tx = controlled.setControllers([ZeroAddress, randomAddress()]);

        await expect(tx).revertedWithCustomError(
          controlled,
          'ControllerIsTheZeroAddress',
        );
      });

      it('expect to add many controllers', async () => {
        const { controlled } = fixture;

        const controllers = [randomAddress(), randomAddress()];

        await controlled.setControllers([...controllers, ...controllers]);

        for (const controller of controllers) {
          expect(await controlled.hasController(controller)).true;
        }
      });
    });
  });
});
