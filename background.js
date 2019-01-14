function ban(info, tab) {
    var settings = {};
    settings["link"] = info.linkUrl;
    settings["page"] = info.pageUrl;
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {info: settings}, function (response) {
        });
    });
}




chrome.contextMenus.create({
    title: "Игнорировать",
    contexts: ["link"],
    onclick: ban,
    documentUrlPatterns: ["https://vk.com/im*"],
    targetUrlPatterns: ["https://vk.com/*"],
});


chrome.browserAction.onClicked.addListener(function () {
    chrome.storage.sync.get(['enabled'], function (result) {
        var enabled;
        if (result["enabled"] === undefined) {
            enabled = false;
        } else {
            enabled = result["enabled"];
        }
        enabled = !enabled;
        chrome.storage.sync.set({'enabled': enabled});
        if (enabled) {
            chrome.browserAction.setIcon({
                path: {
                    "48": "img/icon48g.png"
                }
            });
            chrome.browserAction.setTitle({"title": "VK Chat Ignore is ON"});
        } else {
            chrome.browserAction.setIcon({
                path: {
                    "48": "img/icon48.png"
                }
            });
            chrome.browserAction.setTitle({"title": "VK Chat Ignore is OFF"});
        }


    });
});


chrome.storage.sync.get(['enabled'], function (result) {
    var enabled;
    if (result["enabled"] === undefined) {
        enabled = false;
    } else {
        enabled = result["enabled"];
    }
    
    if (enabled) {
        chrome.browserAction.setIcon({
            path: {
                "48": "img/icon48g.png"
            }
        });
        chrome.browserAction.setTitle({"title": "VK Chat Ignore is ON"});
    } else {
        chrome.browserAction.setIcon({
            path: {
                "48": "img/icon48.png"
            }
        });
        chrome.browserAction.setTitle({"title": "VK Chat Ignore is OFF"});
    }


});