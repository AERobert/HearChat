
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
accessibilityAnnouncementsDiv.style.border = '0';

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
    var audioPath = chrome.runtime.getURL(`audio/${filename}`);
    var audio = new Audio(audioPath);
    audio.play();
    console.log(`Played '${filename}'`);
}


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


// Execute the function to label the buttons
labelButtonsWithIcons();
/*
// Assuming unlabeledButtonIcons is already declared and initialized

// Function to add aria-labels to buttons based on SVG d attribute matching
function labelButtonsWithIcons() {
  unlabeledButtonIcons.forEach(icon => {
    // Find all buttons on the page
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
      // Assume SVG is directly inside the button. Adjust selector as needed.
      const svg = button.querySelector('svg');
      if (svg) {
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
*/

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
          if (node.matches('button[aria-label="Stop generating"]')) {
            console.log('The "Stop generating" button has been added.');
            // Perform any action you need when the button is added
          } else if (node.querySelector('button[aria-label="Stop generating"]')) {
            console.log('The "Stop generating" button has been added within a newly added node.');
            announceMessage('responding ...');
            playSound('alarm_beep.mp3');
          }
        }
      });

      // Check for the removal of nodes
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an element node
          if (node.matches('button[aria-label="Stop generating"]')) {
            console.log('The "Stop generating" button has been removed.');
            // Perform any action you need when the button is removed
          } else if (node.querySelector('button[aria-label="Stop generating"]')) {
            console.log('The "Stop generating" button has been removed from a node.');
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

