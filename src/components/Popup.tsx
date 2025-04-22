import React, { useEffect, useState } from "react";
import { PromptForm } from "./PromptForm";
import { PromptList } from "./PromptList";
import { getPrompts, Prompt } from "../utils/storage";

export const Popup: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div className="w-80 p-4 bg-white">
      <h1 className="text-lg font-bold text-center mb-4">Prompt Saver</h1>
      <PromptForm onSave={loadPrompts} />
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading prompts...</div>
      ) : (
        <PromptList prompts={prompts} onDelete={loadPrompts} />
      )}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Visit www.example.com to use your saved prompts
      </div>
    </div>
  );
};
