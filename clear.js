/**
 * clear.js - Unique ID Version
 */
(function() {
    const initSanitizer = () => {
        const notepad = document.getElementById('notepad');
        const sanitizeBtn = document.getElementById('sanitizeNotepadBtn');

        if (!notepad || !sanitizeBtn) return;

        sanitizeBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (confirm("This will remove all colors and bolding from the notepad. Proceed?")) {
                // Get plain text only
                const rawText = notepad.innerText;

                // Rebuild clean HTML structure
                const lines = rawText.split(/\r?\n/);
                notepad.innerHTML = lines
                    .map(line => `<div>${line.trim() === "" ? "<br>" : line}</div>`)
                    .join("");

                console.log("Notepad formatting sanitized.");
                
                // Button feedback
                const originalText = sanitizeBtn.innerText;
                sanitizeBtn.innerText = "✅ Cleaned!";
                setTimeout(() => { sanitizeBtn.innerText = originalText; }, 2000);
            }
        });
    };

    // Safe loading
    if (document.readyState === 'complete') {
        initSanitizer();
    } else {
        window.addEventListener('load', initSanitizer);
    }
})();