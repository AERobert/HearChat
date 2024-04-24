// global variables

const hearChatOptionKey = "hearChatStoredOptions";
const hearChatDefaultsKey = "hearChatDefaultOptions";

let formIsDirty = false;

// const elements

const optionsForm = document.getElementById('accessibilityOptionsForm');
const accessibilityAnnouncementsDiv = document.getElementById("announcementArea");

// announcement system

// function to use div to announce messages to screen reader users
function announceMessage(message) {
  accessibilityAnnouncementsDiv.textContent = message;
  setTimeout(() => {
    accessibilityAnnouncementsDiv.textContent = '';
    }, 1000);
  console.log(`Just announced '${message}'`);
}

// add listeners to save the data when the form is submitted and to restore it when the document is loaded

document.addEventListener('DOMContentLoaded', function() {
  // restore settings using chrome.storage.sync
  restoreData(hearChatOptionKey);

});

optionsForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form from submitting the traditional way
  const data = gatherFormData();
  saveData(hearChatOptionKey, data); // Save using chrome.storage.sync
  formIsDirty = false;
  announceMessage("saved"); // inform the user the saving was successful
});

function gatherFormData() {
  const form = document.getElementById('accessibilityOptionsForm');
  const formData = {
    startingOptions: form.startingOptions.value,
    startingSound: form.startingSound.value,
    startingAnnouncement: form.startingAnnouncement.value,
    finishingOptions: form.finishingOptions.value,
    finishingSound: form.finishingSound.value,
    finishingAnnouncement: form.finishingAnnouncement.value,
    "finishedSpeakResponse": form.finishedSpeakResponse.checked,
    "openaiSpeechReadingSpeed": form.openaiSpeechReadingSpeed.value,
    errorOptions: form.errorOptions.value,
    errorSound: form.errorSound.value,
    errorAnnouncement: form.errorAnnouncement.value,
    desiredHeadingLevel: form.desiredHeadingLevel.value,
    "showAllButtons": form.showAllButtons.checked,
    "swapEnterShiftEnterOnPrompt": form.swapEnterShiftEnterOnPrompt.checked
  };
  return formData;
}

function saveData(key, data) {
  // use chrome.storage.sync.set to save data.
  chrome.storage.sync.set({[key]: data}, function() {
    console.log('Settings have been saved');
  });
}

function updateFormWithData(data, form) {
  // Iterate over each field provided in the data object
  Object.keys(data).forEach(field => {
    // Check if the form has the field and if it's a dropdown select
    if (form[field] && form[field].type === 'select-one') {
      // Set the value of the dropdown to match the data
      form[field].value = data[field];
    } else if (form[field] && form[field].type === 'checkbox') {
      // If the field is a checkbox, set its checked property
      form[field].checked = data[field];
    } else if (form[field]) {
      // For other input types, set the value directly
      form[field].value = data[field];
    }
  });
}

function restoreData(key) {
  // use chrome.storage.sync.get to fetch data asynchronously.
  chrome.storage.sync.get([key], function(result) {
    const savedData = result[key];
    if (!savedData) return; // If there's nothing saved, then there's no point in continuing.

    updateFormWithData(savedData, optionsForm);
  });
}

// populate sound select boxes with available selections.

const soundSelects = [
    "startingSound",
    "finishingSound",
    "errorSound",
]

const soundNames = [
    "None",
    "alarm beep",
    "barks",
    "boing",
    "beep",
    "bubble pop",
    "error",
    "fanfare",
    "game",
    "glitch",
    "glockenspiel",
    "heart beat",
    "jet start",
    "laser rocket",
    "live chat",
    "magic surprise",
    "meow",
    "moo",
    "negative beeps",
    "ping",
    "popcorn",
    "rooster",
    "sad trombone",
    "snake",
    "strings ascending",
    "strings descending"
];

function populateSelectDropdown(selectId, optionsArray) {
    // Find the select element by its ID
    const selectElement = document.getElementById(selectId);

    // Check if the select element exists
    if (!selectElement) {
        console.error(`Element with ID '${selectId}' not found.`);
        return;
    }

    // Clear existing options to avoid duplicates
    selectElement.innerHTML = '';

    // Iterate over the optionsArray and create option elements
    optionsArray.forEach(optionValue => {
        // Create a new option element
        const optionElement = document.createElement("option");
        optionElement.value = optionValue;
        optionElement.textContent = optionValue; // Set the display text

        // Append the option element to the select element
        selectElement.appendChild(optionElement);
    });

    console.log(`Dropdown with ID '${selectId}' has been populated.`);
}

// add listeners to all of the sound selectors to automatically play a sound when selected

function playSound(filename) {
    let audioPath = chrome.runtime.getURL(`audio/${filename}`);
    let audio = new Audio(audioPath);
    audio.play();
    console.log(`Played '${filename}'`);
}

function soundNameToSoundFile (selection) {
    if (selection === "None") {
        return null;
    }
        return selection.replace(/ /g, '_') + '.mp3';
}

function addChangeListenerToPlay (selectId) {
    document.getElementById(selectId).addEventListener('change', function() {
        soundFile = soundNameToSoundFile(this.value);
        playSound(soundFile);
    });
}

for (const soundSelectId of soundSelects ) {
    populateSelectDropdown(soundSelectId, soundNames);
    addChangeListenerToPlay(soundSelectId);
}

// add feature so the page will ask for confirmation before leaving with unsaved changes.

// Listen for any change events on the form
optionsForm.addEventListener('change', () => {
  formIsDirty = true;
});

window.addEventListener('beforeunload', (event) => {
  // If the form is dirty, ask for confirmation
  if (formIsDirty) {
    // message for browsers which allow custom message
    const message = 'You have unsaved changes! Are you sure you want to leave?';
    event.returnValue = message; // Chrome requires this to trigger the dialog
    return message; // This is for other browsers
  }
});

// setup form so hitting reset will actually revert to defaults

optionsForm.addEventListener('reset', function(event) {
  event.preventDefault();

  const wantRestore = confirm("Restore Defaults? Your current settings will be replaced with the extension's defaults.");

  if (wantRestore) {
    chrome.storage.sync.get([hearChatDefaultsKey], (result) => {

      const defaults = result[hearChatDefaultsKey];
      // updateFormWithData(defaults, this);
      saveData(hearChatOptionKey, defaults);
      announceMessage("Defaults restored");
    });
  }
});

// Listener to react to storage changes and update settings without needing to reload
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if (key === hearChatOptionKey) {  // Ensure listener only reacting to changes in the primary key
            let newData = changes[key].newValue;
            const form = document.getElementById('accessibilityOptionsForm');

            updateFormWithData(newData, form);
        }
    }
});
