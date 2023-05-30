import { ethers } from "ethers";
import { createContext, createElement, useContext } from "react";

type OPFContextType = {
  wallet: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
};

export const OPFContext = createContext<OPFContextType>({
  wallet: ethers.Wallet.createRandom(),
  provider: new ethers.providers.JsonRpcProvider()
});

type OPFProviderProps = {
  wallet: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
  children: React.ReactNode;
};

export const OPFProvider = ({ children, wallet, provider }: OPFProviderProps) => {
  return createElement(
    OPFContext.Provider,
    { value: { wallet, provider } },
    children
  );
};

export const useOPFContext = () => useContext(OPFContext);