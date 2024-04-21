const hearChatOptionKey = "hearChatStoredOptions";

// async function to handle fetching of the userSettings and sending them to the observer setup and first setup functions

async function getSettingsBeginAndObserve() {
  const userSettings = await restoreChromeSyncData(hearChatOptionKey);
    processedUserSettings = processSettings(userSettings);

    hearChatFirstSetup(processedUserSettings);
    observeAndListen(processedUserSettings);

    // console.log(processedUserSettings.startingSound);
}

getSettingsBeginAndObserve();

// add a button to the bottom of all effected pages that will take the user to the extension's options page

// creates button element and appends it to the body
const optionsButton = document.createElement('button');
optionsButton.innerText = 'HearChat';
optionsButton.style.position = 'fixed';
optionsButton.style.bottom = '20px';
optionsButton.style.right = '20px';
optionsButton.style.zIndex = '1000';
document.body.appendChild(optionsButton);

// Add click event listener to open the options page in a new tab
optionsButton.addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options/options.html'));
  }
});
