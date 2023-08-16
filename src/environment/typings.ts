import 'hardhat/types/runtime';
import type {
  commonUtils,
  envsUtils,
  ProxyUtils,
  TasksUtils,
  TestsUtils,
  TypeDataUtils,
} from '../utils';

declare module 'hardhat/types/runtime' {
  export interface HardhatRuntimeEnvironment {
    commonUtils: typeof commonUtils;
    envsUtils: typeof envsUtils;
    proxyUtils: ProxyUtils;
    tasksUtils: TasksUtils;
    testsUtils: TestsUtils;
    typeDataUtils: TypeDataUtils;
  }
}
