/*
// Function to get URL parameter
function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

// Function to wait for a specific element
function waitForElement(selector, callback) {
    var element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        setTimeout(function() {
            waitForElement(selector, callback);
        }, 500);
    }
}

function askIfAsking() {
    let askString = getUrlParameter('hcask');
    if (askString) {
        waitForElement('#prompt-textarea', function(textarea) {
            if (textarea.getAttribute('data-hcasked') !== 'true') {
                textarea.value = askString;
            }

console.log('set?');

                textarea.setAttribute('data-hcasked', 'true');

            waitForElement('button[data-testid="send-button"],button[data-hcid="sendStopMessage"]', function(sendButton) {
                sendButton.removeAttribute('disabled');
                // sendButton.click();
console.log('sent?');
            });
        });
    }
}

setTimeout(askIfAsking(), 3000);
*/