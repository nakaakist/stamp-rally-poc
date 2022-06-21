import { atom, useAtom } from 'jotai';
import { createToast } from '../utils/createToast';

const accountAtom = atom<string | null>(null);

export const useAccount = () => {
  const [account, setAccount] = useAtom(accountAtom);

  const checkWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum || !ethereum.request) return;

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (!accounts || accounts.length === 0) {
        return;
      }
      setAccount(accounts[0]);
    } catch (error) {
      createToast({
        title: 'Failed to check account in MetaMask.',
        status: 'error',
      });
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum || !ethereum.request) return;

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        createToast({
          title: 'No account found in MetaMask.',
          description: 'Please add account',
          status: 'error',
        });
        return;
      }
      setAccount(accounts[0]);
    } catch (error) {
      createToast({
        title: 'Failed to connect wallet',
        status: 'error',
      });
    }
  };

  return {
    account,
    connectWallet,
    checkWallet,
  };
};
