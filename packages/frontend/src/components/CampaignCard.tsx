import { CheckCircleIcon, ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
  Heading,
  Link,
  List,
  ListIcon,
  ListItem,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { ReactNode, useEffect, useState } from 'react';
import { useAccount } from '../hooks/useAccount';
import { useDistributorContract } from '../hooks/useDistributorContract';
import { createToast } from '../utils/createToast';

const Step = (props: {
  stepNum: number;
  isLast?: boolean;
  achieved: boolean;
  description: ReactNode;
  reward: string;
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
            {props.stepNum}. <Text as="span">({props.reward} reward)</Text>
          </Heading>
          <Text>{props.description}</Text>
        </Box>
      </Box>
      {!props.isLast && <ChevronDownIcon w="5" h="5" fontWeight="bold" color="gray.400" />}
    </ListItem>
  </>
);

const ClaimButton = (props: {
  onClick: () => void;
  isClaiming: boolean;
  isLoading: boolean;
  claimableAmount: number;
}) => (
  <Button
    mt="3"
    onClick={props.onClick}
    disabled={props.isLoading || props.isClaiming || !props.claimableAmount}
  >
    {props.isClaiming && (
      <>
        <Spinner as="span" mr="2" />
        Claiming...
      </>
    )}
    {props.isLoading ? (
      <Spinner as="span" mr="2" />
    ) : props.claimableAmount > 0 ? (
      `Claim ${props.claimableAmount} ETH now`
    ) : (
      'Nothing to claim'
    )}
  </Button>
);

export const CampaignCard = () => {
  const [verifiedData, setVerifiedData] = useState<{
    cumulativeAmount: string;
    signature: string;
    completedStepNum: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const [claimedAmount, setClaimedAmount] = useState<string | null>(null);
  const [isGettingClaimedAmount, setIsGettingClaimedAmount] = useState<boolean>(true);

  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const { account } = useAccount();
  const { contract } = useDistributorContract();

  const claimableAmount =
    parseFloat(verifiedData?.cumulativeAmount || '0') - parseFloat(claimedAmount || '0');
  const isLoading = isVerifying || isGettingClaimedAmount;

  const verify = async () => {
    if (!account) return;

    try {
      setIsVerifying(true);
      const res = await fetch(`${import.meta.env.VITE_WALLET_VERIFIER_URL}/${account}`);
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
    if (!contract || !account) return;

    try {
      setIsGettingClaimedAmount(true);
      const amount: number = await contract.cumulativeClaimedAmounts(account);
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
    if (!contract || !verifiedData) return;

    try {
      setIsClaiming(true);
      const tx = await contract.claim(
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
        description: `You've received ${claimableAmount} ETH`,
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
  }, [account, contract]);

  return (
    <Box w="100%" borderWidth="1px" borderRadius="8" p="8" shadow="md">
      <VStack spacing="5" align="start" w="100%">
        <Heading size="lg">Swap three times in Görli Uniswap</Heading>
        <Text textAlign="justify">
          This is an example stamp rally campaign. It is just a boring stamp rally in a single
          protocol because of the limited availability of subgraphs in the Görli network.
          <br />
          However, it can be easily extended to cross-protocol with appropriate subgraphs.
        </Text>

        <Divider />

        <List spacing="1" w="100%">
          {[...Array(3)].map((_, i) => (
            <Step
              key={i}
              stepNum={i + 1}
              achieved={(verifiedData?.completedStepNum || 0) > i}
              description={
                <>
                  Swap any amount of ETH to UNI in{' '}
                  <Link
                    href="https://app.uniswap.org/#/swap?chain=goerli"
                    isExternal
                    color="blue.500"
                  >
                    Görli Uniswap
                  </Link>
                </>
              }
              reward="0.001 ETH"
              isLast={i === 2}
            />
          ))}
        </List>

        <Divider />

        <VStack w="100%" align="flex-start" spacing="5">
          <Box>
            <Text>Your total reward now</Text>
            {isVerifying || isGettingClaimedAmount ? (
              <Spinner />
            ) : (
              <>
                <Heading size="lg" as="span" mr="2">
                  {verifiedData?.cumulativeAmount} ETH
                </Heading>
                <Text as="span"> / {claimedAmount} ETH already claimed</Text>
              </>
            )}
          </Box>
          <ClaimButton
            onClick={claimReward}
            isClaiming={isClaiming}
            isLoading={isLoading}
            claimableAmount={claimableAmount}
          />
        </VStack>
      </VStack>
    </Box>
  );
};
