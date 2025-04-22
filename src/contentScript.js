(function () {
  // Wait for DOM to be ready
  window.addEventListener("load", () => {
    console.log("Content script loaded");

    // Create the suggestion button
    const button = document.createElement("button");
    button.style.position = "absolute";
    button.style.zIndex = "9999";
    button.style.padding = "10px";
    button.style.background = "#3b82f6";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.cursor = "pointer";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.width = "40px"; // Size of the icon
    button.style.height = "40px"; // Size of the icon

    // Adding the Copy Icon (SVG)
    const iconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-paste-icon lucide-clipboard-paste"><path d="M11 14h10"/><path d="M16 4h2a2 2 0 0 1 2 2v1.344"/><path d="m17 18 4-4-4-4"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
    `;
    button.innerHTML = iconSVG;

    button.onclick = () => {
      try {
        // Check if chrome API is available
        if (!chrome || !chrome.storage || !chrome.storage.sync) {
          throw new Error("Chrome storage API not available");
        }

        // Use chrome.storage.sync to match the utility functions
        chrome.storage.sync.get("lastPrompt", (result) => {
          // Check for runtime errors
          if (chrome.runtime.lastError) {
            console.error(
              "Error accessing chrome.storage.sync:",
              chrome.runtime.lastError
            );
            alert("Error: " + chrome.runtime.lastError.message);
            return;
          }

          const lastPrompt = result.lastPrompt || null;

          if (lastPrompt && lastPrompt.text) {
            console.log("Retrieved last prompt:", lastPrompt.text);

            // Select the textarea by its ID
            const promptTextarea = document.querySelector("#prompt-textarea");

            // Check if the element is found
            if (promptTextarea) {
              console.log("Found prompt-textarea element.");
              // Update the value of the textarea
              if (typeof promptTextarea.value !== "undefined") {
                promptTextarea.value = lastPrompt.text;
              }
              // For contenteditable fields
              if (promptTextarea.getAttribute("contenteditable") === "true") {
                promptTextarea.textContent = lastPrompt.text;
              }
              // Trigger input event to notify any listeners
              promptTextarea.dispatchEvent(
                new Event("input", { bubbles: true })
              );

              // Try to focus the element to make it ready for submission
              promptTextarea.focus();
            } else {
              console.error("Textarea not found!");
              alert(
                "Could not find the input field. The page structure may have changed."
              );
            }
          } else {
            console.log("No prompt saved yet.");
            alert("No prompt saved yet. Please save a prompt first.");
          }
        });
      } catch (error) {
        console.error("Button click error:", error);
        alert(
          "Extension error: " +
            error.message +
            ". Try reloading the page or reinstalling the extension."
        );

        // Remove the button if the extension context is invalidated
        button.remove();
      }
    };

    // Function to position the button next to the input field
    const positionButtonNextToInput = () => {
      const inputElement = document.querySelector("#prompt-textarea");

      if (inputElement) {
        const inputRect = inputElement.getBoundingClientRect();

        // Position the button to the left of the input field
        button.style.top = `${inputRect.top}px`;
        button.style.left = `${inputRect.left - button.offsetWidth - 10}px`; // 10px offset from the left of the input
      }
    };

    // Position the button on initial load (with a retry delay)
    setTimeout(positionButtonNextToInput, 100); // Retry after 100ms to ensure elements are loaded

    // Optionally: Use MutationObserver to detect if the input element is added to the DOM
    const observer = new MutationObserver(() => {
      if (document.querySelector("#prompt-textarea")) {
        positionButtonNextToInput();
        observer.disconnect(); // Stop observing once the element is found and positioned
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Optional: Update position if the input field moves or resizes (e.g., on window resize)
    window.addEventListener("resize", positionButtonNextToInput);

    document.body.appendChild(button);
    console.log("Paste button added to the page.");
  });
})();
