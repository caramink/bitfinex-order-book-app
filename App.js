import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import configureStore from './src/store/store';
import OrderBook from './src/components/order-book';

export default function App() {
  const store = configureStore()
  return (
    <Provider store={store}>
      <OrderBook />
    </Provider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
