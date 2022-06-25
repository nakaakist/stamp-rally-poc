import { ethers } from 'ethers';
import { createToast } from '../utils/createToast';

export const getContract = (params: { address: string; abi: any }): ethers.Contract | null => {
  try {
    const { ethereum } = window;
    if (!ethereum) return null;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(params.address, params.abi, signer);

    if (!contract) throw new Error();

    return contract;
  } catch (error) {
    createToast({
      title: 'Failed to get contract info',
      status: 'error',
    });
  }

  return null;
};
