import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://127.0.0.1:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = getState("authApi.current_user.token");
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
      invalidatesTags: ["userApi"],
    }),
  }),
});

export const { usePostUserMutation } = userApi;
