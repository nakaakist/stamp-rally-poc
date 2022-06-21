import { ethers } from 'ethers';
import { atom, useAtom } from 'jotai';
import { DISTRIBUTOR_ADDRESS } from '../constants/constants';
import DIATRIBUTOR_ABI from '../constants/distributorAbi.json';
import { createToast } from '../utils/createToast';

const contractAtom = atom<ethers.Contract | null>(null);

export const useDistributorContract = () => {
  const [contract, setContract] = useAtom(contractAtom);

  const initContract = () => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(DISTRIBUTOR_ADDRESS, DIATRIBUTOR_ABI, signer);

      setContract(contract);
    } catch (error) {
      createToast({
        title: 'Failed to get contract info',
        status: 'error',
      });
    }
  };

  return {
    contract,
    initContract,
  };
};
