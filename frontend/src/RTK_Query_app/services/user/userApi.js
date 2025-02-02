import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:6000/api/v1";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
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
