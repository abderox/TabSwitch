let tabData = [];

function captureTabScreenshot(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab({ format: "jpeg", quality: 30 }, (dataUrl) => {
            console.log(dataUrl)
                resolve({ tabId, dataUrl })
        });
    });
}

async function updateTabData(tabId) {
    const screenshot = await captureTabScreenshot(tabId);
    const tab = tabData.find((item) => item.id === tabId);
    if (tab) {
        tab.screenshot = screenshot.dataUrl;
    } else {
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            tabData.push({ id: tabId, url: tabs.find(tab => tab.id === tabId)?.url, screenshot });
        });
    }
}

function removeTabData(tabId) {
    tabData = tabData.filter((tab) => tab.id !== tabId);
  }

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await updateTabData(activeInfo.tabId);
});

chrome.tabs.onCreated.addListener(async (tab) => {
    await updateTabData(tab.id);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
   
    if (changeInfo.status === "complete" && tab.active) {
        updateTabData(tabId);
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    
    removeTabData(tabId);
  });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "getTabs") {

        let currentTabId = 0;
        // get current tabId
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            const currentTab = tabs.find(tab => tab.active);
            currentTabId = currentTab.id;
            console.log({tabData,currentTabId})
            sendResponse({tabData : tabData ,currentTabId : currentTabId});
        })
        return true;
      
    } else if (message.action === "switchTab") {
        chrome.tabs.update(message.tabId, { active: true });
    } else if (message.action === "switchToNextTab") {
        switchToNextTab();
    }
});


function switchToNextTab() {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
        const currentTab = tabs.find((tab) => tab.active);
        const nextTab = tabs[(currentTab.index + 1) % tabs.length];
        chrome.tabs.update(nextTab.id, { active: true });
    });
}