import React, { createContext, ReactNode, useContext, useState } from 'react';

type CurrencyContextValue = {
  currency: number;
  setCurrency: React.Dispatch<React.SetStateAction<number>>;
  add_currency: (delta: number) => void;
  ownedOutfits: string[];
  setOwnedOutfits: React.Dispatch<React.SetStateAction<string[]>>;
  currentOutfit: string;
  setCurrentOutfit: (outfit: string) => void;
  equipOutfit: (outfit: string) => boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<number>(0);
  const add_currency = (delta: number) => setCurrency(c => c + delta);

  const [ownedOutfits, setOwnedOutfits] = useState<string[]>(['🧑']); // default outfit owned
  const [currentOutfit, setCurrentOutfitState] = useState<string>('🧑');

  const setCurrentOutfit = (outfit: string) => {
    setCurrentOutfitState(outfit);
  };

  const equipOutfit = (outfit: string) => {
    if (!ownedOutfits.includes(outfit)) return false;
    setCurrentOutfit(outfit);
    return true;
  };

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    add_currency,
    ownedOutfits,
    setOwnedOutfits,
    currentOutfit,
    setCurrentOutfit,
    equipOutfit,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};