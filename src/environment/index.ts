import { extendEnvironment } from 'hardhat/config';
import './typings';
import { Helpers } from './Helpers';

extendEnvironment((hre) => {
  hre.helpers = new Helpers(hre);
});
