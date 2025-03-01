document.addEventListener("DOMContentLoaded", function () {
    let startBtn = document.getElementById("start");
    let stopBtn = document.getElementById("stop");
    let intervalSelect = document.getElementById("interval");

    let timerDisplay = document.createElement("p"); // Add Timer Display
    timerDisplay.id = "timerDisplay";
    document.body.appendChild(timerDisplay); // Append below buttons

    console.log("[DEBUG] Popup loaded");

    // Load saved interval from storage
    chrome.storage.local.get("refreshInterval", (data) => {
        console.log("[DEBUG] Retrieved refreshInterval from storage:", data);

        if (data.refreshInterval) {
            intervalSelect.value = data.refreshInterval; // Keep in seconds
            updateTimerDisplay(data.refreshInterval);
        }
    });

    // Function to update timer in MM:SS format
    function updateTimerDisplay(seconds) {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = seconds % 60;
        timerDisplay.textContent = `${minutes}m ${remainingSeconds}s`;
    }

    // Start auto-refresh
    startBtn.addEventListener("click", () => {
        let interval = parseInt(intervalSelect.value); // Dropdown already in seconds

        console.log("[DEBUG] Start button clicked, Interval selected:", interval, "seconds");

        // Save interval in storage
        chrome.storage.local.set({ refreshInterval: interval }, () => {
            if (chrome.runtime.lastError) {
                console.error("[ERROR] Failed to save refreshInterval:", chrome.runtime.lastError);
            } else {
                console.log("[DEBUG] Interval saved successfully");
                updateTimerDisplay(interval); // Update UI immediately
            }
        });

        // Send message to background script
        chrome.runtime.sendMessage({ action: "start_refresh", interval: interval }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("[ERROR] Failed to send start_refresh message:", chrome.runtime.lastError);
            } else {
                console.log("[DEBUG] Message sent to background:", response);
            }
        });
    });

    // Stop auto-refresh
    stopBtn.addEventListener("click", () => {
        console.log("[DEBUG] Stop button clicked");

        chrome.runtime.sendMessage({ action: "stop_refresh" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("[ERROR] Failed to send stop_refresh message:", chrome.runtime.lastError);
            } else {
                console.log("[DEBUG] Stop message sent to background:", response);
                timerDisplay.textContent = "Stopped"; // Reset display when stopped
            }
        });
    });
});
