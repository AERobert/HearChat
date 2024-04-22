/*
    * utils.js
    edited on 2024-04-20
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * expects to be first content script run
*/

// set up basic announcement system

// create invisible div to contain accessibility announcements
const accessibilityAnnouncementsDiv = document.createElement('div');

// adds aria attributes to make div useful
accessibilityAnnouncementsDiv.setAttribute('role', 'alert');
accessibilityAnnouncementsDiv.id = 'accessibility-announcements';

// needs to be styled to be invisible

accessibilityAnnouncementsDiv.style.position = 'absolute';
accessibilityAnnouncementsDiv.style.width = '1px';
accessibilityAnnouncementsDiv.style.height = '1px';
accessibilityAnnouncementsDiv.style.margin = '-1px';
accessibilityAnnouncementsDiv.style.padding = '0';
accessibilityAnnouncementsDiv.style.border = '0';
accessibilityAnnouncementsDiv.style.clip = 'rect(0 0 0 0)';
accessibilityAnnouncementsDiv.style.overflow = 'hidden';
accessibilityAnnouncementsDiv.style.whiteSpace = 'nowrap';

document.body.appendChild(accessibilityAnnouncementsDiv);

// function to use this div to announce messages to screen reader users
function announceMessage(message) {
  accessibilityAnnouncementsDiv.textContent = message;
  setTimeout(() => {
    accessibilityAnnouncementsDiv.textContent = '';
    }, 1000);
  console.log(`Just announced '${message}'`);
}

// handling sound effects

function playSound(filename) {
    let audioPath = chrome.runtime.getURL(`audio/${filename}`);
    let audio = new Audio(audioPath);
    audio.play();
    console.log(`Played '${filename}'`);
}

// headingifying the assistant name divs

function isAssistantTurnDiv(div) {
    const roleDiv = div.querySelector('div[data-message-author-role]');
    if (!roleDiv) return -1; // No div with the role attribute found.
    const role = roleDiv.getAttribute('data-message-author-role');
    return role === 'assistant' ? 1 : role === 'user' ? 0 : -1;
}

function getNameDiv(div) {
    return div.querySelector('div.font-semibold.select-none') || null;
}

function getAssistantNameDivs() {
    let conversationDivs = document.querySelectorAll('div[data-testid^="conversation-turn-"]');
    
    let assistantDivs = Array.from(conversationDivs).filter(div => isAssistantTurnDiv(div) === 1);
    
    let assistantNameDivs = assistantDivs.flatMap(element => {
        const nameDiv = getNameDiv(element);
        return nameDiv ? [nameDiv] : [];
    });

    return assistantNameDivs;
}

function headingifyDiv(divNode, headingLevel) {
    // Validate headingLevel is within the allowable range, including 0 for removal
    if (headingLevel < 0 || headingLevel > 6) {
        console.error("Invalid heading level. Please choose a value between 0 and 6.");
        return null;
    }

    // Consolidate query for an existing heading
    const existingHeading = divNode.querySelector('h1, h2, h3, h4, h5, h6');

    if ((headingLevel === 0) && existingHeading) {
        // If headingLevel is 0, remove the existing heading if present
        divNode.removeChild(existingHeading);
        divNode.textContent = existingHeading.textContent;
    }
    else if (existingHeading) {
        // Replace or retain existing heading based on the requested level
        if (parseInt(existingHeading.tagName[1], 10) === headingLevel) {
            // Existing heading matches the requested level, return it
            return existingHeading;
        } else {
            // Replace existing heading with a new one of the specified level
            const newHeading = document.createElement(`h${headingLevel}`);
            newHeading.textContent = existingHeading.textContent;
            divNode.replaceChild(newHeading, existingHeading);
            return newHeading;
        }
    } else if (headingLevel >= 1 && headingLevel <= 6) {
        // Add a new heading if there isn't one already
        const heading = document.createElement(`h${headingLevel}`);
        heading.textContent = divNode.textContent; // Use div's existing text content for the new heading
        divNode.textContent = ''; // Clear the div's content before appending the new heading
        divNode.appendChild(heading);
        return heading;
    }

    // Given the logic flow, this return is a safeguard and should theoretically never be reached
    return null;
}

function headingifyAllAssistantNameDivs(headingLevel) {
    let nameDivs = getAssistantNameDivs();
    nameDivs.forEach(div => {
        headingifyDiv(div, headingLevel);
    });
}

headingifyAllAssistantNameDivs(4);

// labeling

// unlabeledButtonsIcons is defined in button_data.js
// Function to add aria-labels to buttons based on SVG "d" attribute matching and ensuring no text content

function labelButtonsWithIcons(button_data) {
  button_data.forEach(icon => {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
      const svg = button.querySelector('svg');
      const allTextInsideButton = button.textContent.trim();
      
      if (svg && allTextInsideButton === '') {
        const elements = svg.querySelectorAll('path, polyline');
        
        elements.forEach(element => {
          if (element.tagName === 'path') {
            if (element.getAttribute('d') === icon.svg) {
              button.setAttribute('aria-label', icon.label);
            }
          } else if (element.tagName === 'polyline') {
            if (element.getAttribute('points') === icon.svg) {
              button.setAttribute('aria-label', icon.label);
            }
          }
        });
      }
    });
  });
}

// functions to interact with the labeled buttons
function getButtonByLabel(label, index) {
  // Construct the selector based on the provided label
  const selector = `button[aria-label="${label}"]`;
  
  // Find all buttons with the specified aria-label
  const buttons = Array.from(document.querySelectorAll(selector));
  
  // If no index is provided, return all found buttons as an array
  if (index === undefined) {
    return buttons;
  }
  
  // Normalize the index
  const normalizedIndex = index < 0 ? buttons.length + index : index;
  
  // Return the button at the specified index, or null if not found
  return buttons[normalizedIndex] || null;
}

function clickLastButtonWithLabel(label) {
    button = getButtonByLabel(label, -1);
    if(button) {
        button.click();
    }
}

function toggleLastResponseSpeech() {
    stopSpeakingButtons = getButtonByLabel('stop speaking');
    if(stopSpeakingButtons.length) {
        stopSpeakingButtons.forEach(button => button.click());
    }
    else {
        clickLastButtonWithLabel('speak');
    }
}

function speakLastResponse(shouldSpeak) {
    if(shouldSpeak) {
        setTimeout(() => clickLastButtonWithLabel('speak', -1), 500);
    }
}

function badResponseShortcut() {
    clickLastButtonWithLabel('thumbs down');
    setTimeout(() => [...document.querySelectorAll('button')].find(btn => btn.textContent.includes('More...')).click(), 250);
}

function addShortcutsToButtons() {
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'S' (event.key === 'S')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyS') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            toggleLastResponseSpeech();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'R' (event.key === 'R')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyR') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            clickLastButtonWithLabel('regenerate');
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'B' (event.key === 'B')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyB') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            badResponseShortcut();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'E' (event.key === 'E')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyE') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            clickLastButtonWithLabel('edit');
        }
    });
}

// speech

// OpenAI speech

function isAudioPlaying(audio) {
  return !audio.paused && !audio.ended && audio.currentTime > 0;
}

function setOpenaiSpeechRate(desiredSpeed) {
  const openaiAudioElem = document.querySelector('audio');
  if (isAudioPlaying(openaiAudioElem) && openaiAudioElem.playbackRate !== desiredSpeed) {
    openaiAudioElem.playbackRate = parseFloat(desiredSpeed);
  }
}

// function to add role="button" to all divs with the type="button" (fixes the model picker and the GPT options button)
function fixButtonTypedDivs() {
    // Select all div elements with a type="button" attribute
    const divs = document.querySelectorAll('div[type="button"]');

    // Iterate through each div and set its role to "button" if it isn't already set
    divs.forEach(div => {
        if (div.getAttribute('role') !== 'button') {
            div.setAttribute('role', 'button');
        }
    });
}

// functions to effectively hide and unhide the buttons bars

function replaceClass(element, originalClass, newClass) {
    // Check if the element contains the original class
    if (element.classList.contains(originalClass)) {
        // Replace the original class with the new class
        element.classList.replace(originalClass, newClass);
    } else {
        // Return null if the original class is not found
        return null;
    }
}

function unhideAllButtons() {
  const invisibleDivs = document.querySelectorAll('div.invisible');
  invisibleDivs.forEach(div => {
    replaceClass(div, 'invisible', 'visible');
  });
}

function hideAllButtonsButLast() {
    const divs = document.querySelectorAll('div.visible, div.invisible');
    const totalDivs = divs.length;

    if (totalDivs > 2) {
        replaceClass(divs[totalDivs-2], 'invisible', 'visible'); // the last edit button should be visible always

        for (let i = 0; i < totalDivs - 2; i++) {
            replaceClass(divs[i], 'visible', 'invisible');
        }
    }
}

function showAllButtons(shouldMakeVisible) {
  if (shouldMakeVisible) {
    unhideAllButtons();
  } else {
    hideAllButtonsButLast();
  }
}

// function to retrieve the users settings from Chrome's Sync storage.

function restoreChromeSyncData(key) {
  // Return a new promise that resolves with the saved data or null
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      const savedData = result[key];
      if (savedData) {
        resolve(savedData); // Resolve the promise with the saved data
      } else {
        resolve(null); // Resolve the promise with null if no data was found
      }
    });
  });
}


// process user settings

function processHeadingLevel(selection) {
    if (selection === "None") {
        return 0;
    }
    else if ((parseInt(selection) >= 1) && (parseInt(selection) <= 6)) {
        return parseInt(selection);
    }
    return null;
}

function soundNameToSoundFile (selection) {
    if (selection === "None") {
        return null;
    }
        return selection.replace(/ /g, '_') + '.mp3';
}

function processSettings (settingsData) {
    settingsData.desiredHeadingLevel = processHeadingLevel(settingsData.desiredHeadingLevel);

    settingsData.startingSound = soundNameToSoundFile(settingsData.startingSound);
    settingsData.finishingSound = soundNameToSoundFile(settingsData.finishingSound);
    settingsData.errorSound = soundNameToSoundFile(settingsData.errorSound);

    return settingsData;
}

