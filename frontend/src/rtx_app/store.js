import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { authApi } from "./auth/AuthAPI";
import { authSlice } from "./auth/authSlice";

const rootReducer = combineReducers({
  authSlice: authSlice,
  [authApi.reducerPath]: authApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authApi"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware),
});

export default store;

setupListeners(store.dispatch);
