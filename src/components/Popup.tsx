import React, { useEffect, useState } from "react";
import { PromptForm } from "./PromptForm";
import { PromptList } from "./PromptList";
import { getPrompts, Prompt } from "../utils/storage";

export const Popup: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSave, setShowSave] = useState(true);
  const [showPaste, setShowPaste] = useState(true);
  const [, setEnableSaveShortcut] = useState(true);
  const [, setEnablePasteShortcut] = useState(true);

  const loadPrompts = async () => {
    try {
      const savedPrompts = await getPrompts();
      setPrompts(savedPrompts.reverse());
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
    chrome.storage.sync.get(
      ["showSave", "showPaste", "enableSaveShortcut", "enablePasteShortcut"],
      (result) => {
        setShowSave(result.showSave !== false);
        setShowPaste(result.showPaste !== false);
        setEnableSaveShortcut(result.enableSaveShortcut !== false);
        setEnablePasteShortcut(result.enablePasteShortcut !== false);
      }
    );
  }, []);

  const handleToggle = (
    key:
      | "showSave"
      | "showPaste"
      | "enableSaveShortcut"
      | "enablePasteShortcut",
    value: boolean
  ) => {
    chrome.storage.sync.set({ [key]: value });
    if (key === "showSave") setShowSave(value);
    else if (key === "showPaste") setShowPaste(value);
    else if (key === "enableSaveShortcut") setEnableSaveShortcut(value);
    else if (key === "enablePasteShortcut") setEnablePasteShortcut(value);
  };

  return (
    <div className="w-80 p-4 rounded bg-white">
      <h1 className="text-lg font-bold text-center mb-4">Prompt Stash</h1>
      <PromptForm onSave={loadPrompts} />
      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading prompts...</div>
      ) : (
        <PromptList prompts={prompts} onDelete={loadPrompts} />
      )}

      <div className="mt-4">
        <h2 className="text-sm font-semibold mb-2">Widget settings</h2>

        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <label htmlFor="toggleSave" className="text-sm">
              Show save button
            </label>
            <p className="text-xs text-gray-500">
              This saves your prompt from the AI's text box
            </p>
          </div>
          <input
            id="toggleSave"
            type="checkbox"
            checked={showSave}
            onChange={(e) => handleToggle("showSave", e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <label htmlFor="togglePaste" className="text-sm">
              Show paste button
            </label>
            <p className="text-xs text-gray-500">
              This pastes your last saved prompt
            </p>
          </div>
          <input
            id="togglePaste"
            type="checkbox"
            checked={showPaste}
            onChange={(e) => handleToggle("showPaste", e.target.checked)}
          />
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-sm font-semibold mb-2">Shortcuts</h2>

        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <label htmlFor="toggleShortcut" className="text-sm">
                  Enable save shortcut
                </label>
                <p className="text-xs text-gray-500">
                  Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> to
                  save the prompt
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <label htmlFor="toggleShortcut" className="text-sm">
                  Enable paste shortcut
                </label>
                <p className="text-xs text-gray-500">
                  Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> to
                  paste the recent prompt
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        made by{" "}
        <a
          href="https://www.instagram.com/lukes.code/"
          className="text-blue-500 underline"
        >
          luke
        </a>{" "}
        with love ❤️
      </div>
    </div>
  );
};
