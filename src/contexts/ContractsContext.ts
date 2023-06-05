import { ethers } from 'ethers';
import React, { createElement, useContext, useState } from "react";
import Predictoor from "../utils/contracts/Predictoor";

// Define contracts we'll be exposing to ReactContext
const contracts: Record<string, Predictoor> = {};

const ContractsContext = React.createContext<{
  data: Record<string, Predictoor>;
  addContract: (
    key: string, 
    provider: ethers.providers.JsonRpcProvider,
    address: string
  ) => Predictoor;
  addItem: (
    key: string, 
    item: Predictoor
  ) => void;
  removeItem: (key: string) => void;
}>({
  data: contracts,
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
  const [data, setData] = useState(contracts);

  // Implement Provider Functions
  const addContract = async (
    key: string, 
    provider: ethers.providers.JsonRpcProvider,
    address: string
  ) => {
    const predictoor = new Predictoor(
      address,
      provider);
    
    await predictoor.init();
    addItem(key, predictoor);
    return predictoor;
  };

  // Implement Provider Functions
  const addItem = (key: string, item: Predictoor) => {
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
