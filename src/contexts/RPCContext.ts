import { createContext, createElement, useContext } from "react";
import { ethers } from "ethers";

type RPCContextType = {
  wallet: ethers.Wallet | null;
  provider: ethers.providers.JsonRpcProvider | null;
};

export const RPCContext = createContext<RPCContextType>({
  wallet: null,
  provider: null
});

type RPCProviderProps = {
  wallet: ethers.Wallet;
  provider: ethers.providers.JsonRpcProvider;
  children: React.ReactNode;
};

export const RPCProvider = ({ children, wallet, provider }: RPCProviderProps) => {
  return createElement(
    RPCContext.Provider,
    { value: { wallet, provider } },
    children
  );
};

export const useRPCContext = () => useContext(RPCContext);