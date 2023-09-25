import { join } from 'path';
import { extendConfig } from 'hardhat/config';

extendConfig((config) => {
  const { paths } = config;
  const { root } = paths;

  config.paths = {
    ...paths,
    artifacts: join(root, '.hardhat/artifacts'),
    cache: join(root, '.hardhat/cache'),
  };
});
