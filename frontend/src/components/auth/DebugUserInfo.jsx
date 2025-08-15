import { useSelector } from "react-redux";

const DebugUserInfo = () => {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const roles = useSelector((state) => state.auth.roles);
  const permissions = useSelector((state) => state.auth.permissions);
  const token = useSelector((state) => state.auth.token);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-300 dark:border-gray-600">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        🔍 Debug - Estado de Autenticación
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado General:
          </h4>
          <div className="space-y-1">
            <p>
              <span className="font-medium">Autenticado:</span>{" "}
              <span
                className={isAuthenticated ? "text-green-600" : "text-red-600"}
              >
                {isAuthenticated ? "✅ Sí" : "❌ No"}
              </span>
            </p>
            <p>
              <span className="font-medium">Token:</span>{" "}
              <span className={token ? "text-green-600" : "text-red-600"}>
                {token ? "✅ Presente" : "❌ Ausente"}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Usuario:
          </h4>
          {user ? (
            <div className="space-y-1">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Nombre:</span> {user.first_name}{" "}
                {user.last_name}
              </p>
              <p>
                <span className="font-medium">ID:</span> {user.ccn_user}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No hay usuario autenticado</p>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Roles ({roles.length}):
          </h4>
          {roles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {role.role_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Sin roles asignados</p>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            Permisos ({permissions.length}):
          </h4>
          {permissions.length > 0 ? (
            <div className="max-h-20 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                    title={`${permission.resource}.${permission.action}`}
                  >
                    {permission.resource}.{permission.action}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Sin permisos asignados</p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
        <p className="text-xs text-gray-500">
          💡 Este componente es temporal para debugging. Puedes eliminarlo
          cuando todo funcione correctamente.
        </p>
      </div>
    </div>
  );
};

export default DebugUserInfo;
