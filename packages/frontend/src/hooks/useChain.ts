import { ethers } from 'ethers';
import { atom, useAtom, useAtomValue } from 'jotai';
import { CHAINS } from '../constants/chains';

export const getChainId = (): number | null => {
  try {
    const { ethereum } = window;
    const chainId = (ethereum as any)?.networkVersion;
    return parseInt(chainId);
  } catch (error) {
    return null;
  }
};

const chainIdAtom = atom<number | null>(getChainId());
const chainNameAtom = atom<string>((get) => {
  const chainId = get(chainIdAtom);
  const chain = CHAINS.find((c) => c.id === chainId);
  if (!chain) return 'Non-supported chain';
  return chain.name;
});
const isSwitchingAtom = atom<boolean>(false);

export const useChain = () => {
  const [chainId, setChainId] = useAtom(chainIdAtom);
  const chainName = useAtomValue(chainNameAtom);
  const [isSwitching, setIsSwitching] = useAtom(isSwitchingAtom);

  const switchChain = async (chainId_: number) => {
    if (getChainId() === chainId_) return;

    setIsSwitching(true);
    const { ethereum } = window;
    if (!ethereum || !ethereum.request) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(chainId_) }],
      });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      if ((error as any).code === -32603) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ethers.utils.hexValue(chainId_),
            },
          ],
        });
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const listenToChainChange = () => {
    const { ethereum } = window;
    if (!ethereum) return;

    try {
      (ethereum as any).on('chainChanged', (hexChainId: string) => {
        const chainId = parseInt(hexChainId);
        setChainId(chainId);
      });
    } catch (error) {
      //empty
    }
  };

  return {
    chainId,
    chainName,
    isSwitchingChain: isSwitching,
    listenToChainChange,
    switchChain,
  };
};
