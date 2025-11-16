import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const financialCalculatorApi = createApi({
  reducerPath: "financialCalculatorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["FinancialCalculation"],
  endpoints: (builder) => ({
    // Obtener tipos de cálculos disponibles
    getCalculationTypes: builder.query({
      query: () => "/financial-calculator/types",
      providesTags: ["FinancialCalculation"],
    }),

    // Crear nuevo cálculo
    createCalculation: builder.mutation({
      query: (calculationData) => ({
        url: "/financial-calculator",
        method: "POST",
        body: calculationData,
      }),
      invalidatesTags: ["FinancialCalculation"],
    }),

    // Obtener todos los cálculos del usuario
    getCalculations: builder.query({
      query: ({ page = 1, per_page = 10, type } = {}) => {
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("per_page", per_page);
        if (type) params.append("type", type);

        return `/financial-calculator?${params.toString()}`;
      },
      providesTags: ["FinancialCalculation"],
    }),

    // Obtener un cálculo específico
    getCalculationById: builder.query({
      query: (id) => `/financial-calculator/${id}`,
      providesTags: (result, error, id) => [
        { type: "FinancialCalculation", id },
      ],
    }),

    // Actualizar un cálculo
    updateCalculation: builder.mutation({
      query: ({ id, ...calculationData }) => ({
        url: `/financial-calculator/${id}`,
        method: "PUT",
        body: calculationData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FinancialCalculation", id },
        "FinancialCalculation",
      ],
    }),

    // Eliminar un cálculo
    deleteCalculation: builder.mutation({
      query: (id) => ({
        url: `/financial-calculator/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "FinancialCalculation", id },
        "FinancialCalculation",
      ],
    }),
  }),
});

export const {
  useGetCalculationTypesQuery,
  useCreateCalculationMutation,
  useGetCalculationsQuery,
  useGetCalculationByIdQuery,
  useUpdateCalculationMutation,
  useDeleteCalculationMutation,
} = financialCalculatorApi;
