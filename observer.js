/*
    * utils.js
    edited on 2024-02-16
    * Robert Eggleston
    * defines monitors (in the form of events and observer objects) to the DOM in order to trigger code at specific changes.
    * expects to be run after utils.js and button_data.js
*/

// event listener to execute code after the document loads

document.addEventListener('DOMContentLoaded', function() {
    // Execute the function to label the buttons
    // labelButtonsWithIcons(unlabeledButtonIcons);

    // headingify all assistant names (for old or shared chats)
    setTimeout(() => headingifyAllAssistantNameDivs(4), 1000);

});

// Let's set up a MutationObserver to listen for changes in the DOM
const observer = new MutationObserver(mutations => {
  // For simplicity, we'll call labelButtonsWithIcons on any DOM change.
  labelButtonsWithIcons(unlabeledButtonIcons);

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
    setTimeout(() =>  headingifyAllAssistantNameDivs(4), 500);
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

