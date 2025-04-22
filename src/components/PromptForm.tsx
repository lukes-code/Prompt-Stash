import React, { useState } from "react";
import { savePrompt } from "../utils/storage";
interface PromptFormProps {
  onSave: () => void;
}
export const PromptForm: React.FC<PromptFormProps> = ({ onSave }) => {
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSaving(true);
    try {
      await savePrompt(text.trim());
      setText("");
      onSave();
    } catch (error) {
      console.error("Failed to save prompt:", error);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Save a new prompt
        </label>
        <textarea
          id="prompt"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your prompt here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSaving || !text.trim()}
        className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save Prompt"}
      </button>
    </form>
  );
};
