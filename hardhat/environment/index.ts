import { extendEnvironment } from 'hardhat/config';
import './typings';
import { Testing } from './Testing';

extendEnvironment((hre) => {
  hre.testing = new Testing(hre);
});
