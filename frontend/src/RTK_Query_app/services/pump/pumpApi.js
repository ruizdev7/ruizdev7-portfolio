import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API = import.meta.env.VITE_API_URL || "/api/v1";

// Función para verificar si el token está próximo a expirar
const isTokenExpiringSoon = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    // Considerar que expira pronto si faltan menos de 30 minutos (aumentado de 5 minutos)
    return timeUntilExpiration < 30 * 60 * 1000;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};

// BaseQuery personalizado con manejo de refresh de token
const baseQueryWithTokenRefresh = fetchBaseQuery({
  baseUrl: API,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper para manejar refresh automático del token
const baseQueryWithRefresh = async (args, api, extraOptions) => {
  const state = api.getState();
  const token = state.auth?.token;
  const refreshToken = state.auth?.refreshToken;

  // Verificar si el token está próximo a expirar
  if (token && isTokenExpiringSoon(token)) {
    console.log("🔄 Token expirando pronto, intentando refresh...");

    try {
      // Intentar refresh del token usando el refresh token
      const refreshResult = await fetch(`${API}/refresh-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (refreshResult.ok) {
        const refreshData = await refreshResult.json();
        console.log("✅ Token refreshed successfully");

        // Actualizar el token en el store
        const newToken = refreshData["New access token"];
        if (newToken) {
          // Actualizar el token en el store de Redux
          api.dispatch({
            type: "auth/updateToken",
            payload: newToken,
          });
          console.log("✅ Token updated in Redux store");

          // Actualizar localStorage
          localStorage.setItem("jwt_token", newToken);

          // Forzar sincronización con otras pestañas
          localStorage.setItem("auth_sync", Date.now().toString());
        }
      } else {
        console.log(
          "❌ Token refresh failed, but continuing with current token"
        );
        // En lugar de hacer logout inmediatamente, continuar con el token actual
        // Solo hacer logout si realmente falla la petición
        console.log(
          "🔄 Continuing with current token, will retry on next request"
        );
        return { error: { status: 401, data: "Token refresh failed" } };
      }
    } catch (error) {
      console.error("❌ Error during token refresh:", error);
      // Limpiar estado de autenticación
      api.dispatch({ type: "auth/logout" });

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
      return { error: { status: 401, data: "Token refresh failed" } };
    }
  }

  // Continuar con la request original
  let result = await baseQueryWithTokenRefresh(args, api, extraOptions);

  // Si la request falla con 401, intentar refresh y reintentar
  if (result.error && result.error.status === 401 && refreshToken) {
    console.log("🔄 Request failed with 401, attempting token refresh...");

    try {
      const refreshResult = await fetch(`${API}/refresh-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (refreshResult.ok) {
        const refreshData = await refreshResult.json();
        console.log("✅ Token refreshed after 401 error");

        // Actualizar el token en el store
        const newToken = refreshData["New access token"];
        if (newToken) {
          api.dispatch({
            type: "auth/updateToken",
            payload: newToken,
          });
          console.log("✅ Token updated in Redux store");

          // Reintentar la request original con el nuevo token
          result = await baseQueryWithTokenRefresh(args, api, extraOptions);
        }
      } else {
        console.log("❌ Token refresh failed after 401, redirecting to login");
        // Limpiar estado de autenticación
        api.dispatch({ type: "auth/logout" });

        if (typeof window !== "undefined" && window.toast) {
          window.toast.error("Authentication error. Please log in again.", {
            position: "top-right",
            autoClose: 3000,
          });
        }

        setTimeout(() => {
          window.location.href = "/auth";
        }, 1000);
        return { error: { status: 401, data: "Token expired" } };
      }
    } catch (error) {
      console.error("❌ Error during token refresh after 401:", error);
      // Limpiar estado de autenticación
      api.dispatch({ type: "auth/logout" });

      if (typeof window !== "undefined" && window.toast) {
        window.toast.error("Authentication error. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
      return { error: { status: 401, data: "Token refresh failed" } };
    }
  }

  // Si después de todo sigue fallando con 401, limpiar estado
  if (result.error && result.error.status === 401) {
    console.log("❌ Final 401 error, clearing auth state");
    api.dispatch({ type: "auth/logout" });

    if (typeof window !== "undefined" && window.toast) {
      window.toast.error("Authentication error. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }

    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  }

  return result;
};

export const pumpApi = createApi({
  reducerPath: "pumpApi",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Pump", "PumpList", "Analysis"],
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
      invalidatesTags: ["PumpList", "Analysis"],
    }),
    updatePump: builder.mutation({
      query: ({ ccn_pump, body }) => {
        // Check if body is FormData
        const isFormData = body instanceof FormData;

        return {
          url: `/pumps/${ccn_pump}`,
          method: "PATCH", // Cambiar de PUT a PATCH para actualizaciones parciales
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
      // Invalidar todas las tags relacionadas para forzar refetch
      invalidatesTags: (result, error, { ccn_pump }) => [
        { type: "Pump", id: ccn_pump },
        { type: "PumpList", id: "LIST" },
        "PumpList",
        "Analysis",
      ],
      // Optimistic update para mejor UX
      async onQueryStarted({ ccn_pump, body }, { dispatch, queryFulfilled }) {
        console.log("🚀 Starting optimistic update for pump:", ccn_pump);
        console.log(
          "📦 Body type:",
          typeof body,
          body instanceof FormData ? "FormData" : "Object"
        );

        // Optimistic update: actualizar el cache inmediatamente
        const patchResult = dispatch(
          pumpApi.util.updateQueryData("getPumps", undefined, (draft) => {
            console.log("🔄 Updating cache, draft exists:", !!draft);
            if (draft && draft.Pumps) {
              console.log("📊 Found", draft.Pumps.length, "pumps in cache");
              const pumpIndex = draft.Pumps.findIndex(
                (pump) => pump.ccn_pump === ccn_pump
              );
              console.log("🔍 Pump index found:", pumpIndex);

              if (pumpIndex !== -1) {
                // Extraer datos del FormData o del objeto body
                let updateData = {};

                if (body instanceof FormData) {
                  // Si es FormData, extraer los valores
                  for (let [key, value] of body.entries()) {
                    if (key !== "photos" && key !== "user_id") {
                      updateData[key] = value;
                      console.log(
                        "📝 Extracted from FormData:",
                        key,
                        "=",
                        value
                      );
                    }
                  }
                } else {
                  // Si es un objeto normal
                  updateData = { ...body };
                  console.log("📝 Using object data:", updateData);
                }

                // Actualizar campos específicos en el cache
                Object.keys(updateData).forEach((key) => {
                  if (
                    Object.prototype.hasOwnProperty.call(
                      draft.Pumps[pumpIndex],
                      key
                    )
                  ) {
                    const oldValue = draft.Pumps[pumpIndex][key];
                    draft.Pumps[pumpIndex][key] = updateData[key];
                    console.log(
                      "✅ Updated field:",
                      key,
                      oldValue,
                      "→",
                      updateData[key]
                    );
                  } else {
                    console.log("⚠️ Field not found in pump:", key);
                  }
                });

                console.log(
                  "🔄 Optimistic update completed for pump:",
                  ccn_pump
                );
              } else {
                console.log("❌ Pump not found in cache:", ccn_pump);
              }
            } else {
              console.log("❌ No draft or Pumps data available");
            }
          })
        );

        try {
          await queryFulfilled;
          console.log("✅ Update successful, optimistic update confirmed");
        } catch (error) {
          // Si falla, revertir el optimistic update
          patchResult.undo();
          console.log("❌ Update failed, optimistic update reverted:", error);
        }
      },
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
        "Analysis",
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
      query: (params = {}) => {
        const { page = 1, per_page = 100 } = params;
        return {
          url: `/pumps?page=${page}&per_page=${per_page}`,
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
    getAllPumps: builder.query({
      query: () => ({
        url: "/pumps/all",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.Pumps.map(({ ccn_pump }) => ({
                type: "Pump",
                id: ccn_pump,
              })),
              { type: "PumpList", id: "ALL" },
            ]
          : [{ type: "PumpList", id: "ALL" }],
      // Configuración para obtener todas las bombas
      keepUnusedDataFor: 60, // 1 minuto para datos completos
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
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
        "Analysis",
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
        "Analysis",
      ],
    }),
    // Analysis endpoints
    getPumpsSummary: builder.query({
      query: () => {
        return {
          url: "/analysis/pumps/summary",
          method: "GET",
        };
      },
      providesTags: ["Analysis"],
      keepUnusedDataFor: 60,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    }),
    getPumpsStatusDistribution: builder.query({
      query: () => {
        return {
          url: "/analysis/pumps/status-distribution",
          method: "GET",
        };
      },
      providesTags: ["Analysis"],
      keepUnusedDataFor: 60,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    }),
    getPumpsByLocation: builder.query({
      query: () => {
        return {
          url: "/analysis/pumps/location",
          method: "GET",
        };
      },
      providesTags: ["Analysis"],
      keepUnusedDataFor: 60,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    }),
    getPumpsNumericStats: builder.query({
      query: () => {
        return {
          url: "/analysis/pumps/numeric-stats",
          method: "GET",
        };
      },
      providesTags: ["Analysis"],
      keepUnusedDataFor: 60,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    }),
  }),
});

export const {
  useCreatePumpMutation,
  useUpdatePumpMutation,
  useDeletePumpMutation,
  useGetPumpQuery,
  useGetPumpsQuery,
  useGetAllPumpsQuery,
  useUploadPumpPhotosMutation,
  useDeletePumpPhotoMutation,
  useGetPumpsSummaryQuery,
  useGetPumpsStatusDistributionQuery,
  useGetPumpsByLocationQuery,
  useGetPumpsNumericStatsQuery,
} = pumpApi;

// Hook personalizado para optimizar el uso de getPumps
export const useOptimizedPumpsQuery = (params = {}, options = {}) => {
  // Extraer parámetros de paginación
  const { page = 1, per_page = 1000, ...otherOptions } = params;

  const queryResult = useGetPumpsQuery(
    { page, per_page },
    {
      // Configuración optimizada para la lista de bombas
      pollingInterval: 0, // Deshabilitar polling automático para evitar conflictos
      refetchOnMountOrArgChange: true, // Habilitar refetch automático
      refetchOnFocus: true, // Refetch cuando la ventana vuelve a estar activa
      refetchOnReconnect: true, // Refetch cuando se reconecta la red
      // Mantener datos en cache por menos tiempo para actualizaciones más frecuentes
      keepUnusedDataFor: 30, // 30 segundos
      ...otherOptions,
      ...options,
    }
  );

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

// Hooks optimizados para análisis
export const useOptimizedPumpsSummaryQuery = (options = {}) => {
  const queryResult = useGetPumpsSummaryQuery(undefined, {
    // Configuración optimizada para análisis
    pollingInterval: 30000, // Polling cada 30 segundos
    refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    refetchOnFocus: true,
    refetchOnReconnect: true,
    keepUnusedDataFor: 60,
    ...options,
  });

  return queryResult;
};

export const useOptimizedPumpsStatusDistributionQuery = (options = {}) => {
  const queryResult = useGetPumpsStatusDistributionQuery(undefined, {
    // Configuración optimizada para análisis
    pollingInterval: 30000, // Polling cada 30 segundos
    refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    refetchOnFocus: true,
    refetchOnReconnect: true,
    keepUnusedDataFor: 60,
    ...options,
  });

  return queryResult;
};

export const useOptimizedPumpsByLocationQuery = (options = {}) => {
  const queryResult = useGetPumpsByLocationQuery(undefined, {
    // Configuración optimizada para análisis
    pollingInterval: 30000, // Polling cada 30 segundos
    refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    refetchOnFocus: true,
    refetchOnReconnect: true,
    keepUnusedDataFor: 60,
    ...options,
  });

  return queryResult;
};

export const useOptimizedPumpsNumericStatsQuery = (options = {}) => {
  const queryResult = useGetPumpsNumericStatsQuery(undefined, {
    // Configuración optimizada para análisis
    pollingInterval: 30000, // Polling cada 30 segundos
    refetchOnMountOrArgChange: true, // Cambiar a true para que se ejecute al montar
    refetchOnFocus: true,
    refetchOnReconnect: true,
    keepUnusedDataFor: 60,
    ...options,
  });

  return queryResult;
};
