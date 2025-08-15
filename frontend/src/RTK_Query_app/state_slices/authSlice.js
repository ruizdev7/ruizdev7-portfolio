import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("jwt_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  roles: [],
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
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

    // Login exitoso
    loginSuccess: (state, action) => {
      const { current_user } = action.payload;
      state.user = current_user.user_info;
      state.token = current_user.token;
      state.refreshToken = current_user.refresh_token;
      state.roles = current_user.roles || [];
      state.permissions = current_user.permissions || [];
      state.isAuthenticated = true;
      state.error = null;

      // Guardar en localStorage
      localStorage.setItem("jwt_token", current_user.token);
      localStorage.setItem("refresh_token", current_user.refresh_token);
    },

    // Logout
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
    },

    // Actualizar permisos del usuario
    updateUserPermissions: (state, action) => {
      state.permissions = action.payload.permissions || [];
      state.roles = action.payload.roles || [];
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

    // Verificar si el usuario tiene un permiso específico
    hasPermission: (state, action) => {
      const { resource, action: actionName } = action.payload;
      return state.permissions.some(
        (permission) =>
          permission.resource === resource && permission.action === actionName
      );
    },

    // Verificar si el usuario tiene un rol específico
    hasRole: (state, action) => {
      const roleName = action.payload;
      return state.roles.some((role) => role.role_name === roleName);
    },

    // Verificar si el usuario tiene cualquiera de los roles especificados
    hasAnyRole: (state, action) => {
      const roleNames = action.payload;
      return state.roles.some((role) => roleNames.includes(role.role_name));
    },

    // Verificar si el usuario tiene todos los roles especificados
    hasAllRoles: (state, action) => {
      const roleNames = action.payload;
      return roleNames.every((roleName) =>
        state.roles.some((role) => role.role_name === roleName)
      );
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

// Funciones helper para verificar permisos y roles
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
