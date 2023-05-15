import cx from 'classnames';
import { parseUnits } from 'ethers/lib/utils';
import React, { Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import { getValuesToDisplay } from 'components/core/DoubleValue/utils';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import useUserAllocations from 'hooks/subgraph/allocations/useUserAllocations';
import useLocks from 'hooks/subgraph/useLocks';
import useUnlocks from 'hooks/subgraph/useUnlocks';
import useSettingsStore from 'store/settings/store';
import { allocate, donation } from 'svg/history';

import styles from './History.module.scss';
import { sortAllocationsAndLocks } from './utils';

const History = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.history' });
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { isConnected } = useAccount();
  const { data: dataAllocations } = useUserAllocations();
  const { data: dataLocks } = useLocks();
  const { data: dataUnlocks } = useUnlocks();
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const { timeCurrentEpochStart } = useEpochAndAllocationTimestamps();

  let allocationsAndDeposits =
    dataLocks !== undefined && dataAllocations !== undefined && dataUnlocks !== undefined
      ? [...dataLocks, ...dataAllocations, ...dataUnlocks]
      : undefined;
  allocationsAndDeposits = allocationsAndDeposits
    ? sortAllocationsAndLocks(allocationsAndDeposits)
    : undefined;

  const isListAvailable = (isConnected && allocationsAndDeposits !== undefined) || !isConnected;

  return (
    <div className={styles.root}>
      <div className={styles.header}>{t('history')}</div>
      {!isListAvailable || timeCurrentEpochStart === undefined ? (
        <Loader className={styles.loader} />
      ) : (
        allocationsAndDeposits?.map((element, index) => (
          <BoxRounded
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={cx(
              styles.box,
              element.blockTimestamp < timeCurrentEpochStart && styles.isPast,
            )}
          >
            {(() => {
              if (element.type === 'Allocated') {
                const values = getValuesToDisplay({
                  cryptoCurrency: 'ethereum',
                  cryptoValues,
                  displayCurrency: displayCurrency!,
                  error,
                  isCryptoMainValueDisplay,
                  valueCrypto: element.amount,
                });

                return (
                  <Fragment>
                    <div className={styles.iconAndTitle}>
                      <Svg img={allocate} size={4} />
                      <div className={styles.titleAndSubtitle}>
                        <div className={styles.title}>{t('allocatedFunds')}</div>
                        <div className={styles.subtitle}>
                          {element.array.length}
                          {t('projects')}
                        </div>
                      </div>
                    </div>
                    <div className={styles.values}>
                      <div className={styles.primary}>{values.primary}</div>
                      <div className={styles.secondary}>{values.secondary}</div>
                    </div>
                  </Fragment>
                );
              }

              const values = getValuesToDisplay({
                cryptoCurrency: 'golem',
                cryptoValues,
                displayCurrency: displayCurrency!,
                error,
                isCryptoMainValueDisplay,
                valueCrypto: parseUnits(element.amount, 'wei'),
              });

              return (
                <Fragment>
                  <div className={styles.iconAndTitle}>
                    <Svg img={donation} size={4} />
                    <div className={styles.titleAndSubtitle}>
                      <div className={styles.title}>
                        {element.type === 'Unlock' ? t('unlockedGLM') : t('lockedGLM')}
                      </div>
                    </div>
                  </div>
                  <div className={styles.values}>
                    <div className={styles.primary}>{values.primary}</div>
                    <div className={styles.secondary}>{values.secondary}</div>
                  </div>
                </Fragment>
              );
            })()}
          </BoxRounded>
        ))
      )}
    </div>
  );
};

export default History;
