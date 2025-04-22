(function () {
  let showSaveButton = true;
  let showPasteButton = true;

  window.addEventListener("load", () => {
    console.log("Drawer script loaded");

    const drawer = document.createElement("div");
    drawer.style.position = "absolute";
    drawer.style.display = "flex";
    drawer.style.flexDirection = "column"; // Standard column direction
    drawer.style.alignItems = "center";
    drawer.style.justifyContent = "flex-end"; // Align items to the end (bottom)
    drawer.style.transition = "height 0.3s ease"; // Animate height
    drawer.style.overflow = "hidden";
    drawer.style.height = "50px"; // Initial height
    drawer.style.width = "50px"; // Fixed width
    drawer.style.borderRadius = "25px";
    drawer.style.backgroundColor = "#1f2937";
    drawer.style.zIndex = "9999";
    drawer.style.padding = "10px 0"; // Adjust padding for vertical growth

    let drawerOpen = false;

    const positionDrawer = () => {
      const input = document.querySelector("#prompt-textarea");
      if (!input) return;

      const rect = input.getBoundingClientRect();

      // Position so the bottom of the drawer aligns with the input
      drawer.style.top = "auto"; // Clear the top position
      drawer.style.left = `${rect.left - 85}px`;
      drawer.style.bottom = `${
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
      <g transform="translate(5,0)"> <!-- shift to center horizontally -->
        <path d="M30,10 C40,10, 55,25, 55,40 C55,55, 40,60, 30,60 L30,90 L15,90 L15,10 Z" 
          fill="url(#grad1)" stroke="black" stroke-width="3" />
        <path d="M30,25 C35,25, 45,30, 45,35 C45,40, 35,45, 30,45 C25,45, 20,40, 20,35 C20,30, 25,25, 30,25 Z" 
          fill="white" />
      </g>
    </svg>
    `;
    logo.style.cursor = "pointer";
    logo.style.flexShrink = "0";
    logo.style.order = "3"; // Put the logo at the end (bottom)

    // Create buttons first
    const pasteSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-paste-icon lucide-clipboard-paste">
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

    const createIconButton = (svg, onClick) => {
      const btn = document.createElement("button");
      btn.innerHTML = svg;
      btn.style.background = "transparent";
      btn.style.border = "none";
      btn.style.color = "#fff";
      btn.style.cursor = "pointer";
      btn.style.marginBottom = "10px"; // Space between buttons
      btn.style.visibility = "hidden";
      btn.style.opacity = "0";
      btn.style.transition = "opacity 0.2s ease";
      btn.onclick = onClick;
      return btn;
    };

    const pasteBtn = createIconButton(pasteSVG, () => {
      chrome.storage.sync.get("lastPrompt", (result) => {
        const lastPrompt = result.lastPrompt;
        const textarea = document.querySelector("#prompt-textarea");

        if (lastPrompt?.text && textarea) {
          const isEditable =
            textarea.getAttribute("contenteditable") === "true";
          if (isEditable) textarea.textContent = lastPrompt.text;
          else textarea.value = lastPrompt.text;

          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          textarea.focus();
        } else {
          alert("No saved prompt or input found.");
        }
      });
    });
    pasteBtn.style.order = "2"; // Second from the bottom

    const saveBtn = createIconButton(saveSVG, async () => {
      const textarea = document.querySelector("#prompt-textarea");
      const text =
        textarea?.getAttribute("contenteditable") === "true"
          ? textarea.textContent
          : textarea?.value;

      if (!text?.trim()) {
        alert("Nothing to save.");
        return;
      }

      const prompt = {
        id: Date.now().toString(),
        text: text.trim(),
        createdAt: Date.now(),
      };

      chrome.storage.sync.get("prompts", (result) => {
        const prompts = result.prompts || [];
        const newPrompts = [...prompts, prompt];
        chrome.storage.sync.set(
          { prompts: newPrompts, lastPrompt: prompt },
          () => {
            if (chrome.runtime.lastError) {
              alert("Error saving prompt: " + chrome.runtime.lastError.message);
            } else {
              alert("Prompt saved.");
            }
          }
        );
      });
    });
    saveBtn.style.order = "1"; // Top-most when expanded

    // Update buttons function that checks and dynamically adds/removes buttons
    const updateDrawerButtons = () => {
      // Clear any existing buttons to avoid duplicates
      drawer.innerHTML = ""; // This clears all content inside the drawer

      // Re-add the settings based on the values
      if (showSaveButton) drawer.appendChild(saveBtn);
      if (showPasteButton) drawer.appendChild(pasteBtn);

      // Always add the logo
      drawer.appendChild(logo);
    };

    // Get initial settings
    chrome.storage.sync.get(["showSave", "showPaste"], (settings) => {
      showSaveButton = settings.showSave !== false;
      showPasteButton = settings.showPaste !== false;

      updateDrawerButtons(); // Update drawer buttons based on settings
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

    // Listen for storage changes to dynamically update button visibility
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync") {
        if (changes.showSave) {
          showSaveButton = changes.showSave.newValue !== false;
        }
        if (changes.showPaste) {
          showPasteButton = changes.showPaste.newValue !== false;
        }
        updateDrawerButtons(); // Re-append buttons based on new settings
      }
    });

    // Drawer click behavior
    drawer.addEventListener("click", () => {
      if (!showSaveButton && !showPasteButton) {
        // Open the extension popup when neither Save nor Paste is checked
        chrome.runtime.openOptionsPage();
      } else {
        // Expand drawer if buttons are enabled
        if (!drawerOpen) {
          drawer.style.height = "fit-content";
          drawerOpen = true;
        }
      }
    });

    document.body.appendChild(drawer);

    const tryPosition = () => {
      const input = document.querySelector("#prompt-textarea");
      if (input) {
        positionDrawer();
      } else {
        setTimeout(tryPosition, 100);
      }
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
  });
})();
