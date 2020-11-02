function save_options() {
    var endPoint = document.getElementById('endPoint').value;
    var key = document.getElementById('key').value;
    console.log(endPoint);
    chrome.storage.sync.set({
        endPoint: endPoint,
        authenticationKey: key
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get(function (items) {
        console.log(items);
        document.getElementById('endPoint').value = items.endPoint;
        document.getElementById('key').value = items.authenticationKey;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click',
    save_options);