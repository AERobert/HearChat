/*
    * utils.js
    edited on 2024-02-16
    * Robert Eggleston
    * defines monitors (in the form of events and observer objects) to the DOM in order to trigger code at specific changes.
    * expects to be run after utils.js and button_data.js
*/

// constants

const WAITFORDOM = 500; // the amount of time (in ms) the initial code will wait for the DOM to be fully loaded.

// functions to be used in the big observer 

function didRespondingStart(node, startingMessage, startingSound) {
    if (node.matches('button[aria-label="Stop generating"]') || node.querySelector('button[aria-label="Stop generating"]')) {
        console.log('The GPT is now responding.');
        announceMessage(startingMessage);
        playSound(startingSound);
    }
}

function didRespondingFinish(node, finishingMessage, finishingSound) {
    if (node.querySelector('button[aria-label="Stop generating"]')) {
        announceMessage(finishingMessage);
        playSound(finishingSound);
    }
}

function checkNewAssistantTurnToHeadingify(node, headingLevel) {
    // Check for adding of a new conversation turn div
    if (node.querySelector('div[data-testid^="conversation-turn-"]')) {
        setTimeout(() => headingifyAllAssistantNameDivs(headingLevel), 500);
        // If this condition is hit, it must be just after the page loaded so might as well get them all
    } else if (node.matches('div[data-testid^="conversation-turn-"]') && (isAssistantTurnDiv(node) === 1)) {
        let assistantNameDiv = getNameDiv(node);
        headingifyDiv(assistantNameDiv, headingLevel);
    }
}

function observeAndListen(settings) {// timeout to wait for the DOM to fully load before executing initial code.
// Todo: figure out how to make this all more elegant.

setTimeout(function() {
    // Execute the function to label the buttons
    labelButtonsWithIcons(unlabeledButtonIcons);

    // headingify all assistant names (for old or shared chats)
    headingifyAllAssistantNameDivs(settings.desiredHeadingLevel);
    console.log("should have just headingifyed some headings.");
}, WAITFORDOM);

// Let's set up a MutationObserver to listen for changes in the DOM
const observer = new MutationObserver(mutations => {
  // For simplicity, we'll call labelButtonsWithIcons on any DOM change.
  labelButtonsWithIcons(unlabeledButtonIcons);

  // Check for the specific addition or removal of the "Stop generating" button
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      // Check for the addition of nodes
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an Element node
          didRespondingStart(node, settings.startingAnnouncement, settings.startingSound);
          checkNewAssistantTurnToHeadingify(node, settings.desiredHeadingLevel);
        }
      });

      // Check for the removal of nodes
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an Element node
          didRespondingFinish(node, settings.finishingAnnouncement, settings.finishingSound);
        }
      });
    }
  });
});

// Start observing the document body for child list changes and subtree modifications
observer.observe(document.body, { childList: true, subtree: true });

console.log(settings.startingAnnouncement);
}