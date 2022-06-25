import { ethers, utils } from 'ethers';
import { useState } from 'react';
import { useAccount } from '../hooks/useAccount';
import { createToast } from '../utils/createToast';
import { useChain } from './useChain';
import { VerifiedData } from './useVerifyWallet';

export const useClaim = (params: {
  contract: ethers.Contract | null;
  rewardToken: string;
  chainId: number;
}) => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const { account } = useAccount();
  const { chainId } = useChain();

  const claim = async ({
    claimableAmount,
    verifiedData,
  }: {
    claimableAmount: number;
    verifiedData: VerifiedData | null;
  }) => {
    if (!params.contract || !verifiedData || params.chainId !== chainId) return;

    try {
      setIsClaiming(true);
      const tx = await params.contract.claim(
        account,
        utils.parseEther(verifiedData.cumulativeAmount),
        verifiedData.signature,
        {
          gasLimit: 200000,
        },
      );

      createToast({
        title: 'Claim submitted',
        description: 'Please wait...',
        status: 'success',
      });

      await tx.wait();

      createToast({
        title: 'Claim success!!',
        description: `You've received ${claimableAmount} ${params.rewardToken}`,
        status: 'success',
      });
    } catch (error) {
      createToast({
        title: 'Failed to claim reward',
        status: 'error',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return {
    claim,
    isClaiming,
  };
};
