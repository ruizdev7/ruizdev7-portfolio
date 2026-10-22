/**
 * Public AI Operations
 * Minimalist design - allows anyone to execute public AI tasks
 */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  GlobeAltIcon,
  PlayIcon,
  ArrowLeftIcon,
  LockOpenIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import AIOutputFormatter from "../../components/AIOutputFormatter";
import LanguageSelector from "../../components/LanguageSelector";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  checkPermission,
  checkRole,
  selectPermissions,
  selectRoles,
} from "../../RTK_Query_app/state_slices/authSlice";
import {
  useGetPublicTasksQuery,
  useGetPublicTaskQuery,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";

const PublicAIOperations = () => {
  const navigate = useNavigate();
  const roles = useSelector(selectRoles) || [];
  const permissions = useSelector(selectPermissions) || [];
  const { t, language } = useLanguage();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);

  const isGuest = checkRole(roles, "guest");
  const hasAiAccess =
    checkPermission(permissions, "ai_agents", "read") ||
    checkPermission(permissions, "ai_tasks", "read") ||
    checkPermission(permissions, "approvals", "read") ||
    checkPermission(permissions, "approvals", "approve");

  useEffect(() => {
    if (isGuest && !hasAiAccess) {
      toast.info(t("public.guestNotice"), {
        toastId: `ai-governance-public-access-${language}`,
      });
    }
  }, [isGuest, hasAiAccess, language, t]);

  const handleFullAccess = () => {
    const accessType =
      localStorage.getItem("ai_governance_access_type") === "employee"
        ? "employee"
        : "company";
    const destination = `/ai-governance/dashboard?type=${accessType}`;

    if (hasAiAccess) {
      navigate(destination);
      return;
    }

    toast.info(t("public.loginRequired"));
    navigate("/auth/login", { state: { from: destination } });
  };

  const {
    data: publicTasksData,
    isLoading,
    error,
  } = useGetPublicTasksQuery();
  const { data: taskDetailData } = useGetPublicTaskQuery(selectedTaskId, {
    skip: !selectedTaskId,
  });

  const publicTasks = publicTasksData?.tasks || [];

  const handleExecuteTask = async (task) => {
    setSelectedTaskId(task.task_id);
    setIsExecuting(true);
    setResult(null);

    try {
      const response = await fetch(`/api/v1/ai/public/tasks/${task.task_id}`);
      if (!response.ok) {
        throw new Error(t("public.taskLoadError"));
      }

      const data = await response.json();
      setResult({
        success: true,
        output: data.task?.result || data.task?.output_data || data.task,
      });
      toast.success(t("public.taskLoaded"));
    } catch (err) {
      toast.error(err.message || t("public.taskLoadError"));
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedTask =
    taskDetailData?.task ||
    publicTasks.find((task) => task.task_id === selectedTaskId);

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark">
      {/* Minimal Header */}
      <div className="border-b border-do_border_light dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/ai-governance"
                aria-label={t("public.backLabel")}
                className="p-1 hover:bg-do_card_light dark:hover:bg-do_card_dark rounded transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-do_text_light dark:text-do_text_dark" />
              </Link>
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="h-6 w-6 text-do_text_light dark:text-do_text_dark" />
                <span className="text-lg font-medium text-do_text_light dark:text-do_text_dark">
                  {t("public.title")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                <LockOpenIcon className="h-4 w-4" />
                <span>{t("public.access")}</span>
              </div>
              <LanguageSelector />
              <button
                type="button"
                onClick={handleFullAccess}
                className="inline-flex items-center gap-2 rounded-lg border border-do_border_light dark:border-gray-700 px-3 py-2 text-sm font-medium text-do_text_light dark:text-do_text_dark hover:bg-do_card_light dark:hover:bg-do_card_dark transition-colors"
              >
                <LockClosedIcon className="h-4 w-4" />
                {hasAiAccess
                  ? t("public.openDashboard")
                  : t("public.fullAccess")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info */}
        <div className="mb-8">
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            {t("public.description")}
          </p>
        </div>

        {/* Tasks Grid - Minimalist */}
        {isLoading && (
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            {t("public.loading")}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {t("public.loadError")}
          </p>
        )}

        {!isLoading && !error && publicTasks.length === 0 && (
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            {t("public.empty")}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {publicTasks.map((task) => (
            <div
              key={task.task_id}
              className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6 hover:border-do_text_gray_light dark:hover:border-gray-600 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-2">
                  {task.task_name || task.task_type}
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark mb-3">
                  {task.description || t("public.defaultDescription")}
                </p>
                <div className="flex items-center gap-2 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                  <span>{task.task_type}</span>
                  <span>•</span>
                  <span>{task.status}</span>
                </div>
              </div>
              <button
                onClick={() => handleExecuteTask(task)}
                disabled={isExecuting}
                className="w-full py-2 px-4 border border-do_border_light dark:border-gray-700 text-do_text_light dark:text-do_text_dark font-medium rounded hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <PlayIcon className="h-4 w-4" />
                {isExecuting && selectedTaskId === task.task_id
                  ? t("public.running")
                  : t("public.viewResult")}
              </button>
            </div>
          ))}
        </div>

        {/* Result Display */}
        {result && selectedTask && (
          <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-4">
              {t("public.result")}: {selectedTask.task_name || selectedTask.task_type}
            </h3>
            <AIOutputFormatter
              output={result.output}
              maxHeight="max-h-96"
              showCopyButton={true}
              collapsible={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAIOperations;
