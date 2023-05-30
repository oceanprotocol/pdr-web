import { ethers } from 'ethers';
import React, { createElement, useContext, useState } from "react";
import FixedRate from "../utils/contracts/FixedRate";
import PredictorContract from "../utils/contracts/Predictoor";
import Token from "../utils/contracts/Token";

// Define contracts data structure
export interface PredictoorContracts {
  predictoorContract: PredictorContract;
  fixedRateContract: FixedRate;
  tokenContract: Token;
}

// Define contracts initial data
const initialData: Record<string, PredictoorContracts> = {};

const ContractsContext = React.createContext<{
  data: Record<string, PredictoorContracts>;
  addContract: (key: string, 
    provider: ethers.providers.JsonRpcProvider,
    predictoorAddress: string
  ) => PredictoorContracts;
  addItem: (
    key: string, 
    item: PredictoorContracts
  ) => void;
  removeItem: (key: string) => void;
}>({
  data: initialData,
  addContract: () => {
    throw new Error("addContract() not implemented");
  },
  addItem: () => {},
  removeItem: () => {},
});

export const ContractsProvider = ({
    children
}: {
  children: any
}) => {
  const [data, setData] = useState(initialData);

  // Implement Provider Functions
  const addContract = async (
    key: string, 
    provider: ethers.providers.JsonRpcProvider,
    predictoorAddress: string
  ) => {
    const predictoorContract = new PredictorContract(predictoorAddress, provider);
    await predictoorContract.init();
    const fixedRateContract = new FixedRate(predictoorAddress, provider);
    const tokenContract = new Token(predictoorAddress, provider);

    console.log("addContract")
    console.log("predictoorContract: ", predictoorContract)

    // 1. Create new PredictoorContracts object
    const newPredictoorContracts: PredictoorContracts = {
      predictoorContract,
      fixedRateContract,
      tokenContract
    };
    // 2. Add it to the data
    addItem(key, newPredictoorContracts);

    return newPredictoorContracts;
  };

  // Implement Provider Functions
  const addItem = (key: string, item: PredictoorContracts) => {
    setData((prevData) => ({ ...prevData, [key]: item }));
  };

  const removeItem = (key: string) => {
    setData((prevData) => {
      const newData = { ...prevData };
      delete newData[key];
      return newData;
    });
  };

  // Pass the data to the context
  return createElement(
    ContractsContext.Provider,
    { value: {data, addContract, addItem, removeItem}},
    children
  );
};

export const useContractsContext = () => useContext(ContractsContext);
