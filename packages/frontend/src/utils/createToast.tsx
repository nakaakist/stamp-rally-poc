import { createStandaloneToast, UseToastOptions } from '@chakra-ui/react';

export const createToast = (params: UseToastOptions) => {
  const { toast } = createStandaloneToast();

  toast(params);
};
