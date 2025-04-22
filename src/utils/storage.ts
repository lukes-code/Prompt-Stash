export interface Prompt {
  id: string;
  text: string;
  createdAt: number;
}
export const savePrompt = async (text: string): Promise<Prompt> => {
  const prompt: Prompt = {
    id: Date.now().toString(),
    text,
    createdAt: Date.now(),
  };
  const { prompts = [] } = await chrome.storage.sync.get("prompts");
  await chrome.storage.sync.set({
    prompts: [...prompts, prompt],
    lastPrompt: prompt,
  });
  return prompt;
};
export const getPrompts = async (): Promise<Prompt[]> => {
  const { prompts = [] } = await chrome.storage.sync.get("prompts");
  return prompts;
};
export const getLastPrompt = async (): Promise<Prompt | null> => {
  const { lastPrompt = null } = await chrome.storage.sync.get("lastPrompt");
  return lastPrompt;
};
export const deletePrompt = async (id: string): Promise<void> => {
  const { prompts = [] } = await chrome.storage.sync.get("prompts");
  const updatedPrompts = prompts.filter((prompt: Prompt) => prompt.id !== id);
  await chrome.storage.sync.set({ prompts: updatedPrompts });
  // Update lastPrompt if we deleted the lastPrompt
  const { lastPrompt } = await chrome.storage.sync.get("lastPrompt");
  if (lastPrompt && lastPrompt.id === id) {
    const newLastPrompt =
      updatedPrompts.length > 0
        ? updatedPrompts[updatedPrompts.length - 1]
        : null;
    await chrome.storage.sync.set({ lastPrompt: newLastPrompt });
  }
};
