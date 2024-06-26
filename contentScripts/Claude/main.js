let currDemons = {};

// async function to handle fetching of the userSettings and sending them to the observer setup function

async function getSettingsBeginAndObserve() {
  const userSettings = await restoreChromeSyncData(hearChatOptionKey);
    processedUserSettings = processSettings(userSettings);

    currDemons = observeAndListen(processedUserSettings);

    // console.log(processedUserSettings.startingSound);
}

// launch first demon observer and checker
getSettingsBeginAndObserve();

// Listener to react to storage changes and update settings without needing to reload
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if (key === hearChatOptionKey) {  // Ensure the listener only reacts to changes in the primary key
            let newValue = changes[key].newValue;
            // console.log(`New value for ${key} is now:`, newValue);

            // stop the demons running on the old settings
            if(Object.keys(currDemons).length) {
                currDemons.observer.disconnect();
                clearInterval(currDemons.interval);
            }

            // Process the new settings
            const processedNewSettings = processSettings(newValue);
            currDemons = observeAndListen(processedNewSettings);
        }
    }
});

// add a button to the bottom of all effected pages that will take the user to the extension's options page

// creates button element and appends it to the body
const optionsButton = document.createElement('button');
optionsButton.innerText = 'HearChat';
optionsButton.id = 'hearChatOptionsButton';
optionsButton.style.position = 'fixed';
optionsButton.style.bottom = '20px';
optionsButton.style.right = '20px';
optionsButton.style.zIndex = '1000';
document.body.appendChild(optionsButton);

// Add click event listener to open the options page in a new tab
optionsButton.addEventListener('click', openHearChatOptionsPage);
