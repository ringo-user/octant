import cx from 'classnames';
import { BigNumber, ContractTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useFormik } from 'formik';
import { AnimatePresence, motion, useAnimate } from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSigner } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import ButtonProps from 'components/core/Button/types';
import ProgressStepper from 'components/core/ProgressStepper/ProgressStepper';
import BudgetBox from 'components/dedicated/BudgetBox/BudgetBox';
import InputsCryptoFiat from 'components/dedicated/InputsCryptoFiat/InputsCryptoFiat';
import env from 'env';
import useAvailableFundsGlm from 'hooks/helpers/useAvailableFundsGlm';
import useMaxApproveCallback from 'hooks/helpers/useMaxApproveCallback';
import useLock from 'hooks/mutations/useLock';
import useUnlock from 'hooks/mutations/useUnlock';
import useDepositEffectiveAtCurrentEpoch from 'hooks/queries/useDepositEffectiveAtCurrentEpoch';
import useDepositValue from 'hooks/queries/useDepositValue';
import useProposalsContract from 'hooks/queries/useProposalsContract';
import triggerToast from 'utils/triggerToast';

import styles from './GlmLock.module.scss';
import GlmLockProps, { CurrentMode, CurrentStepIndex, FormFields } from './types';
import { formInitialValues, getButtonCtaLabel, validationSchema } from './utils';

const currentStepIndexInitialValue = 0;

const budgetBoxVariants = {
  hide: {
    height: '0',
    margin: '0',
    opacity: '0',
    zIndex: '-1',
  },
  show: {
    height: '0',
    margin: '0',
    opacity: '0',
    zIndex: '-1',
  },
  visible: {
    height: 'auto',
    margin: '0 auto 1.6rem',
    opacity: 1,
    zIndex: '1',
  },
};

const GlmLock: FC<GlmLockProps> = ({
  showBudgetBox,
  currentMode,
  onCurrentModeChange,
  onChangeCryptoOrFiatInputFocus,
  onCloseModal,
}) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.glmLock',
  });
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<CurrentStepIndex>(
    currentStepIndexInitialValue,
  );
  const { refetch: refetchDepositEffectiveAtCurrentEpoch } = useDepositEffectiveAtCurrentEpoch();
  const { data: dataAvailableFunds } = useAvailableFundsGlm();
  const { data: depositsValue, refetch: refetchDeposit } = useDepositValue();
  const { data: proposalsAddresses } = useProposalsContract();
  const [approvalState, approveCallback] = useMaxApproveCallback(
    BigNumber.from(dataAvailableFunds?.value || BigNumber.from(1)),
    env.contractDepositsAddress,
    signer,
    address,
  );
  const [scope, animate] = useAnimate();

  const onRefetch = async (): Promise<void> => {
    await refetchDeposit();
    await refetchDepositEffectiveAtCurrentEpoch();
  };

  const onMutate = async (): Promise<void> => {
    if (!signer) {
      return;
    }

    if (currentMode === 'lock' && approvalState === 'NOT_APPROVED') {
      await approveCallback();
    }

    setCurrentStepIndex(1);
  };

  const onSuccess = async (transactionResponse: ContractTransaction): Promise<void> => {
    setTransactionHash(transactionResponse!.hash);
    triggerToast({
      title: i18n.t('common.transactionSuccessful'),
    });
    await onRefetch();
    setCurrentStepIndex(3);
  };

  const lockMutation = useLock({ onMutate, onSuccess });
  const unlockMutation = useUnlock({ onMutate, onSuccess });

  const onApproveOrDeposit = async ({ valueToDeposeOrWithdraw }): Promise<void> => {
    const isSignedInAsAProposal = proposalsAddresses!.includes(address!);

    if (isSignedInAsAProposal) {
      return triggerToast({
        title: i18n.t('common.proposalForbiddenOperation'),
        type: 'error',
      });
    }

    const valueToDeposeOrWithdrawBigNumber = parseUnits(valueToDeposeOrWithdraw, 18);
    if (currentMode === 'lock') {
      await lockMutation.mutateAsync(valueToDeposeOrWithdrawBigNumber);
    } else {
      await unlockMutation.mutateAsync(valueToDeposeOrWithdrawBigNumber);
    }
  };

  const formik = useFormik<FormFields>({
    initialValues: formInitialValues,
    onSubmit: onApproveOrDeposit,
    validateOnChange: true,
    validationSchema: validationSchema(currentMode, dataAvailableFunds?.value, depositsValue),
  });

  const onReset = (newMode: CurrentMode = 'lock'): void => {
    onCurrentModeChange(newMode);
    setCurrentStepIndex(0);
    setTransactionHash('');
    formik.resetForm();
  };

  const buttonCtaProps: ButtonProps =
    currentStepIndex === 3
      ? {
          onClick: onCloseModal,
          type: 'button',
        }
      : {
          type: 'submit',
        };

  useEffect(() => {
    animate(scope?.current, { marginTop: showBudgetBox ? '0' : '2.4rem' });
  }, [showBudgetBox, scope, animate]);

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit}>
      <BoxRounded ref={scope} className={styles.element} isGrey>
        <ProgressStepper
          currentStepIndex={currentStepIndex}
          steps={
            currentMode === 'lock'
              ? [t('submit'), t('approveAndLock'), i18n.t('common.done')]
              : [t('submit'), t('withdraw'), i18n.t('common.done')]
          }
        />
      </BoxRounded>
      <AnimatePresence initial={false}>
        {showBudgetBox && (
          <motion.div
            animate="visible"
            className={styles.budgetBoxContainer}
            exit="hide"
            initial="show"
            transition={{ ease: 'linear' }}
            variants={budgetBoxVariants}
          >
            <BudgetBox
              currentStepIndex={currentStepIndex}
              depositsValue={depositsValue}
              isError={!formik.isValid}
              transactionHash={transactionHash}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <BoxRounded
        className={styles.element}
        isGrey
        tabs={[
          {
            isActive: currentMode === 'lock',
            onClick: () => onReset('lock'),
            title: t('lock'),
          },
          {
            isActive: currentMode === 'unlock',
            onClick: () => onReset('unlock'),
            title: t('unlock'),
          },
        ]}
      >
        <InputsCryptoFiat
          cryptoCurrency="golem"
          error={formik.errors.valueToDeposeOrWithdraw}
          inputCryptoProps={{
            isDisabled: formik.isSubmitting,
            name: 'valueToDeposeOrWithdraw',
            onChange: value => {
              formik.setFieldValue('valueToDeposeOrWithdraw', value);
            },
            onClear: formik.resetForm,
            suffix: 'GLM',
            value: formik.values.valueToDeposeOrWithdraw,
          }}
          label={currentMode === 'lock' ? t('amountToLock') : t('amountToUnlock')}
          onInputsFocusChange={onChangeCryptoOrFiatInputFocus}
        />
      </BoxRounded>
      <Button
        className={cx(styles.element, styles.button)}
        isDisabled={!formik.isValid}
        isHigh
        isLoading={formik.isSubmitting}
        label={getButtonCtaLabel(currentMode, currentStepIndex, formik.isSubmitting)}
        variant="cta"
        {...buttonCtaProps}
      />
    </form>
  );
};

export default GlmLock;
