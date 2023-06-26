import cx from 'classnames';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Loader from 'components/core/Loader/Loader';
import Slider from 'components/core/Slider/Slider';
import ModalAllocationValuesEdit from 'components/dedicated/ModalAllocationValuesEdit/ModalAllocationValuesEdit';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useAllocationsStore from 'store/allocations/store';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocateRewardsBox.module.scss';
import AllocateRewardsBoxProps from './types';

const AllocateRewardsBox: FC<AllocateRewardsBoxProps> = ({ className, isDisabled, onUnlock }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationRewardsBox',
  });
  const { data: individualReward } = useIndividualReward();
  const [modalMode, setModalMode] = useState<'closed' | 'donate' | 'withdraw'>('closed');
  const { rewardsForProposals, setRewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
    setRewardsForProposals: state.setRewardsForProposals,
  }));

  if (!individualReward || individualReward.isZero()) {
    return (
      <BoxRounded
        className={cx(styles.root, className)}
        isVertical
        subtitle={t('subtitle', {
          individualReward: getFormattedEthValue(individualReward!).fullString,
        })}
        title={t('title')}
      >
        <Loader />
      </BoxRounded>
    );
  }

  const percentRewardsForProposals = rewardsForProposals.mul(100).div(individualReward).toNumber();
  const percentWithdraw = 100 - percentRewardsForProposals;
  const rewardsForWithdraw = individualReward.sub(rewardsForProposals);
  const sections = [
    {
      header: t('donate', { percentRewardsForProposals }),
      value: getFormattedEthValue(rewardsForProposals),
    },
    {
      header: t('withdraw', { percentWithdraw }),
      value: getFormattedEthValue(rewardsForWithdraw),
    },
  ];

  const onSetRewardsForProposals = (index: number) => {
    if (!individualReward || isDisabled) {
      return;
    }
    setRewardsForProposals(individualReward?.mul(index).div(100));
  };

  return (
    <BoxRounded
      className={cx(styles.root, className)}
      isVertical
      subtitle={t('subtitle', {
        individualReward: getFormattedEthValue(individualReward!).fullString,
      })}
      title={t('title')}
    >
      <Slider
        className={styles.slider}
        isDisabled={isDisabled}
        max={100}
        min={0}
        onChange={onSetRewardsForProposals}
        onUnlock={onUnlock}
        value={percentRewardsForProposals}
      />
      <div className={styles.sections}>
        {sections.map(({ header, value }, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cx(styles.section, isDisabled && styles.isDisabled)}
            onClick={() => (isDisabled ? {} : setModalMode(index === 0 ? 'donate' : 'withdraw'))}
          >
            <div>{header}</div>
            <div className={styles.value}>{value.fullString}</div>
          </div>
        ))}
      </div>
      <ModalAllocationValuesEdit
        modalProps={{
          header:
            modalMode === 'donate'
              ? t('donate', { percentRewardsForProposals })
              : t('withdraw', { percentWithdraw }),
          isOpen: modalMode !== 'closed',
          onClosePanel: () => setModalMode('closed'),
        }}
        onValueChange={newValue => {
          setRewardsForProposals(
            modalMode === 'donate' ? newValue : individualReward.sub(newValue),
          );
        }}
        valueCryptoSelected={modalMode === 'donate' ? rewardsForProposals : rewardsForWithdraw}
        valueCryptoTotal={individualReward}
      />
    </BoxRounded>
  );
};

export default AllocateRewardsBox;
