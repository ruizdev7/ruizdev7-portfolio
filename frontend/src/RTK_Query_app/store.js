import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "./state_slices/authSlice";
import pumpReducer from "./state_slices/pump/pumpSlice";

import { authApi } from "./services/auth/authApi";
import { userApi } from "./services/user/userApi";
import { postsApi } from "./services/blog/postApi";
import { pumpApi } from "./services/pump/pumpApi";
import { rolesApi } from "./services/roles/rolesApi";

// Add the generated reducer as a specific top-level slice
const rootReducer = combineReducers({
  auth: authReducer,
  pump: pumpReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [postsApi.reducerPath]: postsApi.reducer,
  [pumpApi.reducerPath]: pumpApi.reducer,
  [rolesApi.reducerPath]: rolesApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: [
    "auth",
    authApi.reducerPath,
    userApi.reducerPath,
    postsApi.reducerPath,
    pumpApi.reducerPath,
    rolesApi.reducerPath,
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Adding the api middleware enables caching, invalidation, polling, and other useful features of RTK Query
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: {
        // Disable immutable state invariant middleware to improve performance
        ignoredPaths: ["auth", "pump", "api"],
        warnAfter: 64, // Increase warning threshold from 32ms to 64ms
      },
    }).concat(
      authApi.middleware,
      userApi.middleware,
      postsApi.middleware,
      pumpApi.middleware,
      rolesApi.middleware
    ),
});

export default store;

setupListeners(store.dispatch);
