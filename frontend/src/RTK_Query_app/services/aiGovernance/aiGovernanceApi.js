/**
 * RTK Query API for AI Governance Platform
 * Handles AI agents, tasks, approvals, and policies
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const aiGovernanceApi = createApi({
  reducerPath: 'aiGovernanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['AIAgent', 'AITask', 'Approval', 'Policy', 'Dashboard', 'Blockchain'],
  endpoints: (builder) => ({
    
    // ============================================================================
    // AI Agents Endpoints
    // ============================================================================
    
    getAgents: builder.query({
      query: () => '/ai/agents',
      providesTags: ['AIAgent'],
    }),
    
    getAgent: builder.query({
      query: (agentId) => `/ai/agents/${agentId}`,
      providesTags: (result, error, agentId) => [{ type: 'AIAgent', id: agentId }],
    }),
    
    createAgent: builder.mutation({
      query: (agentData) => ({
        url: '/ai/agents',
        method: 'POST',
        body: agentData,
      }),
      invalidatesTags: ['AIAgent', 'Dashboard'],
    }),
    
    updateAgent: builder.mutation({
      query: ({ agentId, ...agentData }) => ({
        url: `/ai/agents/${agentId}`,
        method: 'PUT',
        body: agentData,
      }),
      invalidatesTags: (result, error, { agentId }) => [
        { type: 'AIAgent', id: agentId },
        'AIAgent',
      ],
    }),
    
    deleteAgent: builder.mutation({
      query: (agentId) => ({
        url: `/ai/agents/${agentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AIAgent', 'Dashboard'],
    }),
    
    // ============================================================================
    // AI Tasks Endpoints
    // ============================================================================
    
    getTasks: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.agent_id) params.append('agent_id', filters.agent_id);
        return `/ai/tasks?${params.toString()}`;
      },
      providesTags: ['AITask'],
    }),
    
    getTask: builder.query({
      query: (taskId) => `/ai/tasks/${taskId}`,
      providesTags: (result, error, taskId) => [{ type: 'AITask', id: taskId }],
    }),
    
    executeTask: builder.mutation({
      query: (taskData) => ({
        url: '/ai/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['AITask', 'Dashboard', 'Approval'],
    }),
    
    // ============================================================================
    // Human Approvals Endpoints
    // ============================================================================
    
    getApprovals: builder.query({
      query: ({ assignedOnly = false, status = 'pending' } = {}) => {
        const params = new URLSearchParams();
        params.append('assigned_only', assignedOnly.toString());
        if (status) params.append('status', status);
        return `/ai/approvals?${params.toString()}`;
      },
      providesTags: ['Approval'],
    }),
    
    getApproval: builder.query({
      query: (approvalId) => `/ai/approvals/${approvalId}`,
      providesTags: (result, error, approvalId) => [{ type: 'Approval', id: approvalId }],
    }),
    
    approveTask: builder.mutation({
      query: ({ approvalId, justification, modifiedOutput }) => ({
        url: `/ai/approvals/${approvalId}/approve`,
        method: 'POST',
        body: {
          justification,
          modified_output: modifiedOutput,
        },
      }),
      invalidatesTags: (result, error, { approvalId }) => [
        { type: 'Approval', id: approvalId },
        'Approval',
        'AITask',
        'Dashboard',
        'Blockchain',
      ],
    }),
    
    rejectTask: builder.mutation({
      query: ({ approvalId, justification }) => ({
        url: `/ai/approvals/${approvalId}/reject`,
        method: 'POST',
        body: { justification },
      }),
      invalidatesTags: (result, error, { approvalId }) => [
        { type: 'Approval', id: approvalId },
        'Approval',
        'AITask',
        'Dashboard',
        'Blockchain',
      ],
    }),
    
    // ============================================================================
    // Policies Endpoints
    // ============================================================================
    
    getPolicies: builder.query({
      query: () => '/ai/policies',
      providesTags: ['Policy'],
    }),
    
    createPolicy: builder.mutation({
      query: (policyData) => ({
        url: '/ai/policies',
        method: 'POST',
        body: policyData,
      }),
      invalidatesTags: ['Policy'],
    }),
    
    updatePolicy: builder.mutation({
      query: ({ policyId, ...policyData }) => ({
        url: `/ai/policies/${policyId}`,
        method: 'PUT',
        body: policyData,
      }),
      invalidatesTags: (result, error, { policyId }) => [
        { type: 'Policy', id: policyId },
        'Policy',
      ],
    }),
    
    deletePolicy: builder.mutation({
      query: (policyId) => ({
        url: `/ai/policies/${policyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Policy'],
    }),
    
    // ============================================================================
    // Dashboard & Compliance Endpoints
    // ============================================================================
    
    getDashboardStats: builder.query({
      query: () => '/ai/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    
    getBlockchainAudit: builder.query({
      query: ({ eventType, limit = 50 } = {}) => {
        const params = new URLSearchParams();
        if (eventType) params.append('event_type', eventType);
        params.append('limit', limit.toString());
        return `/ai/blockchain/audit?${params.toString()}`;
      },
      providesTags: ['Blockchain'],
    }),
  }),
});

export const {
  // AI Agents
  useGetAgentsQuery,
  useGetAgentQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  
  // AI Tasks
  useGetTasksQuery,
  useGetTaskQuery,
  useExecuteTaskMutation,
  
  // Approvals
  useGetApprovalsQuery,
  useGetApprovalQuery,
  useApproveTaskMutation,
  useRejectTaskMutation,
  
  // Policies
  useGetPoliciesQuery,
  useCreatePolicyMutation,
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
  
  // Dashboard & Compliance
  useGetDashboardStatsQuery,
  useGetBlockchainAuditQuery,
} = aiGovernanceApi;

