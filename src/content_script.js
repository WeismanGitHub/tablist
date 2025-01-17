// web extensions polyfill for ff/chrome
window.browser = (function () {
    return window.browser || window.chrome;
})();

let tabListTabId = null;

function listTabs() {
    const list = document.getElementById('list');

    browser.tabs.query({}, function (tabs) {
        tabs = tabs.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))

        for (let i = 0; i < tabs.length; ++i) {
            if (
                tabs[i].url && !tabs[i].url.startsWith("chrome") &&
                !tabs[i].url.startsWith("moz") && !tabs[i].url.startsWith("about") &&
                !tabs[i].url.startsWith("data")
            ) {
                let anchor = document.createElement("a");
                anchor.innerText = tabs[i].title;
                anchor.href = tabs[i].url

                list.append(document.createElement("br"))
                list.appendChild(anchor)
                list.append(document.createElement("br"))
            }
        }

        if (tabListTabId) {
            browser.tabs.update(tabListTabId, {active:true, highlighted:true});
        }
    });
}

function activateTabs() {
    browser.tabs.query({}, async function(tabs) {
        for (let i=0; i<tabs.length; ++i) {
            await browser.tabs.update(tabs[i].id, {
                active: true
            });
        }

        listTabs()
    });
}

function init() {
    browser.tabs.getCurrent(function(tab) {
        tabListTabId = tab.id;

        browser.runtime.getPlatformInfo(function (platform) {
            if (platform.os === "android") {
                // workaround for ff on android
                // tab.url is only available for tabs that have been recently used. so we'll activate them all before we query them
                alert("Generating list of tabs. This may take a moment...");
                activateTabs()
            } else {
                listTabs()
            }
        });
    });
}

function copyToClipBoard() {
    const urls = []

    browser.tabs.query({}, function (tabs) {
        tabs = tabs.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))

        for (let i = 0; i < tabs.length; ++i) {
            if (
                tabs[i].url && !tabs[i].url.startsWith("chrome") && 
                !tabs[i].url.startsWith("moz") && !tabs[i].url.startsWith("about") && 
                !tabs[i].url.startsWith("data")
            ) {
                urls.push(tabs[i].url)
            }
        }

        navigator.clipboard.writeText(urls.join('\n'))
    })
}

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('copy-tabs');

    button.addEventListener('click', function() {
        copyToClipBoard();
    });
});

init();
