import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = import.meta.env.VITE_API_URL || "/api/v1";

export const pumpApi = createApi({
  reducerPath: "pumpApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API,
  }),
  tagTypes: ["Pump", "PumpList"],
  // Configuración global para optimizar el rendimiento
  keepUnusedDataFor: 60, // Mantener datos en cache por 60 segundos
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
      // Configuración específica para consultas individuales
      keepUnusedDataFor: 300, // 5 minutos para datos individuales
      refetchOnMountOrArgChange: true, // Refetch cuando cambian los argumentos
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
      // Configuración específica para la lista de bombas
      keepUnusedDataFor: 30, // 30 segundos para la lista (más frecuente)
      refetchOnMountOrArgChange: false, // No refetch automático para evitar llamadas innecesarias
      // Refetch cuando la ventana vuelve a estar activa
      refetchOnFocus: true,
      // Refetch cuando se reconecta la red
      refetchOnReconnect: true,
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

// Hook personalizado para optimizar el uso de getPumps
export const useOptimizedPumpsQuery = (options = {}) => {
  const queryResult = useGetPumpsQuery(undefined, {
    // Configuración optimizada para la lista de bombas
    pollingInterval: 30000, // Polling cada 30 segundos
    refetchOnMountOrArgChange: false, // No refetch automático
    refetchOnFocus: true, // Refetch cuando la ventana vuelve a estar activa
    refetchOnReconnect: true, // Refetch cuando se reconecta la red
    // Mantener datos en cache por más tiempo para mejor UX
    keepUnusedDataFor: 60, // 1 minuto
    ...options,
  });

  return queryResult;
};

// Hook personalizado para optimizar el uso de getPump individual
export const useOptimizedPumpQuery = (ccn_pump, options = {}) => {
  const queryResult = useGetPumpQuery(ccn_pump, {
    // Configuración optimizada para bombas individuales
    refetchOnMountOrArgChange: true, // Refetch cuando cambia el ID
    keepUnusedDataFor: 300, // 5 minutos para datos individuales
    // No polling para datos individuales (menos frecuente)
    pollingInterval: 0,
    ...options,
  });

  return queryResult;
};
