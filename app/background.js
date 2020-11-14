chrome.browserAction.onClicked.addListener(function (tab) {
  if (tab) chrome.tabs.sendMessage(tab.id, {}, function (response) {});
});

var endPoint;
var authenticationKey;
chrome.storage.sync.get(function (items) {
  endPoint = items.endPoint;
  authenticationKey = items.authenticationKey;
});

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  if (!endPoint || !authenticationKey) {
    callback(
      "error : set 'End Point' and 'Authentication Key' in extension option page."
    );
    return true;
  }

  fetch(endPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
    .then((xhr) => {
      console.log(xhr);
      if (xhr.status === 200 || xhr.status === 208) {
        callback(xhr.status);
      } else {
        callback("error (" + xhr.status + "): " + xhr.statusText);
        return;
      }
      response.json();
    })
    .then((data, e) => {
      callback(200);
    })
    .catch((error) => {
      callback(error);
      console.log(error);
    });

  return true;
});
