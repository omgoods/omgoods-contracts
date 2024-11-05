import { TokensTaskNames } from '../../constants';

export enum SubTaskNames {
  ERC20Regular = `${TokensTaskNames.Generate}:erc20:regular`,
  ERC20Wrapped = `${TokensTaskNames.Generate}:erc20:wrapped`,
  ERC721Regular = `${TokensTaskNames.Generate}:erc721:regular`,
}
