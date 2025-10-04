import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CurrencyContextType = {
  currency: number;
  add_currency: (amount: number) => void;
  remove_currency: (amount: number) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState(0);

  useEffect(() => {
    // Load currency from storage on mount
    AsyncStorage.getItem('currency').then(value => {
      if (value !== null) setCurrency(Number(value));
    });
  }, []);

  const add_currency = (amount: number) => {
    setCurrency(prev => {
      const newCurrency = prev + amount;
      AsyncStorage.setItem('currency', String(newCurrency));
      return newCurrency;
    });
  };

  const remove_currency = (amount: number) => {
    setCurrency(prev => {
      const newCurrency = Math.max(0, prev - amount);
      AsyncStorage.setItem('currency', String(newCurrency));
      return newCurrency;
    });
  };

  return (
    <CurrencyContext.Provider value={{ currency, add_currency, remove_currency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};