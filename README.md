This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Setup App

#### Configure .env file

Before running the app setup your .env file.
Create a '.env.local' file, copy the content from '.env.sample' and change the values accordingly.

Mandatory:

```
NEXT_PUBLIC_ENV = barge
NEXT_PUBLIC_WC2_PROJECT_ID = "Wallet Connect project ID"
```

Optional:

```
NEXT_PUBLIC_SOCKET_IO_URL = SOCKET_IO_URL:8888
NEXT_PUBLIC_DEV_GRAPHQL_HOST = DEV_GRAPHQL_HOST:9000
NEXT_PUBLIC_DEV_GANACHE_HOST = DEV_GANACHE_HOST:8545
```

#### Configure App

There are a few configs you might want to change inside the config.ts file:

- oceanTokenAddress - If you are using Barge with Ganache network, change this address to your local OCEAN token address.
- opfOwnerAddress - Contract address used to filter all Predictoor contracts based on the contract owner.
- opfProvidedPredictions - List of Predictoor contract addresses for which predictions are going to be provided FREE by the websocket app. This contracts are not going to be interacted with on the frontend.

#### Install dependecies

```bash
npm i
```

#### Run the App

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Then, open [http://localhost:3000](http://localhost:3000) to visit the app.

## Setup Barge Env

If you want to connect the App to Barge environment you should look into the following steps to run Barge:

#### Deploy Barge

Use [this readme](https://github.com/oceanprotocol/pdr-trueval/blob/main/README_local_full_flow.md#full-barge) to setup your barge.
You should now have:

- Barge
- Ganache
- Subgraph
- All pdr-dockers running: pdr-predictoor, pdr-trader, pdr-publisher, pdr-trueval

<!-- #### Copy the address.json file into metadata
// Use sed to update address.json rather than copying things manually

At this point, you may need to copy the address from your local system `~/.ocean/ocean-contracts/` to this projects `src/metadata/` folder.

```
$ cp ~/.ocean/ocean-contracts/artifacts/address.json src/metadata/
``` -->

#### Check if contracts are deployed

Navigate to your local subgraph

```
http://localhost:9000/subgraphs/name/oceanprotocol/ocean-subgraph/graphql
```

Run this query to verify predictoor contracts are deployed

```
{
    predictContracts(first: 100) {
      id
      token {
        id
        name
        symbol
      }
      stakeToken {
        id
        name
        symbol
      }
      secondsPerEpoch
      secondsPerSubscription
      truevalSubmitTimeoutBlock
    }
  }
```

#### Update ABIs from Barge if needed

During the development phase, you may need to update the project ABIs by running the following commands in the console/root folder.

```
cat ~/.ocean/ocean-contracts/artifacts/contracts/templates/ERC20Template3.sol/ERC20Template3.json | jq .abi | sed '1s/^/export const ERC20Template3ABI = /' > src/metadata/abis/ERC20Template3ABI.js
cat ~/.ocean/ocean-contracts/artifacts/contracts/pools/fixedRate/FixedRateExchange.sol/FixedRateExchange.json | jq .abi | sed '1s/^/export const FixedRateExchangeABI = /' > src/metadata/abis/FixedRateExchangeABI.js
cat ~/.ocean/ocean-contracts/artifacts/contracts/interfaces/IERC20.sol/IERC20.json | jq .abi | sed '1s/^/export const IERC20ABI = /' > src/metadata/abis/IERC20ABI.js
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
