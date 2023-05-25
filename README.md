This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Setup Barge Env

#### Deploy Barge
Use [this readme](https://github.com/oceanprotocol/pdr-trueval/blob/main/README_local_full_flow.md#full-barge) to setup your barge.
You should now have:
- Barge
- Ganache
- Subgraph
- All pdr-dockers running: pdr-predictoor, pdr-trader, pdr-publisher, pdr-trueval


<!-- #### Copy the address.json file into metadata
// Use sed to update address.json rather than copying things manually

At this point, you want to copy the address from your local system `~/.ocean/ocean-contracts/` to this projects `src/metadata/` folder.

```
$ cp ~/.ocean/ocean-contracts/artifacts/address.json src/metadata/
``` -->

#### Update ABIs from barge
You can update the project ABIs by running the following commands in the console/root folder.

```
cat ~/.ocean/ocean-contracts/artifacts/contracts/templates/ERC20Template3.sol/ERC20Template3.json | jq .abi | sed '1s/^/export const ERC20Template3ABI = /' > src/metadata/abis/ERC20Template3ABI.js
cat ~/.ocean/ocean-contracts/artifacts/contracts/pools/fixedRate/FixedRateExchange.sol/FixedRateExchange.json | jq .abi | sed '1s/^/export const FixedRateExchangeABI = /' > src/metadata/abis/FixedRateExchangeABI.js
```

## Run the App

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Running the App

Open [http://localhost:3000](http://localhost:3000) to visit the app.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
