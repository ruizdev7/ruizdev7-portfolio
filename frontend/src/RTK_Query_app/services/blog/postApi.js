import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = "http://127.0.0.1:5000/api/v1";

export const postsApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API }),
  tagTypes: ["post_list"], // Define tags
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "posts",
      providesTags: ["post_list"],
    }),
    getFeaturedPost: builder.query({
      query: () => "posts/featured",
      providesTags: ["post_list"],
    }),
    invalidatesTags: ["post_list"], // Invalida el caché
  }),
});

export const { useGetPostsQuery, useGetFeaturedPostQuery } = postsApi;
