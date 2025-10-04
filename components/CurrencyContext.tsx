// CurrencyContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface CurrencyContextType {
  currency: number;
  setCurrency: (val: number | ((prev: number) => number)) => void;
  add_currency: (val: number) => void;
  ownedOutfits: string[];
  setOwnedOutfits: (val: string[] | ((prev: string[]) => string[])) => void;
  currentOutfit: string;
  equipOutfit: (outfit: string) => boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState(200); // starting coins
  const [ownedOutfits, setOwnedOutfits] = useState<string[]>(['default']); // start with default outfit
  const [currentOutfit, setCurrentOutfit] = useState<string>('default');

  // Add/subtract coins
  const add_currency = (val: number) => {
    setCurrency(prev => prev + val);
  };

  // Equip an outfit if owned
  const equipOutfit = (outfit: string) => {
    if (!ownedOutfits.includes(outfit)) return false;
    setCurrentOutfit(outfit);
    return true;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        add_currency,
        ownedOutfits,
        setOwnedOutfits,
        currentOutfit,
        equipOutfit,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook for components
export const useCurrency = () => useContext(CurrencyContext);
