# Backend

AWS lambda function that processes wallet verification request from frontend.

When the function receives a verification request, it

1. Collects wallet info from The Graph to see how many stamp rally steps the wallet completed.
2. Calculate the total (cumulative) reward amount
3. Create a signature of the above data with the private key of the owner of the reward distributor contract.
4. Return the data and the signature to fronend.

## Commands

A `.env` file is needed to run the commands. Also, AWS cli is needed.

- `yarn deploy`: Deploy.
- `yarn run:local`: Run lambda function locally
