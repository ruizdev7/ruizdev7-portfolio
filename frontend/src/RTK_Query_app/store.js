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
import { financialCalculatorApi } from "./services/financialCalculator/financialCalculatorApi";
import { contactApi } from "./services/contact/contactApi";
import { auditLogsApi } from "./services/auditLogs/auditLogsApi";
import { aiGovernanceApi } from "./services/aiGovernance/aiGovernanceApi";

// Add the generated reducer as a specific top-level slice
const rootReducer = combineReducers({
  auth: authReducer,
  pump: pumpReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [postsApi.reducerPath]: postsApi.reducer,
  [pumpApi.reducerPath]: pumpApi.reducer,
  [rolesApi.reducerPath]: rolesApi.reducer,
  [financialCalculatorApi.reducerPath]: financialCalculatorApi.reducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [auditLogsApi.reducerPath]: auditLogsApi.reducer,
  [aiGovernanceApi.reducerPath]: aiGovernanceApi.reducer,
});

const persistConfig = {
  key: "root",
  version: 1, // Versión del estado - incrementar cuando necesites invalidar cache
  storage,
  // Solo persistir auth - NO persistir datos de APIs
  // Los datos de RTK Query se cargan desde el servidor cada vez
  whitelist: [
    "auth", // Solo mantener sesión del usuario
  ],
  // Migración: limpiar cache antiguo si la versión no coincide
  migrate: async (state) => {
    if (!state || state?._persist?.version !== 1) {
      // Limpiar todo excepto auth si hay cambio de versión
      return {
        auth: state?.auth || {},
        _persist: { version: 1, rehydrated: true },
      };
    }
    return state;
  },
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
      rolesApi.middleware,
      financialCalculatorApi.middleware,
      contactApi.middleware,
      auditLogsApi.middleware,
      aiGovernanceApi.middleware
    ),
});

export default store;

setupListeners(store.dispatch);
