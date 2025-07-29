import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export const pumpApi = createApi({
  reducerPath: "pumpApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API,
  }),
  tagTypes: ["Pump", "PumpList"],
  endpoints: (builder) => ({
    createPump: builder.mutation({
      query: (body) => {
        // Check if body is FormData
        const isFormData = body instanceof FormData;

        return {
          url: "/pumps",
          method: "POST",
          body,
          // Don't set Content-Type for FormData, let the browser set it with boundary
          ...(isFormData
            ? {}
            : {
                headers: {
                  "Content-Type": "application/json",
                },
              }),
        };
      },
      invalidatesTags: ["PumpList"],
    }),
    updatePump: builder.mutation({
      query: ({ ccn_pump, body }) => {
        // Check if body is FormData
        const isFormData = body instanceof FormData;

        return {
          url: `/pumps/${ccn_pump}`,
          method: "PUT",
          body,
          // Don't set Content-Type for FormData, let the browser set it with boundary
          ...(isFormData
            ? {}
            : {
                headers: {
                  "Content-Type": "application/json",
                },
              }),
        };
      },
      invalidatesTags: (result, error, { ccn_pump }) => [
        { type: "Pump", id: ccn_pump },
        "PumpList",
      ],
    }),
    deletePump: builder.mutation({
      query: (ccn_pump) => {
        return {
          url: `/pumps/${ccn_pump}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result, error, ccn_pump) => [
        { type: "Pump", id: ccn_pump },
        "PumpList",
      ],
    }),
    getPump: builder.query({
      query: (ccn_pump) => {
        return {
          url: `/pumps/${ccn_pump}`,
          method: "GET",
        };
      },
      providesTags: (result, error, ccn_pump) => [
        { type: "Pump", id: ccn_pump },
      ],
    }),
    getPumps: builder.query({
      query: () => {
        return {
          url: "/pumps",
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.Pumps.map(({ ccn_pump }) => ({
                type: "Pump",
                id: ccn_pump,
              })),
              { type: "PumpList", id: "LIST" },
            ]
          : [{ type: "PumpList", id: "LIST" }],
    }),
    uploadPumpPhotos: builder.mutation({
      query: ({ ccn_pump, body }) => {
        return {
          url: `/pumps/${ccn_pump}/photos`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result, error, { ccn_pump }) => [
        { type: "Pump", id: ccn_pump },
        "PumpList",
      ],
    }),
    deletePumpPhoto: builder.mutation({
      query: ({ ccn_pump, photo_filename }) => {
        return {
          url: `/pumps/${ccn_pump}/photos/${photo_filename}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result, error, { ccn_pump }) => [
        { type: "Pump", id: ccn_pump },
        "PumpList",
      ],
    }),
  }),
});

export const {
  useCreatePumpMutation,
  useUpdatePumpMutation,
  useDeletePumpMutation,
  useGetPumpQuery,
  useGetPumpsQuery,
  useUploadPumpPhotosMutation,
  useDeletePumpPhotoMutation,
} = pumpApi;
