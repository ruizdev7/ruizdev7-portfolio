import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { authSlice } from "./state_slices/auth/authSlice";

import { authApi } from "./services/auth/authApi";
import { userApi } from "./services/user/userApi";
import { postsApi } from "./services/blog/postApi";

// Add the generated reducer as a specific top-level slice
const rootReducer = combineReducers({
  authSlice: authSlice,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [postsApi.reducerPath]: postsApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "authSlice",
    authApi.reducerPath,
    userApi.reducerPath,
    postsApi.reducerPath,
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Adding the api middleware enables caching, invalidation, polling, and other useful features of RTK Query
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware, userApi.middleware, postsApi.middleware),
});

export default store;

setupListeners(store.dispatch);
