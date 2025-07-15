import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.current_user?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      headers.set("Accept", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["authApi"],
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (body) => ({
        url: "/token", // Esto está bien si el baseUrl termina en /api/v1
        method: "POST",
        body,
      }),
      invalidatesTags: ["authApi"],
    }),
  }),
});

export const { useLoginUserMutation } = authApi;
