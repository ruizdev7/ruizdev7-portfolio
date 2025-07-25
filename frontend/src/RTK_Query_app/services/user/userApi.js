import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API,
    prepareHeaders: (headers) => {
      headers.set("Access-Control-Allow-Origin", "*");
      return headers;
    },
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
      query: ({ ccn_user, password }) => {
        return {
          url: `/users/${ccn_user}/password`,
          method: "PUT",
          body: { password },
        };
      },
      invalidatesTags: ["userApi"],
    }),
  }),
});

export const {
  usePostUserMutation,
  useUpdateUserEmailMutation,
  useUpdateUserPasswordMutation,
} = userApi;
