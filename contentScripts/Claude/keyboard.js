/*
    * keyboard.js
    edited on 2024-04-24
    * Robert Eggleston
    * contains misc functions to be used lader in the extension
    * third content script run
*/

// Constants
const MAX_SEQUENCE_LENGTH = 2;
const ALLOWED_KEYCODES = [
  // Alphabet keys
  ...Array.from({length: 26}, (_, i) => `Key${String.fromCharCode(65 + i)}`),
  // Digit keys
  ...Array.from({length: 10}, (_, i) => `Digit${i}`),
  // Special characters
  "Semicolon", "Comma", "Period", "Slash", "Backslash", "BracketLeft",
  "BracketRight", "Quote", "Backquote", "Minus", "Equal"
];

// Key sequence configuration
const KEY_SEQUENCES = {
  'KeyA': {
    'KeyC': () => clickLastButtonWithLabel('copy contents'),
    'KeyD': () => clickLastButtonWithLabel('download to file'),
    'KeyR': () => clickLastButtonWithLabel('refresh')
  },
  'KeyP': {
    'KeyC': goToCreateProjectPage,
    'KeyP': () => document.querySelector('a[href="/projects"]').click(),
    'KeyU': clickUseProjectButton
  }
};

// Single key shortcuts
const SINGLE_KEY_SHORTCUTS = {
  'KeyS': toggleLastResponseSpeech,
  'KeyR': () => clickLastButtonWithLabel('Retry'),
  'KeyE': () => clickLastButtonWithLabel('Edit'),
  'KeyC': () => clickLastButtonWithLabel('Copy Response'),
  'Semicolon': () => clickLastButtonWithLabel('Copy Code'),
  'KeyB': badResponseShortcut,
  'KeyO': () => document.querySelector('a[href="/new"]').click(),
  'KeyU': () => document.querySelector('input[aria-label="Upload files"]').click(),
  'Enter': toggleEnterSettingOnPrompt,
  'KeyH': openHearChatOptionsPage
};

// State
let keySequence = [];
let sequenceTimer = null;

// Utility functions
function clearKeySequence() {
  keySequence = [];
  if (sequenceTimer) {
    clearTimeout(sequenceTimer);
    sequenceTimer = null;
  }
}

function isShortcutPressed(event) {
  const os = navigator.platform.toUpperCase();
  const isWindows = os.includes('WIN');
  const isMac = os.includes('MAC');
  const isLinux = os.includes('LINUX');

  return (isWindows && event.ctrlKey && event.altKey && event.shiftKey) ||
         ((isMac || isLinux) && event.metaKey && event.altKey && event.shiftKey);
}

// Event handlers
function handleKeyDown(event) {
  if (!isShortcutPressed(event) || !ALLOWED_KEYCODES.includes(event.code)) {
    clearKeySequence();
    return;
  }

  event.preventDefault();
  keySequence.push(event.code);

  if (keySequence.length === 1) {
    sequenceTimer = setTimeout(() => {
      if (keySequence.length === 1 && SINGLE_KEY_SHORTCUTS[keySequence[0]]) {
        SINGLE_KEY_SHORTCUTS[keySequence[0]]();
      }
      clearKeySequence();
    }, 1000); // Adjust this delay as needed
  } else if (keySequence.length === 2) {
    clearTimeout(sequenceTimer);
    const [firstKey, secondKey] = keySequence;
    if (KEY_SEQUENCES[firstKey] && KEY_SEQUENCES[firstKey][secondKey]) {
      KEY_SEQUENCES[firstKey][secondKey]();
    }
    clearKeySequence();
  }
}

function handleEnterOnPrompt(event) {
  const justEnterOrShiftEnter = !(event.altKey || event.metaKey || event.ctrlKey);

  if (justEnterOrShiftEnter && event.shiftKey && event.code === 'Enter') {
    event.preventDefault();
    const sendButton = document.querySelector('button[data-testid="send-button"]') || 
                       document.querySelector('button[data-hcid="sendStopMessage"]');
    sendButton?.click();
  } else if (justEnterOrShiftEnter && event.key === 'Enter') {
    event.stopPropagation();
  }
}

// Setup functions
function setupKeyboardListeners() {
  document.addEventListener('keydown', handleKeyDown);
}

function togglePromptEnterListener(enable) {
  const promptTextarea = document.getElementById('prompt-textarea');
  const dataAttribute = 'data-event-keydown-shiftEnterSending';

  if (enable && promptTextarea && promptTextarea?.getAttribute(dataAttribute) !== 'true') {
    promptTextarea.addEventListener('keydown', handleEnterOnPrompt);
    promptTextarea.setAttribute(dataAttribute, 'true');
  } else if (!enable && promptTextarea && promptTextarea?.getAttribute(dataAttribute) === 'true') {
    promptTextarea.removeEventListener('keydown', handleEnterOnPrompt);
    promptTextarea.setAttribute(dataAttribute, 'false');
  }
}

function stopModEnterOnPromptPropagating() {
  const promptTextarea = document.getElementById('prompt-textarea');
  const dataAttribute = 'data-event-keydown-stopEnterShortcutBubbling';

  if (promptTextarea && promptTextarea.getAttribute(dataAttribute) !== 'true') {
    promptTextarea.setAttribute(dataAttribute, 'true');
    promptTextarea.addEventListener('keydown', (event) => {
      if (isShortcutPressed(event) && event.code === 'Enter') {
        event.stopPropagation();
        toggleEnterSettingOnPrompt();
      }
    });
  }
}

// Initialize
setupKeyboardListeners();
togglePromptEnterListener(true);
stopModEnterOnPromptPropagating();