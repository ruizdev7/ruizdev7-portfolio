import { useMultiTabSync } from "../hooks/useMultiTabSync";

const MultiTabStatus = () => {
  const { authState, isTokenExpiring, updateActivity } = useMultiTabSync();

  return (
    <div className="fixed hidden md:block bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        🔄 Multi-Tab Status
      </h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span
            className={`font-medium ${
              authState.current_user?.token
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {authState.current_user?.token
              ? "🟢 Logged In"
              : "🔴 Not Logged In"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Token Status:
          </span>
          <span
            className={`font-medium ${
              isTokenExpiring
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {isTokenExpiring ? "⚠️ Expiring Soon" : "✅ Valid"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">User:</span>
          <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
            {authState.current_user?.user_info?.email || "Not logged in"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Last Activity:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(
              authState.lastActivity || Date.now()
            ).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <button
        onClick={updateActivity}
        className="mt-3 w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
      >
        Update Activity
      </button>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        💡 Try opening multiple tabs to see sync in action
      </div>
    </div>
  );
};

export default MultiTabStatus;
