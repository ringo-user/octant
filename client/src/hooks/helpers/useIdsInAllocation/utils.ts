import debounce from 'lodash/debounce';

import { TOAST_DEBOUNCE_TIME } from 'constants/toasts';
import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import triggerToast from 'utils/triggerToast';

import { OnAddRemoveAllocationElementLocalStorage } from './types';

export const toastDebouncedCantRemoveAllocatedProject = debounce(
  () =>
    triggerToast({
      message:
        'If you want to remove a project from the Allocate view, you need to unallocate funds from it first.',
      title: 'You allocated to this project',
      type: 'warning',
    }),
  TOAST_DEBOUNCE_TIME,
  { leading: true },
);

export function isProposalAlreadyAllocatedOn(
  userAllocationsElements: undefined | UserAllocationElement[],
  address: string,
): boolean {
  // TODO Remove userAllocations.allocation.gt(0) check following https://wildlandio.atlassian.net/browse/HEX-108.
  if (!userAllocationsElements) {
    return false;
  }
  const allocation = userAllocationsElements.find(
    ({ address: userAllocationAddress }) => userAllocationAddress === address,
  );
  return !!allocation && allocation.value.gt(0);
}

export function onAddRemoveAllocationElementLocalStorage({
  allocations,
  address,
  userAllocationsElements,
  name,
}: OnAddRemoveAllocationElementLocalStorage): string[] | undefined {
  if (isProposalAlreadyAllocatedOn(userAllocationsElements, address)) {
    toastDebouncedCantRemoveAllocatedProject();
    return;
  }
  const isItemAlreadyAdded = allocations.includes(address);
  const newIds = allocations ? [...allocations] : [];

  if (isItemAlreadyAdded) {
    newIds.splice(newIds.indexOf(address), 1);
    triggerToast({
      dataTest: 'Toast--removeFromAllocate',
      title: `Removed ${name} from Allocate`,
    });
  } else {
    newIds.push(address);
    triggerToast({
      dataTest: 'Toast--addToAllocate',
      title: `Added ${name} to Allocate`,
    });
  }

  return newIds;
}
