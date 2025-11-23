/**
 * AI Output Formatter Component
 * Formats AI responses with syntax highlighting, JSON formatting, and markdown support
 */

import { useState } from "react";
import {
  DocumentDuplicateIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const AIOutputFormatter = ({
  output,
  maxHeight = "max-h-96",
  showCopyButton = true,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (!output) return null;

  // Try to parse as JSON if it's a string
  let parsedOutput = output;
  let outputType = "text";
  let isJSON = false;

  if (typeof output === "string") {
    // Check if it looks like JSON
    const trimmed = output.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        parsedOutput = JSON.parse(output);
        isJSON = true;
        outputType = "json";
      } catch (e) {
        // Not valid JSON, treat as text
        outputType = "text";
      }
    } else if (trimmed.startsWith("#") || trimmed.includes("```")) {
      // Looks like markdown
      outputType = "markdown";
    } else {
      outputType = "text";
    }
  } else if (typeof output === "object") {
    isJSON = true;
    outputType = "json";
  }

  const handleCopy = async () => {
    const textToCopy =
      typeof output === "string"
        ? output
        : JSON.stringify(output, null, 2);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatJSON = (obj, indent = 0) => {
    if (obj === null) return <span className="text-purple-600 dark:text-purple-400">null</span>;
    if (typeof obj === "string") return <span className="text-green-600 dark:text-green-400">"{obj}"</span>;
    if (typeof obj === "number") return <span className="text-blue-600 dark:text-blue-400">{obj}</span>;
    if (typeof obj === "boolean") return <span className="text-orange-600 dark:text-orange-400">{String(obj)}</span>;
    if (typeof obj !== "object") return <span>{String(obj)}</span>;
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return <span className="text-gray-500">[]</span>;
      return (
        <span>
          <span className="text-gray-500">[</span>
          <br />
          {obj.map((item, idx) => (
            <div key={idx} className="ml-4">
              {formatJSON(item, indent + 1)}
              {idx < obj.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <br />
          <span className="text-gray-500">]</span>
        </span>
      );
    }
    
    const keys = Object.keys(obj);
    if (keys.length === 0) return <span className="text-gray-500">{}</span>;
    return (
      <span>
        <span className="text-gray-500">{"{"}</span>
        <br />
        {keys.map((key, idx) => (
          <div key={key} className="ml-4">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">"{key}"</span>
            <span className="text-gray-500">: </span>
            {formatJSON(obj[key], indent + 1)}
            {idx < keys.length - 1 && <span className="text-gray-500">,</span>}
          </div>
        ))}
        <br />
        <span className="text-gray-500">{"}"}</span>
      </span>
    );
  };

  const formatMarkdown = (text) => {
    // Simple markdown rendering
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-2xl font-bold mt-4 mb-2 text-do_text_light dark:text-do_text_dark">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xl font-semibold mt-3 mb-2 text-do_text_light dark:text-do_text_dark">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-lg font-semibold mt-2 mb-1 text-do_text_light dark:text-do_text_dark">
            {line.substring(4)}
          </h3>
        );
      }
      // Bold
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={idx} className="mb-2 text-do_text_light dark:text-do_text_dark">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i}>{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        );
      }
      // Code blocks
      if (line.startsWith("```")) {
        return null; // Skip code block markers for now
      }
      // List items
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 mb-1 text-do_text_light dark:text-do_text_dark">
            {line.substring(2)}
          </li>
        );
      }
      // Regular text
      if (line.trim()) {
        return (
          <p key={idx} className="mb-2 text-do_text_light dark:text-do_text_dark">
            {line}
          </p>
        );
      }
      return <br key={idx} />;
    });
  };

  const renderContent = () => {
    if (outputType === "json" && isJSON) {
      return (
        <div className="font-mono text-sm leading-relaxed">
          {formatJSON(parsedOutput)}
        </div>
      );
    } else if (outputType === "markdown") {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-do_text_light dark:text-do_text_dark">
          {formatMarkdown(typeof output === "string" ? output : JSON.stringify(output))}
        </div>
      );
    } else {
      // Plain text - try to detect if it's actually JSON that failed to parse
      const text = typeof output === "string" ? output : JSON.stringify(output, null, 2);
      
      // Check if it looks like JSON but wasn't parsed (incomplete JSON from streaming)
      const trimmed = text.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && !trimmed.endsWith("}") && !trimmed.endsWith("]")) {
        // Likely incomplete JSON from streaming
        return (
          <div className="text-sm text-do_text_light dark:text-do_text_dark whitespace-pre-wrap break-words font-mono">
            {text}
            <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
          </div>
        );
      }
      
      return (
        <div className="text-sm text-do_text_light dark:text-do_text_dark whitespace-pre-wrap break-words">
          {text}
        </div>
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900/40 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
            {outputType === "json" && "📊 JSON"}
            {outputType === "markdown" && "📝 Markdown"}
            {outputType === "text" && "📄 Text"}
          </span>
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
            >
              {isCollapsed ? (
                <ChevronDownIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronUpIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          )}
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
            title="Copiar al portapapeles"
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="h-4 w-4" />
                <span>Copiar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div
          className={`p-4 ${maxHeight} overflow-y-auto bg-white dark:bg-gray-900/50`}
        >
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default AIOutputFormatter;

