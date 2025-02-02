import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = "http://127.0.0.1:6000/api/v1";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "posts",
    }),
    getFeaturedPost: builder.query({
      query: () => "posts/featured_post",
    }),
    getPostTable: builder.query({
      query: () => "posts-table",
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetFeaturedPostQuery,
  useGetPostTableQuery,
} = postsApi;
