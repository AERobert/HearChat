/*
    * observer.js
    edited on 2024-06-28
    * Robert Eggleston
    * defines monitors (in the form of events and observer objects) to the DOM in order to trigger code at specific changes.
    * expects to be run after utils.js and button_data.js
*/

// Constants
const INTERVAL_DEMON_DELAY = 500; // ms between checks for the backup heading demon

// Main functions
const handleResponseStart = (node, settings) => {
  console.log('The assistant is now responding.');
  announceMessage(settings.startingAnnouncement);
  playSound(settings.startingSound);
};

const handleResponseEnd = (node, settings) => {
  announceMessage(settings.finishingAnnouncement);
  playSound(settings.finishingSound);
  speakLastResponse(settings.finishedSpeakResponse);
};

const checkNewAssistantTurn = (node, headingLevel) => {
  const assistantTurnDiv = node.matches('div[data-testid^="conversation-turn-"]') ? node : node.querySelector('div[data-testid^="conversation-turn-"]');
  if (assistantTurnDiv && isAssistantTurnDiv(assistantTurnDiv)) {
    const assistantNameDiv = getNameDiv(assistantTurnDiv);
    headingifyDiv(assistantNameDiv, headingLevel);
  }
};

const performGeneralAccessibilityChecks = (settings) => {
  labelButtonsWithIcons(unlabeledButtonIcons);
  fixButtonTypedDivs();
  // updateCheckboxButtons();
  speakRoleStatusElementsOnce();
  labelCopyCodeButtons();
  headingifyChat(settings.desiredHeadingLevel);
  // showAllButtons(settings.showAllButtons);
  // setOpenaiSpeechRate(settings.openaiSpeechReadingSpeed);
  togglePromptEnterListener(settings.swapEnterShiftEnterOnPrompt);
  stopModEnterOnPromptPropagating();
};

const observeAndListen = (settings) => {
  const interval = setInterval(() => performGeneralAccessibilityChecks(settings), INTERVAL_DEMON_DELAY);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for new message divs
            const messageDivs = node.querySelectorAll('.font-claude-message');
            messageDivs.forEach(messageDiv => {
              const parentDiv = messageDiv.closest('[data-is-streaming]');
              if (parentDiv) {
                if (parentDiv.getAttribute('data-is-streaming') === 'false') {
                  handleResponseEnd(parentDiv, settings);
                } else if (parentDiv.getAttribute('data-is-streaming') === 'true') {
                  handleResponseStart(parentDiv, settings);
                }
              }
            });

            // Check for new assistant turns
            checkNewAssistantTurn(node, settings.desiredHeadingLevel);
          }
        });
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-is-streaming') {
        const targetDiv = mutation.target;
        if (targetDiv.getAttribute('data-is-streaming') === 'true') {
          handleResponseStart(targetDiv, settings);
        } else if (targetDiv.getAttribute('data-is-streaming') === 'false') {
          handleResponseEnd(targetDiv, settings);
        }
      }
    });

    // Perform general accessibility checks after processing mutations
    performGeneralAccessibilityChecks(settings);
  });

  observer.observe(document.body, { 
    childList: true, 
    subtree: true, 
    attributes: true,
    attributeFilter: ['data-is-streaming'],
    characterData: false
  });

  return { interval, observer };
};