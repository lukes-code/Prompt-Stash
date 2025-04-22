import React, { useState } from "react";
import { Prompt, deletePrompt } from "../utils/storage";
import { TrashIcon, CopyIcon } from "lucide-react"; // Import CopyIcon from lucide-react
interface PromptListProps {
  prompts: Prompt[];
  onDelete: () => void;
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  onDelete,
}) => {
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  if (prompts.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No saved prompts yet. Add one above!
      </div>
    );
  }

  // Handle the deletion of a prompt
  const handleDelete = async (id: string) => {
    try {
      await deletePrompt(id);
      onDelete(); // Reload prompts after deletion
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  };

  const handleCopy = (text: string, id: string) => {
    setCopiedPromptId(id);
    setTimeout(() => {
      // Reset the copied prompt state after 2 seconds
      setCopiedPromptId(null);
    }, 2000); // Adjust the timeout duration as needed

    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-gray-700">Saved Prompts</h2>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-gray-50 p-3 rounded-md border border-gray-200 relative group"
          >
            <p className="text-sm text-gray-800 pr-8">{prompt.text}</p>

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
        ))}
      </div>
    </div>
  );
};
