chrome.browserAction.onClicked.addListener(function (tab) {
    if (tab)
        chrome.tabs.sendMessage(tab.id, {}, function (response) { });
});

var endPoint;
var authenticationKey;
chrome.storage.sync.get(function (items) {
    endPoint = items.endPoint;
    authenticationKey = items.authenticationKey;
});

chrome.runtime.onMessage.addListener(function (request, sender, callback) {

    if (!endPoint || !authenticationKey) {
        callback("error : set 'End Point' and 'Authentication Key' in extension option page.");
        return true;
    }

    var xhr = new XMLHttpRequest();
    var formData = new FormData();

    for (var key in request) {
        formData.append(key, request[key]);
    }

    xhr.open("POST", endPoint, true);
    xhr.setRequestHeader("x-functions-key", authenticationKey);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 208) {
                callback(xhr.status);
            } else {
                callback("error (" + xhr.status + "): " + xhr.response);
                console.log(xhr);
            }
        }
    }
    xhr.onerror = function (e) {
        callback("error (" + e.status + "): " + e.response);
        console.log(e);
    };
    xhr.send(formData);
    return true;

});

