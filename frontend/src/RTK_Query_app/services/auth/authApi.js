import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:6000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().authApi.current_user?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Access-Control-Allow-Origin", "*");
      return headers;
    },
  }),
  tagTypes: ["authApi"],
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (body) => {
        return {
          url: "/token",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["authApi"],
    }),
  }),
});

export const { useLoginUserMutation } = authApi;
