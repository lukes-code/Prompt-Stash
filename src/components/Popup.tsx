import React, { useEffect, useState } from "react";
import { PromptForm } from "./PromptForm";
import { PromptList } from "./PromptList";
import { getPrompts, Prompt } from "../utils/storage";

export const Popup: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSave, setShowSave] = useState(true);
  const [showPaste, setShowPaste] = useState(true);

  const loadPrompts = async () => {
    try {
      const savedPrompts = await getPrompts();
      setPrompts(savedPrompts.reverse()); // Newest first
      setLoading(false);
    } catch (error) {
      console.error("Failed to load prompts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
    chrome.storage.sync.get(["showSave", "showPaste"], (result) => {
      setShowSave(result.showSave !== false); // Default to true
      setShowPaste(result.showPaste !== false);
    });
  }, []);

  const handleToggle = (key: "showSave" | "showPaste", value: boolean) => {
    chrome.storage.sync.set({ [key]: value });
    key === "showSave" ? setShowSave(value) : setShowPaste(value);
  };

  return (
    <div className="w-80 p-4 rounded bg-white">
      <h1 className="text-lg font-bold text-center mb-4">Prompt Saver</h1>
      <PromptForm onSave={loadPrompts} />
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading prompts...</div>
      ) : (
        <PromptList prompts={prompts} onDelete={loadPrompts} />
      )}

      <div className="mt-4">
        <h2 className="text-sm font-semibold mb-2">Settings</h2>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="toggleSave" className="text-sm">
            Show Save Button
          </label>
          <input
            id="toggleSave"
            type="checkbox"
            checked={showSave}
            onChange={(e) => handleToggle("showSave", e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="togglePaste" className="text-sm">
            Show Paste Button
          </label>
          <input
            id="togglePaste"
            type="checkbox"
            checked={showPaste}
            onChange={(e) => handleToggle("showPaste", e.target.checked)}
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Visit www.example.com to use your saved prompts
      </div>
    </div>
  );
};
