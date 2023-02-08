chrome.action.onClicked.addListener(tab => {
    chrome.tabs.sendMessage(
        tab.id,
        {type: "tasksblackboard"},
        callback_values => {
            chrome.storage.local.set({
                tasks: callback_values.tasks,
                list: callback_values.list
            }).then(() => {
                chrome.tabs.create({
                    url: chrome.runtime.getURL('index.html')
                });
            })
        }
    );
})
