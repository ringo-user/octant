export interface TipsData {
  wasAddFavouritesAlreadyClosed: boolean;
  wasCheckStatusAlreadyClosed: boolean;
  wasConnectWalletAlreadyClosed: boolean;
  wasLockGLMAlreadyClosed: boolean;
  wasRewardsAlreadyClosed: boolean;
  wasWithdrawAlreadyClosed: boolean;
}

export interface TipsStore {
  data: TipsData;
  isInitialized: boolean;
  reset: () => void;
  setValuesFromLocalStorage: () => void;
  setWasAddFavouritesAlreadyClosed: (payload: TipsData['wasAddFavouritesAlreadyClosed']) => void;
  setWasCheckStatusAlreadyClosed: (payload: TipsData['wasCheckStatusAlreadyClosed']) => void;
  setWasConnectWalletAlreadyClosed: (payload: TipsData['wasConnectWalletAlreadyClosed']) => void;
  setWasLockGLMAlreadyClosed: (payload: TipsData['wasLockGLMAlreadyClosed']) => void;
  setWasRewardsAlreadyClosed: (payload: TipsData['wasRewardsAlreadyClosed']) => void;
  setWasWithdrawAlreadyClosed: (payload: TipsData['wasWithdrawAlreadyClosed']) => void;
}
