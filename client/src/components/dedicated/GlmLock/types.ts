export type CurrentMode = 'lock' | 'unlock';

export type Step = 1 | 2 | 3;

export type FormFields = {
  valueToDeposeOrWithdraw: string;
};

export default interface GlmLockProps {
  currentMode: CurrentMode;
  onCloseModal: () => void;
  onCurrentModeChange: (currentMode: CurrentMode) => void;
}
