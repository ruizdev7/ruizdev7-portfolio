import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = "http://127.0.0.1:5000/api/v1";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API }),
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "posts",
    }),
    getFeaturedPost: builder.query({
      query: () => "posts/featured",
    }),
  }),
});

export const { useGetPostsQuery, useGetFeaturedPostQuery } = postsApi;
