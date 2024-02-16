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
    // Create a new heading element
    const heading = document.createElement('h' + headingLevel);
    // Move the divNode's textContent to the heading element
    heading.textContent = divNode.textContent;
    // Clear the divNode's existing content
    divNode.textContent = '';
    // Append the heading to the divNode
    divNode.appendChild(heading);

    return heading;
}

function headingifyAllAssistantNameDivs(headingLevel) {
    let nameDivs = getAssistantNameDivs();
    nameDivs.forEach(div => {
        headingifyDiv(div, headingLevel);
    });
}

// headingifyAllAssistantNameDivs(4);

// labeling
// Assuming unlabeledButtonIcons is already declared and initialized

// Function to add aria-labels to buttons based on SVG "d" attribute matching and ensuring no text content
function labelButtonsWithIcons() {
  unlabeledButtonIcons.forEach(icon => {
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

// event listener to execute code after the document loads

document.addEventListener('DOMContentLoaded', function() {
    // Execute the function to label the buttons
    labelButtonsWithIcons();

    // headingify all assistant names (for old or shared chats)
    headingifyAllAssistantNameDivs(4);

});

// Let's set up a MutationObserver to listen for changes in the DOM
const observer = new MutationObserver(mutations => {
  // For simplicity, we'll call labelButtonsWithIcons on any DOM change.
  labelButtonsWithIcons();

  // Extend the logic to check for the specific addition or removal of the "Stop generating" button
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      // Check for the addition of nodes
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an element node
          if (node.matches('button[aria-label="Stop generating"]') || node.querySelector('button[aria-label="Stop generating"]')) {
            console.log('the GPT is now responding.');
            announceMessage('responding ...');
            playSound('alarm_beep.mp3');
          }
            // check for adding of a new conversation turn div
            if (node.querySelector('div[data-testid^="conversation-turn-"]')) {
    headingifyAllAssistantNameDivs(4);
    // if this condition is hit, it must be just after the page loaded so might as well get them all
}
else if(node.matches('div[data-testid^="conversation-turn-"]') && (isAssistantTurnDiv(node) === 1)) {
    let assistantNameDiv = getNameDiv(node);
        headingifyDiv(assistantNameDiv, 4);
};
        }
      });

      // Check for the removal of nodes
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an element node
          if (node.querySelector('button[aria-label="Stop generating"]')) {
            announceMessage('finished responding');
                playSound('fanfare.mp3');
          }
        }
      });
    }
  });
});

// Start observing the document body for child list changes and subtree modifications
observer.observe(document.body, { childList: true, subtree: true });

