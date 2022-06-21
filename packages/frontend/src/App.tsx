import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { DISTRIBUTOR_ADDRESS, GAS_LIMIT, WALLET_VERIFIER_URL } from './constants/constants';
import DIATRIBUTOR_ABI from './constants/distributorAbi.json';

const getContract = () => {
  const { ethereum } = window;

  if (!ethereum) return;

  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(DISTRIBUTOR_ADDRESS, DIATRIBUTOR_ABI, signer);

  return contract;
};

const App = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [data, setData] = useState<{ cumulativeAmount: number; signature: string } | null>(null);

  const checkWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) return;

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (!accounts || accounts.length === 0) return;
    setAccount(accounts[0]);
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) return;

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    if (!accounts || accounts.length === 0) return;
    setAccount(accounts[0]);
  };

  const checkEligibility = async () => {
    if (!account) return;

    const res = await fetch(`${WALLET_VERIFIER_URL}/${account}`);
    const data = await res.json();

    window.alert(JSON.stringify(data));

    if (data.eligible) {
      setData({
        cumulativeAmount: data.cumulativeAmount || 0,
        signature: data.signature || '',
      });
    }
  };

  const claimReward = async () => {
    const contract = getContract();

    if (!contract || !data) return;

    const tx = await contract.claim(account, data.cumulativeAmount, data.signature, {
      gasLimit: GAS_LIMIT,
    });

    await tx.wait();
  };

  useEffect(() => {
    checkWallet();
  }, [checkWallet]);

  return (
    <div>
      <button className="button" onClick={connectWallet}>
        Connect your wallet
      </button>

      <button className="button" onClick={checkEligibility}>
        Check reward eligibility
      </button>

      <button className="button" onClick={claimReward}>
        Claim reward
      </button>
    </div>
  );
};

export default App;
