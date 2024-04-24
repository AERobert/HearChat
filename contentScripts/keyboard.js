/*
    * keyboard.js
    edited on 2024-04-24
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * third content script run
*/

// function that adds keyboard shortcuts

function addShortcutsToButtons() {
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'S' (event.key === 'S')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyS') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            toggleLastResponseSpeech();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'R' (event.key === 'R')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyR') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            clickLastButtonWithLabel('regenerate');
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'B' (event.key === 'B')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyB') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            badResponseShortcut();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'E' (event.key === 'E')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyE') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            clickLastButtonWithLabel('edit');
        }
    });

    document.addEventListener('keydown', function(event) {
        // Check if Command (metaKey), Option (altKey), Shift (shiftKey) are pressed along with 'H' (event.key === 'H')
        if (event.metaKey && event.altKey && event.shiftKey && event.code === 'KeyH') {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            openHearChatOptionsPage();
        }
    });
}

// easily invert enter and shift-enter on the prompt textarea
function handleEnterOnPrompt(event) {
    if (event.shiftKey && event.key === 'Enter') {
        const sendButton = document.querySelector('button[data-testid="send-button"]');
        event.preventDefault();
        sendButton.click();
    }
    else if (event.key === 'Enter') {
        event.stopPropagation();
    }
}

function togglePromptEnterListener(enable) {
    const promptTextarea = document.getElementById('prompt-textarea');
    // Check the data attribute instead of hasEventListener
    const listenerOnTextarea = (promptTextarea && promptTextarea.getAttribute('data-event-keydown') === 'true');

    if (enable && !listenerOnTextarea) {
        promptTextarea.addEventListener('keydown', handleEnterOnPrompt);
        promptTextarea.setAttribute('data-event-keydown', 'true'); // Set the attribute when adding the listener
    } else if (!enable && listenerOnTextarea) {
        promptTextarea.removeEventListener('keydown', handleEnterOnPrompt);
        promptTextarea.setAttribute('data-event-keydown', 'false'); // Reset the attribute when removing the listener
    }
}
