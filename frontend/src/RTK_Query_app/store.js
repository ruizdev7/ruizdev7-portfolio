import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { authSlice } from "./state_slices/auth/authSlice";

import { authApi } from "./services/auth/authApi";
import { userApi } from "./services/user/userApi";
import { projectsApi } from "./services/project/projectApi";

// Add the generated reducer as a specific top-level slice
const rootReducer = combineReducers({
  authSlice: authSlice,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [projectsApi.reducerPath]: projectsApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authApi", "userApi", "projectsApi"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Adding the api middleware enables caching, invalidation, polling, and other useful features of RTK Query
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware, userApi.middleware, projectsApi.middleware),
});

export default store;

setupListeners(store.dispatch);
