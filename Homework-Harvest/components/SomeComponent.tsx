import React from 'react';
import { View, Text, Button } from 'react-native';
import { useCurrency } from './CurrencyContext';

const SomeComponent = () => {
  const { currency, add_currency, remove_currency } = useCurrency();

  return (
    <View>
      <Text>Currency: {currency}</Text>
      <Button title="Add 10" onPress={() => add_currency(10)} />    
      <Button title="Remove 10" onPress={() => remove_currency(10)} />
    </View>
  );
};

export default SomeComponent;