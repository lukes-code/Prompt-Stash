(function () {
  let showSaveButton = true;
  let showPasteButton = true;
  let enableSaveShortcut = true;

  const style = document.createElement("style");
  style.innerHTML = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }

  .shake {
    animation: shake 0.5s ease-in-out;
  }

  .ai-gradient-border {
    position: absolute;
    border-radius: 30px;
    padding: 2px;
    --gradient: linear-gradient(135deg, #00f0ff, #ff1cf7, #00f0ff);
    background: var(--gradient);
    background-size: 300% 300%;
    animation: borderPulse 5s ease infinite;
    transition:
      background 0.5s ease,
      background-position 0.5s ease,
      --gradient 0.5s ease;
    z-index: 9999;
  }

  .ai-gradient-border.success {
    --gradient: linear-gradient(135deg, #00ff88, #00cc66, #00ff88);
  }

  @keyframes borderPulse {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .ai-gradient-inner {
    border-radius: 25px;
    background-color: #1f2937;
    padding: 10px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    overflow: hidden;
    transition: height 0.3s ease;
    width: 50px;
    height: 50px;
  }
  `;
  document.head.appendChild(style);

  const getPromptsFromStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get("prompts", (result) => {
        resolve(result.prompts || []);
      });
    });
  };

  const getLastPromptFromStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get("lastPrompt", (result) => {
        resolve(result.lastPrompt || null);
      });
    });
  };

  const setPromptsToStorage = (prompts, lastPrompt) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ prompts, lastPrompt }, () => {
        resolve(!chrome.runtime.lastError);
      });
    });
  };

  window.addEventListener("load", () => {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-gradient-border";

    const drawer = document.createElement("div");
    drawer.className = "ai-gradient-inner";

    let drawerOpen = false;

    const positionDrawer = () => {
      const input = document.querySelector("#prompt-textarea");
      if (!input) return;
      const rect = input.getBoundingClientRect();
      wrapper.style.left = `${rect.left - 85}px`;
      wrapper.style.bottom = `${
        window.innerHeight - rect.top - window.scrollY - 50
      }px`;
    };

    const logo = document.createElement("div");
    logo.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 100" width="30" height="30">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(0,204,255);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(192,192,192);stop-opacity:1" />
          </linearGradient>
        </defs>
        <g transform="translate(5,0)">
          <path d="M30,10 C40,10, 55,25, 55,40 C55,55, 40,60, 30,60 L30,90 L15,90 L15,10 Z" fill="url(#grad1)" stroke="black" stroke-width="3"/>
          <path d="M30,25 C35,25, 45,30, 45,35 C45,40, 35,45, 30,45 C25,45, 20,40, 20,35 C20,30, 25,25, 30,25 Z" fill="white"/>
        </g>
      </svg>`;
    logo.style.cursor = "pointer";
    logo.style.flexShrink = "0";
    logo.style.order = "3";

    const pasteSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-paste">
        <path d="M11 14h10"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v1.344"/>
        <path d="m17 18 4-4-4-4"/>
        <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113"/>
        <rect x="8" y="2" width="8" height="4" rx="1"/>
      </svg>`;

    const saveSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>`;

    const checkSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle">
        <path d="M5 13l4 4L19 7"/>
        <circle cx="12" cy="12" r="10"/>
      </svg>`;

    const createIconButton = (svg, onClick) => {
      const btn = document.createElement("button");
      btn.innerHTML = svg;
      btn.style.background = "transparent";
      btn.style.border = "none";
      btn.style.color = "#fff";
      btn.style.cursor = "pointer";
      btn.style.marginBottom = "10px";
      btn.style.visibility = "hidden";
      btn.style.opacity = "0";
      btn.style.transition = "opacity 0.2s ease";
      btn.onclick = onClick;
      return btn;
    };

    const handleError = () => {
      drawer.classList.add("shake");
      setTimeout(() => drawer.classList.remove("shake"), 1000);
    };

    const flashSuccessBorder = () => {
      wrapper.classList.add("success");
      setTimeout(() => wrapper.classList.remove("success"), 2000);
    };

    const handleSuccess = (button) => {
      const originalSVG = button.innerHTML;
      button.innerHTML = checkSVG;
      flashSuccessBorder();
      setTimeout(() => (button.innerHTML = originalSVG), 2000);
    };

    const saveCurrentPrompt = async () => {
      const textarea = document.querySelector("#prompt-textarea");
      const text =
        textarea?.getAttribute("contenteditable") === "true"
          ? textarea.textContent
          : textarea?.value;

      if (!text?.trim()) return handleError();

      const prompt = {
        id: Date.now().toString(),
        text: text.trim(),
        createdAt: Date.now(),
      };

      const prompts = await getPromptsFromStorage();
      const newPrompts = [...prompts, prompt];
      const success = await setPromptsToStorage(newPrompts, prompt);

      if (!success) return handleError();
      handleSuccess(saveBtn);
    };

    const pasteLastPrompt = async () => {
      const lastPrompt = await getLastPromptFromStorage();
      const textarea = document.querySelector("#prompt-textarea");
      if (lastPrompt?.text && textarea) {
        const isEditable = textarea.getAttribute("contenteditable") === "true";
        if (isEditable) textarea.textContent = lastPrompt.text;
        else textarea.value = lastPrompt.text;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.focus();
        handleSuccess(pasteBtn);
      } else {
        handleError();
      }
    };

    const saveBtn = createIconButton(saveSVG, saveCurrentPrompt);
    const pasteBtn = createIconButton(pasteSVG, pasteLastPrompt);
    saveBtn.style.order = "1";
    pasteBtn.style.order = "2";

    const updateDrawerButtons = () => {
      drawer.innerHTML = "";
      if (showSaveButton) drawer.appendChild(saveBtn);
      if (showPasteButton) drawer.appendChild(pasteBtn);
      drawer.appendChild(logo);
    };

    chrome.storage.sync.get(
      ["showSave", "showPaste", "enableSaveShortcut", "enablePasteShortcut"],
      (settings) => {
        showSaveButton = settings.showSave !== false;
        showPasteButton = settings.showPaste !== false;
        enableSaveShortcut = settings.enableSaveShortcut !== false;
        enablePasteShortcut = settings.enablePasteShortcut !== false;
        updateDrawerButtons();
      }
    );

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.showSave)
        showSaveButton = changes.showSave.newValue !== false;
      if (changes.showPaste)
        showPasteButton = changes.showPaste.newValue !== false;
      if (changes.enableSaveShortcut)
        enableSaveShortcut = changes.enableSaveShortcut.newValue !== false;
      if (changes.enablePasteShortcut)
        enablePasteShortcut = changes.enablePasteShortcut.newValue !== false;
      updateDrawerButtons();
    });

    drawer.addEventListener("mouseenter", () => {
      drawerOpen = true;
      drawer.style.height = "fit-content";
      if (showSaveButton) {
        saveBtn.style.visibility = "visible";
        saveBtn.style.opacity = "1";
      }
      if (showPasteButton) {
        pasteBtn.style.visibility = "visible";
        pasteBtn.style.opacity = "1";
      }
    });

    drawer.addEventListener("mouseleave", () => {
      drawerOpen = false;
      drawer.style.height = "50px";
      [saveBtn, pasteBtn].forEach((btn) => {
        btn.style.visibility = "hidden";
        btn.style.opacity = "0";
      });
    });

    wrapper.addEventListener("click", () => {
      if (!drawerOpen) {
        drawer.style.height = "fit-content";
        drawerOpen = true;
      }
    });

    wrapper.appendChild(drawer);
    document.body.appendChild(wrapper);

    const tryPosition = () => {
      const input = document.querySelector("#prompt-textarea");
      if (input) positionDrawer();
      else setTimeout(tryPosition, 100);
    };

    tryPosition();
    window.addEventListener("resize", positionDrawer);

    const observer = new MutationObserver(() => {
      if (document.querySelector("#prompt-textarea")) {
        positionDrawer();
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const urlObserver = new MutationObserver(() => {
      positionDrawer();
    });

    urlObserver.observe(document.body, { childList: true, subtree: true });

    let shortcutListener = null;

    chrome.storage.sync.get(
      ["showSave", "showPaste", "enableSaveShortcut", "enablePasteShortcut"],
      (settings) => {
        showSaveButton = settings.showSave !== false;
        showPasteButton = settings.showPaste !== false;
        enableSaveShortcut = settings.enableSaveShortcut !== false;
        enablePasteShortcut = settings.enablePasteShortcut !== false;
        updateDrawerButtons();

        if (!shortcutListener) {
          shortcutListener = (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === "KeyS") {
              e.preventDefault();
              saveCurrentPrompt();
            } else if (e.ctrlKey && e.shiftKey && e.code === "KeyV") {
              e.preventDefault();
              pasteLastPrompt();
            }
          };
          window.addEventListener("keydown", shortcutListener);
        }
      }
    );
  });
})();
