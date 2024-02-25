const hearChatOptionKey = "hearChatStoredOptions";

const hearChatOptionDefaults = {
  "startingOptions": "off",
  "startingSound": "game",
  "startingAnnouncement": "Responding...",
  "finishingOptions": "off",
  "finishingSound": "ping",
  "finishingAnnouncement": "Finished Responding",
  "errorOptions": "off",
  "errorSound": "error",
  "errorAnnouncement": "An error occured",
  "desiredHeadingLevel": "3",
}

// listener to check if extension was just installed to set up the storage area

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        // On first install, set the default options in sync storage
        chrome.storage.sync.set({[hearChatOptionKey]: hearChatOptionDefaults}, function() {
            console.log('Default options set for the first time');
        });
    } else if (details.reason === "update") {
        // On update, check for any new default options and update accordingly
        chrome.storage.sync.get([hearChatOptionKey], function(result) {
            let currentOptions = result[hearChatOptionKey];
            let updatedOptions = false;
            // Iterate through default options to find any missing keys in the current options
            for (let key in hearChatOptionDefaults) {
                if (hearChatOptionDefaults.hasOwnProperty(key) && !currentOptions.hasOwnProperty(key)) {
                    // If a new key is found, add it to current options with its default value
                    currentOptions[key] = hearChatOptionDefaults[key];
                    updatedOptions = true; // Mark that we've updated the options
                }
            }
            // If there were any updates, save the updated options back to storage
            if (updatedOptions) {
                chrome.storage.sync.set({[hearChatOptionKey]: currentOptions}, function() {
                    console.log('Options updated with new defaults');
                });
            }
        });
    }
});
