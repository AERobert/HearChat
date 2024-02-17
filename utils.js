/*
    * utils.js
    edited on 2024-02-16
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * expects to be first content script run
*/

// set up basic announcement system

// create invisible div to contain accessibility announcements
const accessibilityAnnouncementsDiv = document.createElement('div');

// adds aria attributes to make div useful
accessibilityAnnouncementsDiv.setAttribute('role', 'alert');
haccessibilityAnnouncementsDiv.id = 'accessibility-announcements';

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
// Assuming unlabeledButtonIcons is already declared and initialized

// Function to add aria-labels to buttons based on SVG "d" attribute matching and ensuring no text content

function labelButtonsWithIcons(button_data) {
  button_data.forEach(icon => {
    // Find all buttons on the page
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
      // Make sure the button contains only an SVG (no additional text)
      const svg = button.querySelector('svg');
      const allTextInsideButton = button.textContent.trim();
      
      // Check if SVG is directly inside the button and button has no other text
      if (svg && allTextInsideButton === '') {
        // Find all paths within the SVG and check if any match the icon's svg property
        const paths = svg.querySelectorAll('path');
        paths.forEach(path => {
          if (path.getAttribute('d') === icon.svg) {
            // If a matching path is found, set the button's aria-label
            button.setAttribute('aria-label', icon.name);
          }
        });
      }
    });
  });
}


