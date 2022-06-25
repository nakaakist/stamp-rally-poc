import { ethers, utils } from 'ethers';
import { useState } from 'react';
import { createToast } from '../utils/createToast';
import { useAccount } from './useAccount';

export const useClaimedAmount = (contract: ethers.Contract | null) => {
  const [claimedAmount, setClaimedAmount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { account } = useAccount();

  const checkClaimedAmount = async () => {
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      const amount: number = await contract.cumulativeClaimedAmounts(account);
      setClaimedAmount(utils.formatEther(amount));
    } catch (error) {
      createToast({
        title: 'Failed to check claimed amount',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkClaimedAmount,
    claimedAmount,
    isLoadingClaimedAmount: isLoading,
  };
};
