import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current_user: {
    ccn_user: null,
    token: null,
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.current_user.ccn_user = action.payload.current_user.ccn_user;
      state.current_user.token = action.payload.current_user.token;
    },
    cleanCredentials: (state) => {
      state.current_user.ccn_employee = null;
      state.current_user.token = null;
    },
  },
});
export const { setCredentials, cleanCredentials } = authSlice.actions;

export default authSlice.reducer;
