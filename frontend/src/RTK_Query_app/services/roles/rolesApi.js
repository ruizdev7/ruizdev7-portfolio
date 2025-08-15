import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Función para obtener el token del localStorage
const getAuthToken = () => {
  const token = localStorage.getItem("jwt_token");
  return token ? `Bearer ${token}` : "";
};

export const rolesApi = createApi({
  reducerPath: "rolesApi",
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
  tagTypes: ["Roles", "Permissions", "UserRoles", "UserPermissions"],
  endpoints: (builder) => ({
    // Obtener todos los roles
    getRoles: builder.query({
      query: () => "roles",
      providesTags: ["Roles"],
    }),

    // Crear nuevo rol
    createRole: builder.mutation({
      query: (roleData) => ({
        url: "roles",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: ["Roles"],
    }),

    // Actualizar rol
    updateRole: builder.mutation({
      query: ({ roleId, roleData }) => ({
        url: `roles/${roleId}`,
        method: "PUT",
        body: roleData,
      }),
      invalidatesTags: ["Roles"],
    }),

    // Eliminar rol
    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `roles/${roleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles", "UserRoles"],
    }),

    // Obtener todos los permisos
    getPermissions: builder.query({
      query: () => "permissions",
      providesTags: ["Permissions"],
    }),

    // Obtener permisos de un rol específico
    getRolePermissions: builder.query({
      query: (roleId) => `roles/${roleId}/permissions`,
      providesTags: ["Permissions"],
    }),

    // Asignar permiso a un rol
    assignPermissionToRole: builder.mutation({
      query: ({ roleId, permissionId }) => ({
        url: `roles/${roleId}/permissions`,
        method: "POST",
        body: { permission_id: permissionId },
      }),
      invalidatesTags: ["Permissions"],
    }),

    // Remover permiso de un rol
    removePermissionFromRole: builder.mutation({
      query: ({ roleId, permissionId }) => ({
        url: `roles/${roleId}/permissions/${permissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Permissions"],
    }),

    // Obtener roles de un usuario
    getUserRoles: builder.query({
      query: (userId) => `users/${userId}/roles`,
      providesTags: ["UserRoles"],
    }),

    // Asignar rol a un usuario
    assignRoleToUser: builder.mutation({
      query: ({ userId, roleName }) => ({
        url: `users/${userId}/roles`,
        method: "POST",
        body: { role_name: roleName },
      }),
      invalidatesTags: ["UserRoles", "UserPermissions"],
    }),

    // Remover rol de un usuario
    removeRoleFromUser: builder.mutation({
      query: ({ userId, roleName }) => ({
        url: `users/${userId}/roles/${roleName}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserRoles", "UserPermissions"],
    }),

    // Obtener permisos de un usuario
    getUserPermissions: builder.query({
      query: (userId) => `users/${userId}/permissions`,
      providesTags: ["UserPermissions"],
    }),

    // Obtener mis permisos (usuario actual)
    getMyPermissions: builder.query({
      query: () => "my-permissions",
      providesTags: ["UserPermissions"],
    }),

    // Inicializar roles y permisos por defecto
    initializeRoles: builder.mutation({
      query: () => ({
        url: "initialize-roles",
        method: "POST",
      }),
      invalidatesTags: ["Roles", "Permissions"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useGetUserRolesQuery,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
  useGetUserPermissionsQuery,
  useGetMyPermissionsQuery,
  useInitializeRolesMutation,
} = rolesApi;
