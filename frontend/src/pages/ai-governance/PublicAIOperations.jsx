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

const PublicAIOperations = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [streamingResponse, setStreamingResponse] = useState("");

  // Mock public tasks - In production, these would come from an API
  const publicTasks = [
    {
      id: "public-1",
      name: "Análisis de Sentimiento",
      description: "Analiza el sentimiento de un texto",
      category: "NLP",
      company: "Tech Corp",
      isPublic: true,
    },
    {
      id: "public-2",
      name: "Traducción de Texto",
      description: "Traduce texto entre múltiples idiomas",
      category: "Translation",
      company: "Global Services",
      isPublic: true,
    },
    {
      id: "public-3",
      name: "Resumen de Documento",
      description: "Genera un resumen de documentos largos",
      category: "Summarization",
      company: "Data Solutions",
      isPublic: true,
    },
  ];

  const handleExecuteTask = async (task) => {
    setSelectedTask(task);
    setIsExecuting(true);
    setResult(null);
    setStreamingResponse("");

    // Simulate task execution
    setTimeout(() => {
      setResult({
        success: true,
        output: {
          message: `Tarea "${task.name}" ejecutada exitosamente`,
          result: "Resultado de ejemplo de la tarea pública",
          timestamp: new Date().toISOString(),
        },
      });
      setIsExecuting(false);
      toast.success("Tarea ejecutada exitosamente");
    }, 2000);
  };

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
                  Operaciones Públicas
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
              <LockOpenIcon className="h-4 w-4" />
              <span>Acceso Público</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info */}
        <div className="mb-8">
          <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
            Tareas publicadas por empresas para uso público. Ejecútalas sin registro.
          </p>
        </div>

        {/* Tasks Grid - Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {publicTasks.map((task) => (
            <div
              key={task.id}
              className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6 hover:border-do_text_gray_light dark:hover:border-gray-600 transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-2">
                  {task.name}
                </h3>
                <p className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark mb-3">
                  {task.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-do_text_gray_light dark:text-do_text_gray_dark">
                  <span>{task.category}</span>
                  <span>•</span>
                  <span>{task.company}</span>
                </div>
              </div>
              <button
                onClick={() => handleExecuteTask(task)}
                disabled={isExecuting}
                className="w-full py-2 px-4 border border-do_border_light dark:border-gray-700 text-do_text_light dark:text-do_text_dark font-medium rounded hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <PlayIcon className="h-4 w-4" />
                {isExecuting && selectedTask?.id === task.id
                  ? "Ejecutando..."
                  : "Ejecutar"}
              </button>
            </div>
          ))}
        </div>

        {/* Result Display */}
        {result && selectedTask && (
          <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-4">
              Resultado: {selectedTask.name}
            </h3>
            <AIOutputFormatter
              output={result.output}
              maxHeight="max-h-96"
              showCopyButton={true}
              collapsible={false}
            />
          </div>
        )}

        {/* Streaming Response */}
        {isExecuting && streamingResponse && (
          <div className="bg-do_card_light dark:bg-do_card_dark border border-do_border_light dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-do_text_light dark:text-do_text_dark mb-4">
              Ejecutando: {selectedTask?.name}
            </h3>
            <AIOutputFormatter
              output={streamingResponse}
              maxHeight="max-h-96"
              showCopyButton={false}
              collapsible={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAIOperations;
