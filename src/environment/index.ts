import { extendEnvironment } from 'hardhat/config';
import './typings';
import {
  commonUtils,
  envsUtils,
  ProxyUtils,
  TasksUtils,
  TestsUtils,
  TypeDataUtils,
} from '../utils';

extendEnvironment((hre) => {
  hre.commonUtils = commonUtils;
  hre.envsUtils = envsUtils;
  hre.proxyUtils = new ProxyUtils(hre);
  hre.tasksUtils = new TasksUtils(hre);
  hre.testsUtils = new TestsUtils(hre);
  hre.typeDataUtils = new TypeDataUtils(hre);
});
