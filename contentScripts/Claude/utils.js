/*
    * utils.js
    edited on 2024-06-25
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * first content script run
*/

// where function

function whereClaude() {
    if(location.href.includes('chats/')) {
        return 'chatting';
    }
    else if(location.href.endsWith('chats')) {
        return 'frontPage';
    }
}

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

function oldGetAssistantNameDivs() {
    let conversationDivs = document.querySelectorAll('div[data-testid^="conversation-turn-"]');
    
    let assistantDivs = Array.from(conversationDivs).filter(div => isAssistantTurnDiv(div) === 1);
    
    let assistantNameDivs = assistantDivs.flatMap(element => {
        const nameDiv = getNameDiv(element);
        return nameDiv ? [nameDiv] : [];
    });

    return assistantNameDivs;
}

function juceGetAssistantNameDivs() {
  const elements = document.querySelectorAll('[role="img"],[data-assistant-name="true"]');
  const removedRoleElements = [];

  elements.forEach(element => {
    const textElement = element.querySelector('text');
    if (textElement) {
      element.removeAttribute('role');
        element.setAttribute('data-assistant-name', 'true');
      removedRoleElements.push(element);
    }
  });

  return removedRoleElements;
}

function headingifyDiv(divNode, headingLevel) {
    // Validate headingLevel is within the allowable range, including 0 for removal
    if (headingLevel < 0 || headingLevel > 6) {
        console.error("Invalid heading level. Please choose a value between 0 and 6.");
        return null;
    }

    // return early if the divNode is not vallid
    if (!divNode) {
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
    let nameDivs = /* juceGetAssistantNameDivs() || */ oldGetAssistantNameDivs();
    nameDivs.forEach(div => {
        headingifyDiv(div, headingLevel);
    });
}

headingifyAllAssistantNameDivs(4);

// labeling

// unlabeledButtonsIcons is defined in button_data.js
// Function to add aria-labels to buttons based on SVG "d" attribute matching and ensuring no text content

function labelButtonsWithIcons(button_data) {
  const buttons = document.querySelectorAll('button, [role="button"]');

  buttons.forEach(button => {
    const svg = button.querySelector('svg');
    const allTextInsideButton = button.textContent.trim();

    if (svg && allTextInsideButton === '') {
        const matchingIcon = getMatchingLabel(svg, button_data);
        if(matchingIcon) {
            const label = matchingIcon.label;
            const hcid = matchingIcon?.hcid;
            if (label && button.getAttribute('aria-label') !== label) {
                button.setAttribute('aria-label', label);
            }
            if (hcid && button.getAttribute('data-hcid') != hcid) {
                button.setAttribute('data-hcid', hcid);
            }
        }
        }
    });
}

function getMatchingLabel(svg, button_data) {
  const elements = svg.querySelectorAll('path, polyline');

  for (const element of elements) {
    const matchingIcon = button_data.find(icon => {
      if (element.tagName === 'path') {
        return element.getAttribute('d') === icon.svg;
      } else if (element.tagName === 'polyline') {
        return element.getAttribute('points') === icon.svg;
      }
    });

    if (matchingIcon) {
      return matchingIcon;
    }
  }

  const svgInnerHTML = svg.innerHTML.trim();
  const matchingIcon = button_data.find(icon => {
    return svgInnerHTML.includes(icon.svg);
  });

  return (matchingIcon || null);
}

// functions to interact with the labeled buttons
function getButtonByLabel(label, index) {
  // Find all buttons
  const allButtons = Array.from(document.querySelectorAll('button'));
  
  // Filter buttons based on aria-label or trimmed textContent
  const matchingButtons = allButtons.filter(button => {
    const ariaLabel = button.getAttribute('aria-label');
    const trimmedText = button.textContent.trim();
    return ariaLabel === label || trimmedText === label;
  });
  
  // If no index is provided, return all found buttons as an array
  if (index === undefined) {
    return matchingButtons;
  }
  
  // Normalize the index to handle negative indices
  const normalizedIndex = index < 0 ? matchingButtons.length + index : index;
  
  // Return the button at the specified index, or null if not found
  return normalizedIndex >= 0 && normalizedIndex < matchingButtons.length
    ? matchingButtons[normalizedIndex]
    : null;
}
function clickLastButtonWithLabel(label) {
    button = getButtonByLabel(label, -1);
    if(button) {
        button.click();
    }
}

function startNewChatWithButton() {
    if(whereClaude() === "frontPage") {
        clickLastButtonWithLabel('Start Chat');
    }
    else {
        clickLastButtonWithLabel('new chat');
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

// speech

// browser speech (added for debugging for now)

function browserSpeakString(text) {
  // Check if speech synthesis is supported
  if (!'speechSynthesis' in window) {
    console.error('Speech synthesis not supported in this browser.');
    return;
  }

  // Create a new speech synthesis utterance
  var utterance = new SpeechSynthesisUtterance(text);

  // Optionally, customize the utterance properties
  utterance.volume = 1; // Volume: 0 to 1
  utterance.rate = 5; // Speed: 0.1 to 10
  utterance.pitch = 1; // Pitch: 0 to 2

  // Use the default system voice or choose a specific one
  utterance.voice = speechSynthesis.getVoices().find(voice => voice.default);

  // Speak the text
  speechSynthesis.speak(utterance);
}

function stopBrowserSpeech() {
  // Check if speechSynthesis is supported
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported in this browser.');
    return;
  }

  // Check if speech is currently active
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel(); // Stop the speech synthesis
    console.log('Speech stopped.');
  } else {
    console.log('No active speech.');
  }
}

// OpenAI speech

function isAudioPlaying(audio) {
  return !audio.paused && !audio.ended && audio.currentTime > 0;
}

function setOpenaiSpeechRate(desiredSpeed) {
  const openaiAudioElem = document.querySelector('audio');
  if (openaiAudioElem && isAudioPlaying(openaiAudioElem) && openaiAudioElem.playbackRate !== desiredSpeed) {
    openaiAudioElem.playbackRate = parseFloat(desiredSpeed);
  }
}

// function to fix the checkbox buttons in the custom instructions screen
function updateCheckboxButtons() {
    // Select all checkboxes within button elements
    const checkboxButtons = document.querySelectorAll('button input[type="checkbox"]');

    // Iterate over each checkbox found
    checkboxButtons.forEach(checkboxButton => {
        // Find the closest parent button element
        const parentButton = checkboxButton.closest('button');
        
        if (parentButton) {
            // Set the role to 'checkbox' if it's not already set
            if (parentButton.getAttribute('role') !== 'checkbox') {
                parentButton.setAttribute('role', 'checkbox');
            }

            // Set the initial state of 'aria-checked' based on the checkbox's checked state
            parentButton.setAttribute('aria-checked', checkboxButton.checked.toString());

            checkboxButton.setAttribute('tabindex', '-1');
        }
    });
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

// function to open the options page
function openHearChatOptionsPage() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options/options.html'));
  }
}

// functions to update settings automatically


// Function to set the value of a specific setting
async function setSettingValue(storageKey, settingKey, newValue) {
    // Get the current settings from Chrome Storage
    let userSettings = await restoreChromeSyncData(storageKey);

    // Set the settingKey to the new value
    userSettings[settingKey] = newValue;

    // Save the updated settings back to Chrome Storage
    chrome.storage.sync.set({ [storageKey]: userSettings });
}

// Function to retrieve the value of a specific setting
async function getSettingValue(storageKey, settingKey) {
    // Get the current settings from Chrome Storage
    let userSettings = await restoreChromeSyncData(storageKey);
    
    // Return the value of the specific settingKey, or null if it doesn't exist
    return userSettings.hasOwnProperty(settingKey) ? userSettings[settingKey] : null;
}

// Function to retrieve data from Chrome Storage
function restoreChromeSyncData(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (data) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(data[key] || {});
        });
    });
}

// function to toggle enter and shift-enter and settings

async function toggleEnterSettingOnPrompt() {
    let enterSettingValue = await getSettingValue(hearChatOptionKey, 'swapEnterShiftEnterOnPrompt');
    await setSettingValue(hearChatOptionKey, 'swapEnterShiftEnterOnPrompt', !enterSettingValue);
    togglePromptEnterListener(!enterSettingValue);
    announceMessage(`Enter and shift-enter swapped: ${!enterSettingValue ? 'use shift-enter to submit messages and enter to make a newline' : 'use enter to submit messages and shift-enter to make newlines'}.`);
}