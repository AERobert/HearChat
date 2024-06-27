/*
    * observer.js
    edited on 2024-04-20
    * Robert Eggleston
    * defines monitors (in the form of events and observer objects) to the DOM in order to trigger code at specific changes.
    * expects to be run after utils.js and button_data.js
*/

// constants

const INTERVALDEMONDELAY = 500; // the amount of time (in ms) the backup heading demon will wait between checks.

// functions to be used in the big observer 

function didRespondingStart(node, settings) {
    if (node.matches('button[aria-label="Stop generating"]') || node.querySelector('button[aria-label="Stop generating"]')) {
        console.log('The GPT is now responding.');
        announceMessage(settings.startingAnnouncement);
        playSound(settings.startingSound);
        node.setAttribute('data-sending', 'true');
    }
}

function didRespondingFinish(node, settings) {
    if (node.querySelector('button[aria-label="Stop generating"]')) {
        announceMessage(settings.finishingAnnouncement);
        playSound(settings.finishingSound);
        speakLastResponse(settings.finishedSpeakResponse);
    }
    else if (node.getAttribute('aria-label') === 'send message' && node.getAttribute('data-sending') === 'true') {
        announceMessage(settings.finishingAnnouncement);
        playSound(settings.finishingSound);
        speakLastResponse(settings.finishedSpeakResponse);
    }
}

function checkNewAssistantTurnToHeadingify(node, headingLevel) {
    // Check for adding of a new conversation turn div
    if (node.querySelector('div[data-testid^="conversation-turn-"]')) {
        setTimeout(() => headingifyAllAssistantNameDivs(headingLevel), INTERVALDEMONDELAY);
        // some update stops the observer from updating the first heading in a new chat, so this just sets up a demon to check continuously
    } else if (node.matches('div[data-testid^="conversation-turn-"]') && (isAssistantTurnDiv(node) === 1)) {
        let assistantNameDiv = getNameDiv(node);
        headingifyDiv(assistantNameDiv, headingLevel);
    }
}

function hearChatGeneralAccesibilityCheck(settings) {
    // Execute the function to label the buttons
    labelButtonsWithIcons(unlabeledButtonIcons);

    // execute function to give divs correct roles
    fixButtonTypedDivs();

    // fix checkbox buttons
    updateCheckboxButtons();

    // headingify all assistant names (for old or shared chats)
    headingifyAllAssistantNameDivs(settings.desiredHeadingLevel);
    headingifyChat(settings.desiredHeadingLevel);
    // console.log("should have just headingifyed some headings.");

    // show buttons for each response, if the user wants
    showAllButtons(settings.showAllButtons);

    // set Openai's speech rate to the desired reading speed
    setOpenaiSpeechRate(settings.openaiSpeechReadingSpeed);

    // reverse enter and shift-enter on prompt textarea (if wanted)
    togglePromptEnterListener(settings.swapEnterShiftEnterOnPrompt);

    // add listener to block propagation of the enter shift-enter swap shortcut
    stopModEnterOnPromptPropagating();
}

function observeAndListen(settings) {// timeout to wait for the DOM to fully load before executing initial code.
// Todo: figure out how to make this all more elegant.

    // setup demon on timer to constantly check for issues (in case observer misses something)
    const interval = setInterval(() => hearChatGeneralAccesibilityCheck(settings), INTERVALDEMONDELAY);

// Let's set up a MutationObserver to listen for changes in the DOM
const observer = new MutationObserver(mutations => {
  // For simplicity, we'll check for unlabeled buttons and roleless divs on any DOM change.
  labelButtonsWithIcons(unlabeledButtonIcons);
  fixButtonTypedDivs();

  // Check for the specific addition or removal of the "Stop generating" button
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      // Check for the addition of nodes
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an Element node
          didRespondingStart(node, settings);
          checkNewAssistantTurnToHeadingify(node, settings.desiredHeadingLevel);
        }
      });

      // Check for the removal of nodes
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an Element node
          didRespondingFinish(node, settings);
        }
      });
    } else if (mutation.type === 'attributes' && mutation.target.getAttribute('data-hcid') === 'sendStopMessage') {
      const button = mutation.target;
      const ariaLabel = button.getAttribute('aria-label');

      if (ariaLabel === 'Stop generating') {
        // Trigger the start responding code
        didRespondingStart(button, settings);
      } else if (ariaLabel === 'send message') {
        // Trigger the stopped responding code
        didRespondingFinish(button, settings);
      }
    }
  });
});

// Start observing the document body for child list changes, subtree modifications, and attribute changes
observer.observe(document.body, { childList: true, subtree: true, attributeFilter: ['aria-label'] });

    return {
        "interval": interval,
        "observer": observer
    }
}