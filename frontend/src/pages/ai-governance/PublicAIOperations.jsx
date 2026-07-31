/**
 * Public AI Operations
 * Minimalist design - allows anyone to execute public AI tasks
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  GlobeAltIcon,
  PlayIcon,
  ArrowLeftIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import AIOutputFormatter from "../../components/AIOutputFormatter";
import {
  useGetPublicTasksQuery,
  useGetPublicTaskQuery,
} from "../../RTK_Query_app/services/aiGovernance/aiGovernanceApi";

const PublicAIOperations = () => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);

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
        throw new Error("Unable to load the task result");
      }

      const data = await response.json();
      setResult({
        success: true,
        output: data.task?.result || data.task?.output_data || data.task,
      });
      toast.success("Task loaded successfully");
    } catch (err) {
      toast.error(err.message || "Error executing task");
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
                className="p-1 hover:bg-do_card_light dark:hover:bg-do_card_dark rounded transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-do_text_light dark:text-do_text_dark" />
              </Link>
              <div className="flex items-center gap-3">
                <GlobeAltIcon className="h-6 w-6 text-do_text_light dark:text-do_text_dark" />
                <span className="text-lg font-medium text-do_text_light dark:text-do_text_dark">
                  Public Operations
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
              <LockOpenIcon className="h-4 w-4" />
              <span>Public Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info */}
        <div className="mb-8">
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Tasks published by companies for public use. Run them without signing in.
          </p>
        </div>

        {/* Tasks Grid - Minimalist */}
        {isLoading && (
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Loading public tasks...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            Could not load public tasks.
          </p>
        )}

        {!isLoading && !error && publicTasks.length === 0 && (
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            No public tasks are available at the moment.
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
                  {task.description || "AI task published for public use"}
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
                  ? "Running..."
                  : "View result"}
              </button>
            </div>
          ))}
        </div>

        {/* Result Display */}
        {result && selectedTask && (
          <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-4">
              Result: {selectedTask.task_name || selectedTask.task_type}
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
