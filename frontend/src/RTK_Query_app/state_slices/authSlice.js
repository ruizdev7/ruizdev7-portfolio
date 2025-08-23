import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Solo datos básicos del usuario (sin información sensible)
  user: null,
  // Tokens de autenticación
  token: localStorage.getItem("jwt_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  // Estado de autenticación
  isAuthenticated: false,
  isLoading: false,
  error: null,
  // Roles y permisos (solo nombres, no IDs)
  roles: [],
  permissions: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Inicializar estado desde localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem("jwt_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (token && refreshToken) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        // Nota: El usuario, roles y permisos se cargarán desde el backend
        // cuando se haga la primera petición autenticada
      }
    },

    // Login exitoso - Solo almacenar datos seguros
    loginSuccess: (state, action) => {
      const { current_user } = action.payload;

      // Solo almacenar datos básicos del usuario
      state.user = {
        ccn_user: current_user.user_info.ccn_user,
        first_name: current_user.user_info.first_name,
        middle_name: current_user.user_info.middle_name,
        last_name: current_user.user_info.last_name,
        email: current_user.user_info.email,
        created_at: current_user.user_info.created_at,
      };

      // Tokens de autenticación
      state.token = current_user.token;
      state.refreshToken = current_user.refresh_token;

      // Solo nombres de roles (sin IDs)
      state.roles = (current_user.roles || []).map((role) => ({
        role_name: role.role_name,
      }));

      // Solo información básica de permisos
      state.permissions = (current_user.permissions || []).map(
        (permission) => ({
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
        })
      );

      state.isAuthenticated = true;
      state.error = null;

      // Guardar solo tokens en localStorage
      localStorage.setItem("jwt_token", current_user.token);
      localStorage.setItem("refresh_token", current_user.refresh_token);
    },

    // Logout - Limpiar todo
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.roles = [];
      state.permissions = [];
      state.isAuthenticated = false;
      state.error = null;

      // Limpiar localStorage
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_state");
    },

    // Actualizar permisos del usuario (solo datos seguros)
    updateUserPermissions: (state, action) => {
      state.permissions = (action.payload.permissions || []).map(
        (permission) => ({
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
        })
      );
      state.roles = (action.payload.roles || []).map((role) => ({
        role_name: role.role_name,
      }));
    },

    // Actualizar token
    updateToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("jwt_token", action.payload);
    },

    // Establecer error
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Limpiar error
    clearError: (state) => {
      state.error = null;
    },

    // Establecer loading
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  initializeAuth,
  loginSuccess,
  logout,
  updateUserPermissions,
  updateToken,
  setError,
  clearError,
  setLoading,
} = authSlice.actions;

// Selectores
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectRoles = (state) => state.auth.roles;
export const selectPermissions = (state) => state.auth.permissions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

// Funciones helper para verificar permisos y roles (más seguras)
export const checkPermission = (permissions, resource, action) => {
  return permissions.some(
    (permission) =>
      permission.resource === resource && permission.action === action
  );
};

export const checkRole = (roles, roleName) => {
  return roles.some((role) => role.role_name === roleName);
};

export const checkAnyRole = (roles, roleNames) => {
  return roles.some((role) => roleNames.includes(role.role_name));
};

export const checkAllRoles = (roles, roleNames) => {
  return roleNames.every((roleName) =>
    roles.some((role) => role.role_name === roleName)
  );
};

export default authSlice.reducer;
