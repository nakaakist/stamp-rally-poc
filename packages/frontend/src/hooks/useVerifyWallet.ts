import { utils } from 'ethers';
import { useState } from 'react';
import { useAccount } from '../hooks/useAccount';
import { createToast } from '../utils/createToast';

export type VerifiedData = {
  cumulativeAmount: string;
  signature: string;
  completedStepNum: number;
};

export const useVerifyWallet = (campaignId: string) => {
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { account } = useAccount();

  const verify = async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_WALLET_VERIFIER_URL}/campaigns/${campaignId}/accounts/${account}`,
      );
      const data = await res.json();

      setVerifiedData({
        cumulativeAmount: utils.formatEther(data.cumulativeAmount || '0'),
        signature: data.signature || '',
        completedStepNum: data.completedStepNum || 0,
      });
    } catch (error) {
      createToast({
        title: 'Failed to check reward eligibility',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verify,
    verifiedData,
    isVerifying: isLoading,
  };
};
