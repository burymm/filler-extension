const getDifference = (startTime) => {
    const now = Date.now();
    return now - startTime;
}

document.addEventListener('click', async (event) => {
    const isRecordingStorage = await chrome.storage.local.get(['isRecording']);
    const startTimeStorage = await chrome.storage.local.get(['startTime']);
    let startTime;
    if (startTimeStorage) {
        startTime = new Date(startTimeStorage.startTime);
    }

    if (!isRecordingStorage.isRecording) {
        return;
    }
    const generateQuerySelector = function (el) {
        if (el.tagName.toLowerCase() == "html")
            return "HTML";
        let str = el.tagName;
        str += (el.id != "") ? "#" + el.id : "";
        if (el.className) {
            var classes = el.className.split(/\s/).filter(className => !className.startsWith('ng-'));
            for (var i = 0; i < classes.length; i++) {
                str += "." + classes[i];
            }
        }

        return el.parentNode ? generateQuerySelector(el.parentNode) + " > " + str : str;
    }

    const addToLogStorage = async (action) => {
        const localLog = await chrome.storage.local.get(['log']);
        const log = JSON.parse(localLog.log);
        log.push(action)
        chrome.storage.local.set({['log']: JSON.stringify(log)});
    };

    const action = {
        type: 'click',
        element: generateQuerySelector(event.target),
        value: event.button,
        timeShift: getDifference(startTime),
    };
    addToLogStorage(action);
    chrome.storage.local.set({['startTime']: Date.now()});
});

document.addEventListener('keydown', async (event) => {
    const isRecordingStorage = await chrome.storage.local.get(['isRecording']);
    const startTimeStorage = await chrome.storage.local.get(['startTime']);
    let startTime;
    if (startTimeStorage) {
        startTime = new Date(startTimeStorage.startTime);
    }
    if (!isRecordingStorage.isRecording) {
        return;
    }

    const addToLogStorage = async (action) => {
        const localLog = await chrome.storage.local.get(['log']);
        const log = JSON.parse(localLog.log);
        log.push(action)
        chrome.storage.local.set({['log']: JSON.stringify(log)});
    };

    const generateQuerySelector = function (el) {
        if (el.tagName.toLowerCase() == "html")
            return "HTML";
        let str = el.tagName;
        str += (el.id != "") ? "#" + el.id : "";
        if (el.className) {
            var classes = el.className.split(/\s/).filter(className => !className.startsWith('ng-'));
            for (var i = 0; i < classes.length; i++) {
                str += "." + classes[i];
            }
        }

        return el.parentNode ? generateQuerySelector(el.parentNode) + " > " + str : str;
    }

    const action = {
        type: 'keydown',
        element: generateQuerySelector(event.target),
        timeShift: getDifference(startTime),
        value: {
            code: event.code,
            key: event.key
        },
    };
    addToLogStorage(action);
    chrome.storage.local.set({['startTime']: Date.now()});
});

