// store.js - Complete store configuration:
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/authSlice';
import categoryReducer from './redux/categorySlice';
import brandReducer from './redux/brandSlice';
import cartReducer from './redux/cartSlice';
import orderReducer from './redux/orderSlice';
import reviewReducer from './redux/reviewSlice';
import companyReducer from './redux/companySlice';
import productReducer from './redux/productSlice';
import salesReportReducer from './redux/salesReportSlice';
import messageReducer from './redux/messageSlice'; // Import message slice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    brands: brandReducer,
    cart: cartReducer,
    orders: orderReducer,
    reviews: reviewReducer,
    company: companyReducer,
    products: productReducer,
    salesReport: salesReportReducer,
    messages: messageReducer, // Add message reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: [
          'company.company.logo', // If you have logo with File objects
          'messages.currentMessage.reply', // Dates in messages
          
        ],
      },
    }),
  devTools: process.env.REACT_APP_NODE_ENV !== 'production',
});