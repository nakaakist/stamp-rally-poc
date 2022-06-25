import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    Heading: {
      baseStyle: {
        color: 'black',
      },
    },
    Text: {
      baseStyle: {
        color: 'gray.600',
      },
    },
  },
});

export const HEADER_HEIGHT = '56px';
