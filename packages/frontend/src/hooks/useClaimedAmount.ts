import { ethers, utils } from 'ethers';
import { useState } from 'react';
import { createToast } from '../utils/createToast';
import { useAccount } from './useAccount';
import { useChain } from './useChain';

export const useClaimedAmount = (params: { contract: ethers.Contract | null; chainId: number }) => {
  const [claimedAmount, setClaimedAmount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { account } = useAccount();
  const { chainId } = useChain();

  const checkClaimedAmount = async () => {
    if (!params.contract || !account || params.chainId !== chainId) return;

    try {
      setIsLoading(true);
      const amount: number = await params.contract.cumulativeClaimedAmounts(account);
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
