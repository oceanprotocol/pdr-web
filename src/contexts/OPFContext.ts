import { ethers } from "ethers";
import { createContext, createElement, useContext } from "react";

type OPFContextType = {
  wallet: ethers.Wallet | null;
  provider: ethers.providers.JsonRpcProvider | null;
};

export const OPFContext = createContext<OPFContextType>({
  wallet: null,
  provider: null
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