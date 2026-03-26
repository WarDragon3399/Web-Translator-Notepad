/**
 * Developed by: Wardragon3399
 * refresh_logic.js - Reset & Mobile Pull-to-Refresh
 */
(function() {
    const notepad = document.getElementById('notepad');
    const resetBtn = document.getElementById('resetNotepadBtn');
    
    // 1. MANUAL RESET LOGIC
    function performReset() {
        const isAutoSaveOn = sessionStorage.getItem('autosave_tab_enabled') === 'true';
        const hasContent = notepad.innerText.trim().length > 0;

        if (hasContent) {
            const message = isAutoSaveOn 
                ? "⚠️ AUTO-SAVE IS ON. Reloading will PERMANENTLY clear this note. Start a new blank note?"
                : "Clear everything and start a new note?";
            
            if (confirm(message)) {
                notepad.innerHTML = "";
                // Clear the session storage so it doesn't come back on next load
                sessionStorage.removeItem('notepad_tab_session');
                console.log("Notepad cleared and reset.");
            }
        } else {
            notepad.innerHTML = ""; // Already empty, just ensure it's clean
        }
    }

    resetBtn.addEventListener('click', performReset);

    // 2. MOBILE PULL-TO-REFRESH (Drag Down)
    let startY = 0;
    const PULL_THRESHOLD = 150; // How many pixels to drag down

    window.addEventListener('touchstart', (e) => {
        // Only trigger if we are at the very top of the page
        if (window.scrollY === 0) {
            startY = e.touches[0].pageY;
        }
    }, {passive: true});

    window.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].pageY;
        const diff = currentY - startY;

        // If dragging down and at the top
        if (diff > 0 && window.scrollY === 0) {
            // Optional: You could add a visual 'arrow' or 'spinner' icon here
            if (diff > PULL_THRESHOLD) {
                // We don't call performReset directly here to avoid 
                // triggering it 100 times while moving
            }
        }
    }, {passive: true});

    window.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].pageY;
        const diff = endY - startY;

        if (diff > PULL_THRESHOLD && window.scrollY === 0) {
            performReset();
        }
        startY = 0;
    });

})();