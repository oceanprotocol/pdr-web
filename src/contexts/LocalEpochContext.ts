import { createContext, createElement, useContext, useEffect, useState } from "react";

// TODO - Expand LocalEpochContext to support additional logic
// TODO - Add price
interface LocalEpochContextValue {
  epochIndex: number;
  setEpochIndex: React.Dispatch<React.SetStateAction<number>>;
  incrementEpochIndex: () => void;

  price: number;
  setPrice: React.Dispatch<React.SetStateAction<number>>;
  updatePrice: (newPrice: number) => void;

  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  updateBalance: (newBalance: number) => void;
}

const LocalEpochContext = createContext<LocalEpochContextValue>({
  epochIndex: 0,
  setEpochIndex: () => {},
  incrementEpochIndex: () => {},

  price: 0,
  setPrice: () => {},
  updatePrice: (newPrice) => {},

  balance: 0,
  setBalance: () => {},
  updateBalance: (newBalance) => {},
});

type LocalEpochProviderProps = {
  children: React.ReactNode;
};

export const LocalEpochProvider = ({ children }: LocalEpochProviderProps) => {    
    const [epochIndex, setEpochIndex] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === "local") {
      const cachedIndex = parseInt(localStorage.getItem("epochIndex") || "0");
      setEpochIndex(cachedIndex);

      const cachedPrice = parseInt(localStorage.getItem("price") || "0");
      setPrice(cachedPrice);
      
      const cachedBalance = parseInt(localStorage.getItem("balance") || "0");
      setBalance(cachedBalance);
    }
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === "local") {
      localStorage.setItem("epochIndex", epochIndex.toString());
      localStorage.setItem("price", price.toString());      
      localStorage.setItem("balance", balance.toString());      
    }
  }, [epochIndex, price, balance]);

  const incrementEpochIndex = () => {
    setEpochIndex((epochIndex) => epochIndex + 1);
  };

  const updatePrice = (newPrice: number) => {
    setPrice(newPrice);
  }

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  const value: LocalEpochContextValue = {
    epochIndex,
    setEpochIndex,
    incrementEpochIndex,
    price,
    setPrice,
    updatePrice,
    balance,
    setBalance,
    updateBalance,
  };

  return createElement(
    LocalEpochContext.Provider,
    { value },
    children
  );
};

export const useLocalEpochContext = () => useContext(LocalEpochContext);