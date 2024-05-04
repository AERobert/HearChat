/*
    * keyboard.js
    edited on 2024-04-24
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * third content script run
*/

// function to easily check for cross platform shortcuts

function isShortcutPressed(event, keycode) {
    // Determine the operating system
    const os = navigator.platform.toUpperCase();

    // Define system-specific flags for key combinations
    let isWindows = os.includes('WIN');
    let isMac = os.includes('MAC');
    let isLinux = os.includes('LINUX');

    // Define the modifier keys based on the operating system
    let isControlPressed = event.ctrlKey;
    let isAltPressed = event.altKey;
    let isShiftPressed = event.shiftKey;
    let isMetaPressed = event.metaKey; // Command key on Mac

    // Check if the correct key is pressed along with the modifier keys
    if (keycode.toUpperCase() === event.code.toUpperCase()) {
        if (isWindows) {
            return isControlPressed && isAltPressed && isShiftPressed;
        } else if (isMac || isLinux) { // macOS and other systems
            return isMetaPressed && isAltPressed && isShiftPressed;
        } else { // Default case for other systems, similar to Mac
            return isMetaPressed && isAltPressed && isShiftPressed;
        }
    }

    return false;
}


// function that adds keyboard shortcuts

function addShortcutsToButtons() {
    document.addEventListener('keydown', function(event) {
        // attach speaking shortcut to 'S'
        if (isShortcutPressed(event, 'KeyS')) {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            toggleLastResponseSpeech();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // attach r to regenerate shortcut.
        if (isShortcutPressed(event, 'KeyR')) {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            clickLastButtonWithLabel('regenerate');
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // attach 'B' to bad response shortcut
        if (isShortcutPressed(event, 'KeyB')) {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            badResponseShortcut();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        // attach 'E' to shortcut to edit the last input
        if (isShortcutPressed(event, 'KeyE')) {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            clickLastButtonWithLabel('edit');
        }
    });

    document.addEventListener('keydown', function(event) {
        // attach 'Enter' plus the assigned key combination (based on the system) to swap the enter and shift-enter functionality
        if (isShortcutPressed(event, 'Enter')) {
            event.preventDefault();  // Prevent any default behavior associated with this key combination
            updateSetting('hearChatStoredOptions', 'swapEnterShiftEnterOnPrompt');
            announceMessage('Swapped enter and shift-enter (use shift-enter to submit messages)');
        }
    });

    document.addEventListener('keydown', function(event) {
        // attach 'H' to shortcut that opens the HearChat options page
        if (isShortcutPressed(event, 'KeyH')) {
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
