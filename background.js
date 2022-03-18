chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    switch (message.type) {
        case 'getLocalStorage':
            const logStorage = await chrome.storage.local.get(['log']);
            const log = JSON.parse(logStorage.log);
            sendResponse(log);
            break;
        case 'sendKey':
            // console.log('Received key', message.action, sender);
            // console.log('>>>>>>>>>>>>>>>>>')
            // console.log('>>>>>>>>>>>>>>>>>')
            // console.log('>>>>>>>>>>>>>>>>>')
            // console.log('>>>>>>>>>>>>>>>>>')
            // console.log(message.action)
            // console.log('>>>>>>>>>>>>>>>>>')
            // console.log('>>>>>>>>>>>>>>>>>')
            switch (message.action.type) {
                case 'click':
                    chrome.debugger.attach({ tabId: sender.tab.id }, "1.2");
                    const mouseEventPressArgs = {
                        type:"mousePressed",
                        button: "left",
                        x: message.action.value.x,
                        y: message.action.value.y,
                        clickCount: 1,
                    };

                    const mouseEventReleaseArgs = {
                        type:"mouseReleased",
                        button: "left",
                        x: message.action.value.x,
                        y: message.action.value.y,
                        clickCount: 1,
                    };

                    chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", mouseEventPressArgs, (e) => { console.log('mousedown', e) });

                    chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchMouseEvent", mouseEventReleaseArgs, (e) => {
                        console.log('mouseup', e)
                        if (chrome.runtime.lastError) {
                            console.log('>>>>>>>> Error sending the shortcut to active tab:', chrome.runtime.lastError);
                        }
                        chrome.debugger.detach({ tabId: sender.tab.id });
                        sendResponse();
                    });

                    sendResponse();
                    break;
                case 'keydown':
                    chrome.debugger.attach({ tabId: sender.tab.id }, "1.2");
                    const eventArgs = {
                        'modifiers': 0,
                        'text': message.action.value.key,
                        'unmodifiedText': message.action.value.key,
                        'key': message.action.value.key,
                        'code': message.action.value.code,
                        'windowsVirtualKeyCode': message.action.value.key.charCodeAt(),
                        'type': 'keyDown'
                    };
                    chrome.debugger.sendCommand({ tabId: sender.tab.id }, 'Input.dispatchKeyEvent', eventArgs, (result) => {
                        if (chrome.runtime.lastError) {
                            console.log('>>>>>>>> Error sending the shortcut to active tab:', chrome.runtime.lastError);
                        }
                        chrome.debugger.detach({ tabId: sender.tab.id });
                        sendResponse();
                    });
                    break;
            }
            break;
    }
});
