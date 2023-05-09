import { createContext, createElement, useContext, useEffect, useState } from "react";

// TODO - Expand LocalEpochContext to support additional logic
// TODO - Add price
interface LocalEpochContextValue {
  epochIndex: number;
  setEpochIndex: React.Dispatch<React.SetStateAction<number>>;
  incrementEpochIndex: () => void;
}

const LocalEpochContext = createContext<LocalEpochContextValue>({
  epochIndex: 0,
  setEpochIndex: () => {},
  incrementEpochIndex: () => {},
});

type LocalEpochProviderProps = {
    children: React.ReactNode;
  };

export const LocalEpochProvider = ({ children }: LocalEpochProviderProps) => {    
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

  const value: LocalEpochContextValue = {
    epochIndex,
    setEpochIndex,
    incrementEpochIndex,
  };

  return createElement(
    LocalEpochContext.Provider,
    { value },
    children
  );
};

export const useLocalEpochContext = () => useContext(LocalEpochContext);