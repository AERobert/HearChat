document.addEventListener('DOMContentLoaded', function() {
  // Attempt to restore settings using chrome.storage.sync
  restoreData('userAccessibilityOptions');
});

document.getElementById('accessibilityOptionsForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form from submitting the traditional way
  const data = gatherFormData();
  saveData('userAccessibilityOptions', data); // Save using chrome.storage.sync
  alert('Settings saved successfully!'); // Simple feedback
});

function gatherFormData() {
  // No changes here, as this function purely deals with DOM manipulation and data gathering
  const form = document.getElementById('accessibilityOptionsForm');
  const formData = {
    startingOptions: form.startingOptions.value,
    startingSound: form.startingSound.value,
    startingAnnouncement: form.startingAnnouncement.value,
    finishingOptions: form.finishingOptions.value,
    finishingSound: form.finishingSound.value,
    finishingAnnouncement: form.finishingAnnouncement.value,
    errorOptions: form.errorOptions.value,
    errorSound: form.errorSound.value,
    errorAnnouncement: form.errorAnnouncement.value,
    desiredHeadingLevel: form.desiredHeadingLevel.value
  };
  return formData;
}

function saveData(key, data) {
  // Here's where the magic happens. We're using chrome.storage.sync.set to save our data.
  chrome.storage.sync.set({[key]: data}, function() {
    console.log('Settings have been saved');
  });
}

function restoreData(key) {
  // Ah, the elegance of chrome.storage.sync.get in action. It fetches our data asynchronously.
  chrome.storage.sync.get([key], function(result) {
    const savedData = result[key];
    if (!savedData) return; // If there's nothing saved, then there's no point in continuing.

    const form = document.getElementById('accessibilityOptionsForm');
    Object.keys(savedData).forEach(field => {
      if (form[field] && form[field].type === 'select-one') {
        form[field].value = savedData[field];
      } else if (form[field]) {
        form[field].value = savedData[field];
      }
    });
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
    "beep",
    "error",
    "fanfare",
    "game",
    "glockenspiel",
    "jet start",
    "laserrocket2",
    "livechat",
    "magic surprise",
    "negative beeps",
    "ping"
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

for (const soundSelectID of soundSelects ) {
    populateSelectDropdown(soundSelectID, soundNames);
}
