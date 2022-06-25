export const getChainId = (): number | null => {
  try {
    const { ethereum } = window;
    const chainId = (ethereum as any)?.networkVersion;
    return parseInt(chainId);
  } catch (error) {
    return null;
  }
};
