/**
 * Developed by: Wardragon3399
 * lens_bridge.js - The "Silent" Auto-Paste Logic
 */
(function() {
    const notepad = document.getElementById('notepad');

    async function handleAutoPaste() {
        try {
            // Read the clipboard content
            const text = await navigator.clipboard.readText();

            if (text && text.trim().length > 0) {
                // Check if this text is different from the last thing we pasted
                const lastPaste = localStorage.getItem('last_lens_data');

                if (text !== lastPaste) {
                    notepad.focus();
                    // Insert text at the current cursor position
                    document.execCommand('insertText', false, "\n" + text + "\n");
                    
                    // Save to prevent duplicate pasting
                    localStorage.setItem('last_lens_data', text);
                    console.log("Lens text automatically captured!");
                }
            }
        } catch (err) {
            // Clipboard access might be blocked until user interacts
            console.log("Clipboard standby...");
        }
    }

    // Trigger whenever the user clicks the notepad or switches back to the tab
    window.addEventListener('focus', handleAutoPaste);
    document.addEventListener('click', handleAutoPaste);

    // Button logic to open Google Lens upload page
    document.getElementById('openLensBtn').addEventListener('click', () => {
    // Attempt to trigger the native Google Assistant/Lens intent
    const intentUrl = "intent://google.com/searchbyimage#Intent;scheme=https;package=com.google.android.googlequicksearchbox;end";
    
    // Fallback to web if the intent fails
    window.location.href = intentUrl;
    setTimeout(() => {
        window.open('https://www.google.com/searchbyimage', '_blank');
    }, 500);
});
})();
