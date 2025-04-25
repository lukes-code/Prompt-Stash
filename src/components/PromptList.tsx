import React, { useState } from "react";
import { Prompt, deletePrompt } from "../utils/storage";
import { TrashIcon, CopyIcon } from "lucide-react";

interface PromptListProps {
  prompts: Prompt[];
  onDelete: () => void;
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  onDelete,
}) => {
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);

  if (prompts.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No saved prompts yet. Add one above!
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePrompt(id);
      onDelete();
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  };

  const handleCopy = (text: string, id: string) => {
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
    navigator.clipboard.writeText(text);
  };

  const toggleExpanded = (id: string) => {
    setExpandedPromptId(expandedPromptId === id ? null : id);
  };

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-700">Saved prompts</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {prompts.map((prompt) => {
          const isExpanded = expandedPromptId === prompt.id;
          return (
            <div
              key={prompt.id}
              className="bg-gray-50 p-3 rounded-md border border-gray-200 relative group"
            >
              <div
                className={`text-sm text-gray-800 pr-8 ${
                  isExpanded ? "" : "line-clamp-3"
                }`}
              >
                {prompt.text}
              </div>

              {/* Toggle button */}
              {prompt.text.length > 100 && (
                <button
                  onClick={() => toggleExpanded(prompt.id)}
                  className="text-xs text-blue-500 mt-1"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}

              {/* Copy button */}
              <button
                onClick={() => handleCopy(prompt.text, prompt.id)}
                className={`absolute top-2 right-8 text-gray-400 hover:text-blue-500 cursor-pointer ${
                  copiedPromptId === prompt.id ? "text-green-500" : ""
                }`}
                title="Copy prompt"
              >
                <CopyIcon size={16} />
              </button>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(prompt.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 cursor-pointer"
                title="Delete prompt"
              >
                <TrashIcon size={16} />
              </button>

              <div className="text-xs text-gray-400 mt-1">
                {new Date(prompt.createdAt).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
