import { join } from 'path';
import { extendConfig } from 'hardhat/config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import './tasks';

extendConfig((config) => {
  const { paths } = config;
  const { root } = paths;

  config.paths = {
    ...paths,
    artifacts: join(root, '.hardhat/artifacts'),
    cache: join(root, '.hardhat/cache'),
  };

  chai.use(chaiAsPromised);
});
