export type Chain = {
  name: string;
  id: number;
};

export const GOERLI_CHAIN: Chain = {
  name: 'Görli',
  id: 5,
} as const;
export const MUMBAI_CHAIN: Chain = {
  name: 'Mumbai',
  id: 80001,
} as const;

export const CHAINS = [GOERLI_CHAIN, MUMBAI_CHAIN] as const;
