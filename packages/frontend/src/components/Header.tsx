import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { CHAINS } from '../constants/chains';
import { useAccount } from '../hooks/useAccount';
import { useChain } from '../hooks/useChain';
import { HEADER_HEIGHT } from '../theme';

const Chain = () => {
  const { chainId, switchChain, chainName } = useChain();

  if (!chainId) return <></>;

  return (
    <Menu>
      <MenuButton colorScheme="gray" as={Button} rightIcon={<ChevronDownIcon />} size="sm">
        {chainName}
      </MenuButton>
      <MenuList>
        {CHAINS.map((c) => (
          <MenuItem key={c.id} onClick={() => switchChain(c.id)}>
            {c.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

const Account = () => {
  const { account, connectWallet } = useAccount();

  if (!account) {
    return <Button onClick={connectWallet}>Connect Wallet</Button>;
  }

  return (
    <HStack spacing="4">
      <Chain />
      <Text maxW="32" overflowX="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
        Account: {account}
      </Text>
    </HStack>
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
    zIndex="2"
    shadow="md"
  >
    <Heading fontSize="xl">Stamp Rally PoC</Heading>
    <Account />
  </Flex>
);
