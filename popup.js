console.log('script loaded');

async function emulateUserKeyPress(response) {
    function getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            left: Math.floor(rect.left) + window.scrollX,
            top: Math.floor(rect.top) + window.scrollY,
        };
    }

    const localLog = await chrome.storage.local.get(['log']);
    if (!localLog) {
        return;
    }

    const actions = JSON.parse(localLog.log)
    let nextAction = (index) => {
        if (!actions || actions.length === 0) {
            return null;
        }

        if (index + 1 < actions.length) {
            return actions[index + 1];
        }
        return null;
    };

    let nextActionHandler = (index) => {
        const _nextAction = nextAction(index);
        if (_nextAction) {
            setTimeout(() => {
                actionHandler(_nextAction, index + 1);
            }, _nextAction.timeShift);
        }
    }

    let actionHandler = (action, index) => {
        const element = document.querySelector(action.element);
        if (action.type === 'keydown') {
            chrome.runtime.sendMessage({type: 'sendKey', action}, () => {
                nextActionHandler(index);
            });
        } else
        if (action.type === 'click') {
            if (element) {
                const offset = getOffset(element);
                const newAction = {
                    ...action,
                    value: {
                        button: action.value,
                        x: offset.left + 5,
                        y: offset.top + 5,
                    }
                };
                chrome.runtime.sendMessage({type: 'sendKey', action: newAction}, () => {
                    nextActionHandler(index);
                });
            } else {
                nextActionHandler(index);
            }
        } else {
            nextActionHandler(index);
        }
    }
    actionHandler(actions[0], 0);
}

document.addEventListener('DOMContentLoaded', async () => {
    let log = [];

    const isRecordingSetting = await chrome.storage.local.get(['isRecording']);
    let isRecording = isRecordingSetting.isRecording || false;


    const replayButton = document.querySelector('#emulateKeyButton');
    replayButton.addEventListener('click', async () => {
        // const localLog = await chrome.storage.local.get(['log']);
        // console.log(JSON.parse(localLog.log));

        let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: emulateUserKeyPress,
        });
    });
    chrome.runtime.sendMessage({isRecording});


    const recordButton = document.querySelector('#recordButton');
    const autoSaveInput = document.querySelector('#auto-save-settings');

    recordButton.innerHTML = isRecording ? 'Stop Recordinin' : 'Start Recording';
    recordButton.addEventListener('click', async () => {
        isRecording = !isRecording;
        chrome.runtime.sendMessage({isRecording});
        chrome.storage.local.set({['isRecording']: isRecording});
        recordButton.innerHTML = isRecording ? 'Stop Recordinin' : 'Start Recording';

        if (isRecording) {
            log = [];
            chrome.storage.local.set({['log']: JSON.stringify(log)});
            chrome.storage.local.set({['startTime']: Date.now()});

        } else {
            if (autoSaveInput.checked) {
                // chrome.storage.local.set({['log']: JSON.stringify(log)});
            }
        }
    });

    const resetButton = document.querySelector('#reset-bnt');
    resetButton.addEventListener('click', () => {
        isRecording = false;
        log = [];
        recordButton.innerHTML = 'Start Recording';
        chrome.storage.local.set({['isRecording']: isRecording});
        chrome.storage.local.set({['log']: JSON.stringify(log)});
    });
});
