import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  components: {
    Button: {
      variants: {
        solid: {
          color: 'white',
          background: 'blue.500',
          _hover: { background: 'blue.200' },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'gray.700',
      },
    },
    Text: {
      baseStyle: {
        color: 'gray.700',
      },
    },
  },
});

export const HEADER_HEIGHT = '56px';
