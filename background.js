//Developed by Parthkumar Rathod (Wardragon3399)

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html")
  });
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openLensTab") {
        chrome.tabs.create({ url: "https://lens.google.com/upload?ep=subbar" });
    }
});
