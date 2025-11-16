import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API,
    prepareHeaders: (headers, { getState }) => {
      const token =
        getState().auth?.token || getState().auth?.current_user?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["userApi"],
  endpoints: (builder) => ({
    postUser: builder.mutation({
      query: (body) => {
        return {
          url: "/user",
          method: "POST",
          body,
        };
      },
      providesTags: ["userApi"],
    }),
    updateUserEmail: builder.mutation({
      query: ({ ccn_user, email }) => {
        return {
          url: `/users/${ccn_user}/email`,
          method: "PUT",
          body: { email },
        };
      },
      invalidatesTags: ["userApi"],
    }),
    updateUserPassword: builder.mutation({
      query: ({ ccn_user, password, current_password }) => {
        return {
          url: `/users/${ccn_user}/password`,
          method: "PUT",
          body: { password, current_password },
        };
      },
      invalidatesTags: ["userApi"],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  usePostUserMutation,
  useUpdateUserEmailMutation,
  useUpdateUserPasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = userApi;
