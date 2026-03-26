/**
 * Developed by: Wardragon3399
 * lens_bridge.js - Optimized for Mobile & Extension Tabs
 */
(function() {
    const notepad = document.getElementById('notepad');

    async function handleAutoPaste() {
        try {
            // Check if document is focused to avoid background errors
            if (!document.hasFocus()) return;

            const text = await navigator.clipboard.readText();

            if (text && text.trim().length > 0) {
                const lastPaste = localStorage.getItem('last_lens_data');

                if (text !== lastPaste) {
                    notepad.focus();
                    // Using execCommand is fine for contenteditable
                    document.execCommand('insertText', false, "\n" + text + "\n");
                    
                    localStorage.setItem('last_lens_data', text);
                    console.log("Lens text captured!");
                }
            }
        } catch (err) {
            // Silent catch: Browser blocks clipboard until user clicks the page
            console.log("Clipboard waiting for user interaction...");
        }
    }

    // Listener for returning to the tab
    window.addEventListener('focus', handleAutoPaste);
    // Listener for manual tap (essential for mobile privacy)
    document.addEventListener('pointerdown', handleAutoPaste);

    // FIX: Opening Lens in a true new tab
    document.getElementById('openLensBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const lensUrl = 'https://lens.google.com/upload?ep=subbar';

        if (typeof chrome !== "undefined" && chrome.tabs) {
            // Extension Method: Forces a real browser tab
            chrome.tabs.create({ url: lensUrl });
        } else {
            // Web/PWA Method: Opens new window
            const newWindow = window.open(lensUrl, '_blank');
            if (newWindow) newWindow.focus();
        }
    });
})();
