import { Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useAccount } from '../hooks/useAccount';
import { HEADER_HEIGHT } from '../theme';

const Account = () => {
  const { account, connectWallet } = useAccount();

  if (!account) {
    return <Button onClick={connectWallet}>Connect Wallet</Button>;
  }

  return (
    <Text maxW="32" overflowX="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
      Account: {account}
    </Text>
  );
};

export const Header = () => (
  <Flex
    as="header"
    position="fixed"
    width="100vw"
    height={HEADER_HEIGHT}
    justify="space-between"
    align="center"
    px="8"
    bg="white"
    borderBottomWidth="1px"
    shadow="md"
  >
    <Heading fontSize="xl">Stamp Rally PoC</Heading>
    <Account />
  </Flex>
);
