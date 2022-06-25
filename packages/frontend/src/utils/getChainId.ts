export const getChainId = (): string | null => {
  try {
    const { ethereum } = window;
    return (ethereum as any)?.networkVersion || null;
  } catch (error) {
    return null;
  }
};
