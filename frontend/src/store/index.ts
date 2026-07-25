import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/products.slice';
import checkoutReducer from './slices/checkout.slice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
