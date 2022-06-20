# Contracts

## References

- https://docs.openzeppelin.com/learn/
- https://blog.openzeppelin.com/workshop-recap-building-an-nft-merkle-drop/

## Commands

- `yarn test`: Run tests
- `yarn start:local`: Start local network
- `yarn deploy:local`: Deploy to local network
- `yarn console:local`: Start console on local network
- `yarn deploy:goerli`: Deploy to Goerli
- `yarn verify:goerli <CONTRACT_ADDRESS> --constructor-args .constructorArgs.ts` : Rerify contract on Goerli. `.constructorArgs.ts` is a file containing constructor arguments like below.

```
const args = [false, '0x0000000000000000000000000000000000000000'];

export default args;
```
