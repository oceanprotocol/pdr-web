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
}

const LocalEpochContext = createContext<LocalEpochContextValue>({
  epochIndex: 0,
  setEpochIndex: () => {},
  incrementEpochIndex: () => {},

  price: 0,
  setPrice: () => {},
  updatePrice: (newPrice) => {}
});

type LocalEpochProviderProps = {
    children: React.ReactNode;
  };

export const LocalEpochProvider = ({ children }: LocalEpochProviderProps) => {    
    const [epochIndex, setEpochIndex] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === "local") {
      const cachedIndex = parseInt(localStorage.getItem("epochIndex") || "0");
      setEpochIndex(cachedIndex);

      const cachedPrice = parseInt(localStorage.getItem("price") || "0");
      setPrice(cachedPrice);  
    }
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === "local") {
      localStorage.setItem("epochIndex", epochIndex.toString());
      localStorage.setItem("price", price.toString());      
    }
  }, [epochIndex]);

  const incrementEpochIndex = () => {
    console.log("incrementEpochIndex");
    setEpochIndex((epochIndex) => epochIndex + 1);
  };

  const updatePrice = (newPrice: number) => {
    console.log("updatePrice");
    setPrice(newPrice);
  };

  const value: LocalEpochContextValue = {
    epochIndex,
    setEpochIndex,
    incrementEpochIndex,
    price,
    setPrice,
    updatePrice,
  };

  return createElement(
    LocalEpochContext.Provider,
    { value },
    children
  );
};

export const useLocalEpochContext = () => useContext(LocalEpochContext);