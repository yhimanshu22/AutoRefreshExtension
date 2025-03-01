let refreshTimer = null;
let countdownTimer = null;
let timeLeft = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[DEBUG] Received message:", message);

    if (message.action === "start_refresh") {
        let interval = message.interval;
        timeLeft = interval;

        // Save interval in storage for persistence
        chrome.storage.local.set({ refreshInterval: interval });

        // Refresh the active tab immediately
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                let tabId = tabs[0].id;
                chrome.tabs.reload(tabId, () => {
                    console.log("[DEBUG] Page refreshed immediately");

                    // Start auto-refresh interval
                    refreshTimer = setInterval(() => {
                        chrome.tabs.reload(tabId);
                        console.log("[DEBUG] Page auto-refreshed");
                        timeLeft = interval; // Reset timer after each refresh
                    }, interval * 1000);

                    // Start countdown timer for badge
                    startCountdown(interval);

                    sendResponse({ status: "success", message: "Auto-refresh started" });
                });
            }
        });

        return true; // Keep message channel open for async response
    }

    if (message.action === "stop_refresh") {
        stopTimers();
        sendResponse({ status: "success", message: "Auto-refresh stopped" });
    }
});

// Function to update the badge timer (MM:SS format)
function updateBadgeText() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    let displayText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`; // Format MM:SS
    chrome.action.setBadgeText({ text: displayText });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" }); // Red color for visibility
}

// Function to start countdown timer
function startCountdown(interval) {
    if (countdownTimer) clearInterval(countdownTimer);
    timeLeft = interval;

    countdownTimer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            timeLeft = interval; // Reset timer after each refresh
        }
        updateBadgeText();
    }, 1000);
}

// Function to stop all timers
function stopTimers() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    chrome.action.setBadgeText({ text: "" }); // Clear badge text
    console.log("[DEBUG] Auto-refresh stopped");
}
