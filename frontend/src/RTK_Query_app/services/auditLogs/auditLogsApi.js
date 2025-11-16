import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Function to get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem("jwt_token");
  return token ? `Bearer ${token}` : "";
};

export const auditLogsApi = createApi({
  reducerPath: "auditLogsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api/v1/",
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set("authorization", token);
      }
      return headers;
    },
  }),
  tagTypes: ["AuditLogs"],
  endpoints: (builder) => ({
    // Get all audit logs with pagination and filters
    getAuditLogs: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          per_page = 50,
          user_id,
          event_type,
          resource,
          action,
        } = params;
        const queryParams = new URLSearchParams();
        if (page) queryParams.append("page", page);
        if (per_page) queryParams.append("per_page", per_page);
        if (user_id) queryParams.append("user_id", user_id);
        if (event_type) queryParams.append("event_type", event_type);
        if (resource) queryParams.append("resource", resource);
        if (action) queryParams.append("action", action);
        return `audit-logs?${queryParams.toString()}`;
      },
      providesTags: ["AuditLogs"],
    }),

    // Get a specific audit log
    getAuditLog: builder.query({
      query: (logId) => `audit-logs/${logId}`,
      providesTags: ["AuditLogs"],
    }),

    // Get current user's audit logs
    getMyAuditLogs: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          per_page = 50,
          event_type,
          resource,
          action,
        } = params;
        const queryParams = new URLSearchParams();
        if (page) queryParams.append("page", page);
        if (per_page) queryParams.append("per_page", per_page);
        if (event_type) queryParams.append("event_type", event_type);
        if (resource) queryParams.append("resource", resource);
        if (action) queryParams.append("action", action);
        return `audit-logs/my-logs?${queryParams.toString()}`;
      },
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditLogQuery,
  useGetMyAuditLogsQuery,
} = auditLogsApi;
