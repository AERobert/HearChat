/*
    * utils.js
    edited on 2024-04-24
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * first content script run
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

// headingifying for Juce interface

function createVisuallyHiddenElement(tag, text) {
  // Create the element
  const element = document.createElement(tag);
  
  // Set the text content
  element.textContent = text;
  
  // Apply the visually-hidden styles
  element.style.clip = 'rect(0 0 0 0)';
  element.style.clipPath = 'inset(50%)';
  element.style.height = '1px';
  element.style.overflow = 'hidden';
  element.style.position = 'absolute';
  element.style.whiteSpace = 'nowrap';
  element.style.width = '1px';
  
  return element;
}

function hasResultThinkingDescendant(element) {
  return element.querySelector('.result-thinking') !== null;
}

function getCurrentGptFromUrl(urlString=null) {
  if (!urlString) urlString = location.href;
  // Parse the URL
  const url = new URL(urlString);
  
  // Get the pathname and split it into segments
  const pathSegments = url.pathname.split('/');
  
  // Find the segment that starts with 'g-'
  const chatbotSegment = pathSegments.find(segment => segment.startsWith('g-'));
  
  if (!chatbotSegment) {
    return "ChatGPT";
  }
  
  // Remove the 'g-' prefix and any alphanumeric characters immediately following it
  const nameWithoutPrefix = chatbotSegment.replace(/^g-[a-zA-Z0-9]+-/, '');
  
  // Split the remaining string by hyphens
  const words = nameWithoutPrefix.split('-');
  
  // Capitalize the first letter of each word and join with spaces
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
               .join(' ');
}

function headingifyChat(headingLevel) {
  // Find all divs with the data-message-author-role "assistant"
  const messageDivs = document.querySelectorAll('div[data-message-author-role="assistant"]');
    const currentGpt = getCurrentGptFromUrl();
    const newHeadingTag = 'H' +headingLevel;

  // Validate the heading level
  if (headingLevel && (headingLevel < 1 || headingLevel > 6 || !Number.isInteger(headingLevel))) {
    console.error('Invalid heading level. Please use a number between 1 and 6.');
    return;
  }

  messageDivs.forEach(div => {
    const previousElement = div.previousElementSibling;

        // return if the previous element is already at the desired heading level
        if (previousElement && previousElement.tagName === newHeadingTag) {
            return;
        }
    else if (!headingLevel) {
        if (previousElement && previousElement.tagName.match(/^H[1-6]$/)) {
            previousElement.remove();
        }
        return;
    }

          if (hasResultThinkingDescendant(div)) return; // a weird hidden div with the class `result-thinking` was adding extra headings

    // Create new heading element
    const newHeading = createVisuallyHiddenElement(newHeadingTag, currentGpt);

    // Replace or insert the new heading
    if (previousElement && previousElement.tagName.match(/^H[1-6]$/)) {
      previousElement.replaceWith(newHeading);
    } else {
      div.parentNode.insertBefore(newHeading, div);
    }
  });
}

// headingifying the assistant name divs (for old interface, but don't want to remove it incase someone is still using that one)

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
            const hcid = getHcidFromIcon(matchingIcon);
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

function getHcidFromIcon(iconObj) {
    if ('hcid' in iconObj) {
        return iconObj.hcid;
    }
    else {
        return iconObj.label;
    }
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
  // Construct the selectors based on the provided label
  const ariaLabelSelector = `button[aria-label="${label}"]`;
  const textContentSelector = `button`;
  
  // Find all buttons with the specified aria-label or matching text content
  const buttons = Array.from(document.querySelectorAll(ariaLabelSelector))
    .concat(
      Array.from(document.querySelectorAll(textContentSelector))
        .filter(button => button.textContent.trim() === label)
    );
  
  // Remove duplicates (in case a button matches both criteria)
  const uniqueButtons = Array.from(new Set(buttons));
  
  // If no index is provided, return all found unique buttons as an array
  if (index === undefined) {
    return uniqueButtons;
  }
  
  // Normalize the index
  const normalizedIndex = index < 0 ? uniqueButtons.length + index : index;
  
  // Return the button at the specified index, or null if not found
  return uniqueButtons[normalizedIndex] || null;
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

