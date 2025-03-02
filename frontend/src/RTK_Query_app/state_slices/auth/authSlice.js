import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
    account_id: null,
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user_info, token, account_id } = action.payload.current_user;
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
        account_id: account_id,
      };
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
      state.current_user.account_id = null;
    },
    updateEmail: (state, action) => {
      state.current_user.user_info.email = action.payload.email;
    },
  },
});

export const { setCredentials, cleanCredentials, updateEmail } =
  authSlice.actions;

export default authSlice.reducer;
