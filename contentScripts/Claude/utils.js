/*
    * utils.js
    edited on 2024-06-25
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * first content script run
*/

// misc

/*
function getAriaDescription(element) {
    // Check if the element has the 'aria-describedby' attribute
    const describedBy = element.getAttribute('aria-describedby');
    
    if (!describedBy) {
        // Return null if 'aria-describedby' attribute is missing
        // console.log('No aria-describedby attribute found.');
        return null;
    }
    
    // Find the element that is described by the id
    const descriptionElement = document.getElementById(describedBy);
    
    if (descriptionElement) {
        // Return the text content of the description element
        // console.log('Description found:', descriptionElement.textContent);
        return descriptionElement.textContent;
    } else {
        // Return null if the description element does not exist
        // console.log('No element found with the ID provided by aria-describedby.');
        return null;
    }
}
*/

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickLinkWithHref (href) {
  // Get the full URL
  const fullUrl = new URL(href, window.location.origin).href;

  // Check if a link with the matching href exists
  let link = document.querySelector(`a[href="${href}"]`);
  let createdNewLink = false;

  /* if (!link) {
    // If no matching link exists, create a new one
    link = document.createElement('a');
    link.href = href;
    link.style.display = 'none';
    document.body.appendChild(link);
    createdNewLink = true;
  } */

  // Click the link
  link.click();

  // Wait for the page to navigate to the new URL
  await new Promise((resolve) => {
    const checkUrl = setInterval(() => {
      if (window.location.href === fullUrl) {
        clearInterval(checkUrl);
        resolve();
      }
    }, 100);
  });

  // the link if added should probably be removed, but it was causing errors when I tried so...
}

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
accessibilityAnnouncementsDiv.setAttribute('role', 'status');
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
    
    audio.play()
        .then(() => {
            // console.log(`Played '${filename}'`);
        })
        .catch((error) => {
            if (error.name === "NotAllowedError") {
                // console.warn(`Unable to play '${filename}': User interaction required.`);
                // You might want to add some user-facing notification here
            } else {
                console.error(`Error playing '${filename}':`, error);
            }
        });
}

// headingifying Claude Style

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

function headingifyChat(headingLevel) {
  // Find all divs with the class "font-claude-message"
  const messageDivs = document.querySelectorAll('div.font-claude-message');

  // Validate the heading level
  if (headingLevel && (headingLevel < 1 || headingLevel > 6 || !Number.isInteger(headingLevel))) {
    console.error('Invalid heading level. Please use a number between 1 and 6.');
    return;
  }

  messageDivs.forEach(div => {
    const previousElement = div.previousElementSibling;
        const newHeadingTag = 'H' +headingLevel;

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

    // Create new heading element
    const newHeading = createVisuallyHiddenElement(newHeadingTag, 'Claude');

    // Replace or insert the new heading
    if (previousElement && previousElement.tagName.match(/^H[1-6]$/)) {
      previousElement.replaceWith(newHeading);
    } else {
      div.parentNode.insertBefore(newHeading, div);
    }
  });
}

// message stopping and starting demon hooks


// labeling

// unlabeledButtonsIcons is defined in button_data.js
// Function to add aria-labels to buttons based on SVG "d" attribute matching and ensuring no text content

function labelButtonsWithIcons(button_data) {
  const buttons = document.querySelectorAll('button, [role="button"]');

  buttons.forEach(button => {
    const svg = button.querySelector('svg');
    const allTextInsideButton = button.textContent.trim();

    if (svg) {
        const matchingIcon = getMatchingLabel(svg, button_data);
        if(matchingIcon) {
            const label = matchingIcon.label;
            const hcid = matchingIcon?.hcid;
            if (label && button.getAttribute('aria-label') !== label && allTextInsideButton === '') {
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
    const hcid = button.getAttribute('data-hcid');
    return [trimmedText, ariaLabel, hcid].includes( label);
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
    return button
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

async function clickUseProjectButton() {
      if (!location.href.endsWith('/new')) {
        await clickLinkWithHref('/new')
        await delay(100);
      }
    const useProjectButton = (getButtonByLabel('Use a project', -1) || getButtonByLabel('Change project', -1));
      useProjectButton.click(); // presses `use a project` if no project is selected, and `change project` if one is already
    }

async function goToCreateProjectPage() {
    await clickLinkWithHref('/projects');
    while (!document.querySelector('a[href="/projects/create"]')) await delay(100);
    await clickLinkWithHref('/projects/create');
}

function badResponseShortcut() {
    clickLastButtonWithLabel('thumbs down');
    setTimeout(() => [...document.querySelectorAll('button')].find(btn => btn.textContent.includes('More...')).click(), 250);
}

// distinguishing copy code and response buttons


function isCopyCodeButton(button) {
  // Get the parent of the parent (two levels up)
  let grandparent = button.parentElement.parentElement;
  
  // Check if there's a next sibling
  if (grandparent.nextElementSibling) {
    let nextSibling = grandparent.nextElementSibling;
    
    // Check if the next sibling has a first child
    if (nextSibling.firstElementChild) {
      let firstChild = nextSibling.firstElementChild;
      
      // Check if the first child is a div
      if (firstChild.tagName.toLowerCase() === 'div') {
        // Check if the first child has a class that contains "code-block"
        return firstChild.className.includes('code-block');
      }
    }
  }
  
  return false;
}

function getDistinguishedCopyButtons(matchCodeBlock) {
  // Get all possible Copy buttons on the page
  const allButtons = getButtonByLabel('Copy');
  
  // Filter the buttons based on the matchCodeBlock condition
  const filteredButtons = Array.from(allButtons).filter(button => {
    const hasCodeBlockAncestor = isCopyCodeButton(button);
    return matchCodeBlock ? hasCodeBlockAncestor : !hasCodeBlockAncestor;
  });
  
  return filteredButtons;
}

function labelCopyCodeButtons() {
    const copyCodeButtons = getDistinguishedCopyButtons(true);
    const copyResponseButtons = getDistinguishedCopyButtons(false);

    copyCodeButtons.forEach((button) => {
        button.setAttribute('aria-label', 'Copy Code');
    });

    copyResponseButtons.forEach((button) => {
        button.setAttribute('aria-label', 'Copy Response');
    });
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

// role="status" elements are really annoying

function speakRoleStatusElementsOnce() {
    const statusElements = document.querySelectorAll('[role="status"]');
    statusElements.forEach(element => {
    element.removeAttribute('role');
  announceMessage(element.textContent);
  });
    return statusElements.length; // Returns the number of elements changed
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