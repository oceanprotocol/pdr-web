import { createContext, createElement, useContext, useEffect, useState } from "react";

interface EpochContextValue {
  epochIndex: number;
  setEpochIndex: React.Dispatch<React.SetStateAction<number>>;
  incrementEpochIndex: () => void;
}

const EpochContext = createContext<EpochContextValue>({
  epochIndex: 0,
  setEpochIndex: () => {},
  incrementEpochIndex: () => {},
});

type EpochProviderProps = {
    children: React.ReactNode;
  };

export const EpochProvider = ({ children }: EpochProviderProps) => {    
    const [spotPrice, setSpotPrice] = useState<number>(0);
    const [epochIndex, setEpochIndex] = useState<number>(0);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === "local") {
      const cachedIndex = parseInt(localStorage.getItem("epochIndex") || "0");
      setEpochIndex(cachedIndex);
    }
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === "local") {
      localStorage.setItem("epochIndex", epochIndex.toString());
    }
  }, [epochIndex]);

  const incrementEpochIndex = () => {
    console.log("incrementEpochIndex");
    setEpochIndex((epochIndex) => epochIndex + 1);
  };

  const value: EpochContextValue = {
    epochIndex,
    setEpochIndex,
    incrementEpochIndex,
  };

  return createElement(
    EpochContext.Provider,
    { value },
    children
  );
};

export const useEpochContext = () => useContext(EpochContext);