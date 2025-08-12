import { createSlice } from "@reduxjs/toolkit";

// Función para obtener el estado inicial desde localStorage
const getInitialState = () => {
  try {
    const storedAuth = localStorage.getItem("auth_state");
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      return {
        current_user: {
          user_info: {
            avatarUrl: parsedAuth.current_user?.user_info?.avatarUrl || null,
            full_name: parsedAuth.current_user?.user_info?.full_name || null,
            role: parsedAuth.current_user?.user_info?.role || null,
            ccn_user: parsedAuth.current_user?.user_info?.ccn_user || null,
            email: parsedAuth.current_user?.user_info?.email || null,
            first_name: parsedAuth.current_user?.user_info?.first_name || null,
            last_name: parsedAuth.current_user?.user_info?.last_name || null,
            middle_name:
              parsedAuth.current_user?.user_info?.middle_name || null,
            created_at: parsedAuth.current_user?.user_info?.created_at || null,
          },
          token: parsedAuth.current_user?.token || null,
          refresh_token: parsedAuth.current_user?.refresh_token || null,
          account_id: parsedAuth.current_user?.account_id || null,
        },
        lastActivity: parsedAuth.lastActivity || Date.now(),
      };
    }
  } catch (error) {
    console.error("Error loading auth state from localStorage:", error);
  }

  return {
    current_user: {
      user_info: {
        avatarUrl: null,
        full_name: null,
        role: null,
        ccn_user: null,
        email: null,
        first_name: null,
        last_name: null,
        middle_name: null,
        created_at: null,
      },
      token: null,
      refresh_token: null,
      account_id: null,
    },
    lastActivity: Date.now(),
  };
};

const initialState = getInitialState();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user_info, token, refresh_token, account_id } =
        action.payload.current_user;
      const { first_name, last_name } = user_info;
      state.current_user = {
        user_info: {
          ...user_info,
          avatarUrl: user_info.avatarUrl || null,
          full_name: `${first_name || ""} ${last_name || ""}`,
          role: user_info.role || "Administrator",
          ccn_user: user_info.ccn_user,
          email: user_info.email,
          first_name: user_info.first_name,
          last_name: user_info.last_name,
          middle_name: user_info.middle_name,
          created_at: user_info.created_at,
          password: user_info.password,
        },
        token: token,
        refresh_token: refresh_token,
        account_id: account_id,
      };
      state.lastActivity = Date.now();
      // Sincronizar con localStorage
      localStorage.setItem("auth_state", JSON.stringify(state));
    },
    cleanCredentials: (state) => {
      state.current_user.user_info = {
        avatarUrl: null,
        full_name: null,
        role: null,
        ccn_user: null,
        email: null,
        first_name: null,
        last_name: null,
        middle_name: null,
        created_at: null,
        password: null,
      };
      state.current_user.token = null;
      state.current_user.refresh_token = null;
      state.current_user.account_id = null;
      state.lastActivity = Date.now();
      // Limpiar localStorage
      localStorage.removeItem("auth_state");
    },
    updateEmail: (state, action) => {
      state.current_user.user_info.email = action.payload.email;
    },
    updateToken: (state, action) => {
      state.current_user.token = action.payload.token;
      state.lastActivity = Date.now();
      // Sincronizar con localStorage
      localStorage.setItem("auth_state", JSON.stringify(state));
    },
    updateRefreshToken: (state, action) => {
      state.current_user.refresh_token = action.payload.refresh_token;
      state.lastActivity = Date.now();
      // Sincronizar con localStorage
      localStorage.setItem("auth_state", JSON.stringify(state));
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
      // Sincronizar con localStorage
      localStorage.setItem("auth_state", JSON.stringify(state));
    },
    syncFromStorage: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setCredentials,
  cleanCredentials,
  updateEmail,
  updateToken,
  updateRefreshToken,
  updateLastActivity,
  syncFromStorage,
} = authSlice.actions;

export default authSlice.reducer;
