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
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user_info, token } = action.payload.current_user;
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
        },
        token: token,
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
      };
      state.current_user.token = null;
    },
  },
});
export const { setCredentials, cleanCredentials } = authSlice.actions;

export default authSlice.reducer;
