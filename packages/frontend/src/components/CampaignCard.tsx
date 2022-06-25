import { CheckCircleIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  Heading,
  List,
  ListIcon,
  ListItem,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ethers, utils } from 'ethers';
import { ReactNode, useEffect, useState } from 'react';
import { useAccount } from '../hooks/useAccount';
import { createToast } from '../utils/createToast';
import { getChainId } from '../utils/getChainId';

const Step = (props: {
  stepNum: number;
  isLast?: boolean;
  achieved: boolean;
  description: ReactNode;
  reward: number;
  rewardToken: string;
}) => (
  <>
    <ListItem w="100%">
      <Box alignItems="center" display="flex">
        <ListIcon
          as={CheckCircleIcon}
          w="5"
          h="5"
          mr="4"
          color={props.achieved ? 'green.400' : 'gray.300'}
        />
        <Box w="100%">
          <Heading size="xs" display="block" mb="1">
            {props.stepNum}.{' '}
            <Text as="span">
              ({props.reward} {props.rewardToken} reward)
            </Text>
          </Heading>
          <Text>{props.description}</Text>
        </Box>
      </Box>
      {!props.isLast && <ChevronDownIcon w="5" h="5" fontWeight="bold" color="gray.400" />}
    </ListItem>
  </>
);

const CurrentReward = (props: {
  isLoading: boolean;
  cumulativeAmount: string | null;
  claimedAmount: string | null;
  rewardToken: string;
}) => {
  if (props.isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Heading size="lg" as="span" mr="2">
        {props.cumulativeAmount} {props.rewardToken}
      </Heading>
      <Text as="span">
        {' '}
        / {props.claimedAmount} {props.rewardToken} already claimed
      </Text>
    </>
  );
};

const ClaimButton = (props: {
  onClick: () => void;
  isClaiming: boolean;
  isLoading: boolean;
  claimableAmount: number;
  rewardToken: string;
}) => {
  let textElem: ReactNode;
  if (props.isClaiming) {
    textElem = (
      <>
        <Spinner as="span" mr="2" />
        Claiming...
      </>
    );
  } else if (props.isLoading) {
    textElem = <Spinner as="span" mr="2" />;
  } else if (props.claimableAmount > 0) {
    textElem = `Claim ${props.claimableAmount} ${props.rewardToken}`;
  } else {
    textElem = 'Nothing to claim';
  }

  return (
    <Button
      mt="3"
      onClick={props.onClick}
      disabled={props.isLoading || props.isClaiming || !props.claimableAmount}
    >
      {textElem}
    </Button>
  );
};

export const CampaignCard = (props: {
  title: string;
  description: ReactNode;
  steps: { description: ReactNode; reward: number }[];
  campaignId: string;
  contract: ethers.Contract | null;
  chainId: string;
  chainName: string;
  rewardToken: string;
}) => {
  const [verifiedData, setVerifiedData] = useState<{
    cumulativeAmount: string;
    signature: string;
    completedStepNum: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [claimedAmount, setClaimedAmount] = useState<string | null>(null);
  const [isGettingClaimedAmount, setIsGettingClaimedAmount] = useState<boolean>(false);

  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const { account, isLoadingAccount } = useAccount();

  const chainMatched = getChainId() === props.chainId;

  const claimableAmount =
    parseFloat(verifiedData?.cumulativeAmount || '0') - parseFloat(claimedAmount || '0');
  const isLoading = isVerifying || isGettingClaimedAmount;

  const verify = async () => {
    if (!account) return;

    try {
      setIsVerifying(true);
      const res = await fetch(
        `${import.meta.env.VITE_WALLET_VERIFIER_URL}/campaigns/${
          props.campaignId
        }/accounts/${account}`,
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
      setIsVerifying(false);
    }
  };

  const checkClaimedAmount = async () => {
    if (!props.contract || !account || !chainMatched) return;

    try {
      setIsGettingClaimedAmount(true);
      const amount: number = await props.contract.cumulativeClaimedAmounts(account);
      setClaimedAmount(utils.formatEther(amount));
    } catch (error) {
      createToast({
        title: 'Failed to check claimed amount',
        status: 'error',
      });
    } finally {
      setIsGettingClaimedAmount(false);
    }
  };

  const claimReward = async () => {
    if (!props.contract || !verifiedData || !chainMatched) return;

    try {
      setIsClaiming(true);
      const tx = await props.contract.claim(
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
        description: `You've received ${claimableAmount} ${props.rewardToken}`,
        status: 'success',
      });
    } catch (error) {
      createToast({
        title: 'Failed to claim reward',
        status: 'error',
      });
    } finally {
      setIsClaiming(false);
      await Promise.all([verify(), checkClaimedAmount()]);
    }
  };

  useEffect(() => {
    verify();
  }, [account]);

  useEffect(() => {
    checkClaimedAmount();
  }, [account, props.contract]);

  return (
    <Box as="li" w="100%" borderWidth="1px" borderRadius="8" p="8" shadow="md" listStyleType="none">
      <VStack spacing="5" align="start" w="100%">
        <Heading size="lg">{props.title}</Heading>
        <Text>{props.description}</Text>

        <Divider />

        <List spacing="1" w="100%">
          {props.steps.map((s, i) => (
            <Step
              key={i}
              stepNum={i + 1}
              achieved={(verifiedData?.completedStepNum || 0) > i}
              description={s.description}
              reward={s.reward}
              rewardToken={props.rewardToken}
              isLast={i === 2}
            />
          ))}
        </List>

        <Divider />

        <VStack w="100%" align="flex-start" spacing="5">
          {account && chainMatched && (
            <>
              <Box>
                <Text>Your total reward now</Text>
                <CurrentReward
                  isLoading={isLoading}
                  cumulativeAmount={verifiedData?.cumulativeAmount || null}
                  claimedAmount={claimedAmount}
                  rewardToken={props.rewardToken}
                />
              </Box>
              <ClaimButton
                onClick={claimReward}
                isClaiming={isClaiming}
                isLoading={isLoading}
                claimableAmount={claimableAmount}
                rewardToken={props.rewardToken}
              />
            </>
          )}
          {!isLoadingAccount && !account && (
            <Alert status="warning">
              <AlertIcon />
              Connect wallet to check your reward
            </Alert>
          )}
          {account && !chainMatched && (
            <Alert status="warning">
              <AlertIcon />
              Switch to {props.chainName} network to check claimable reward
            </Alert>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};
