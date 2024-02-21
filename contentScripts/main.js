// async function to handle fetching of the userSettings and sending them to the observer setup function

async function getSettingsAndObserve() {
  const userSettings = await restoreChromeSyncData("userAccessibilityOptions");
    processedUserSettings = processSettings(userSettings);
    observeAndListen(processedUserSettings);
    console.log(processedUserSettings.startingSound);
}

getSettingsAndObserve();