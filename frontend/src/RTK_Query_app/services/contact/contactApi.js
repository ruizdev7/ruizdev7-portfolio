import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export const contactApi = createApi({
  reducerPath: "contactApi",
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
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    submitContactForm: builder.mutation({
      query: (body) => ({
        url: "/contact",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contact"],
    }),
    getContactMessages: builder.query({
      query: ({ page = 1, per_page = 10 } = {}) => ({
        url: "/contact",
        method: "GET",
        params: { page, per_page },
      }),
      providesTags: ["Contact"],
    }),
    markMessageAsRead: builder.mutation({
      query: (messageId) => ({
        url: `/contact/${messageId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useSubmitContactFormMutation,
  useGetContactMessagesQuery,
  useMarkMessageAsReadMutation,
} = contactApi;
