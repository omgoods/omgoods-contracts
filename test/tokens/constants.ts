export enum TokenNotificationsKinds {
  Unlocked = 0x00,
  OwnerUpdated = 0x01,
  ERC20Update = 0x50,
  ERC20Approve = 0x51,
  ERC721Update = 0x60,
  ERC721Approve = 0x61,
  ERC721ApproveForAll = 0x62,
}

export const TOKEN = {
  name: 'Example',
  symbol: 'Example',
};
