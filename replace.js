/**
 * replace.js 
 * Developed by: Wardragon3399
 */
(function() {
    console.log("Wardragon Replace Engine: Standing By");

    window.addEventListener('load', () => {
        const notepad = document.getElementById('notepad');
        const findInput = document.getElementById('findInput');
        const replaceInput = document.getElementById('replaceInput');
        const replaceBtn = document.getElementById('replaceBtn');
        const replaceAllBtn = document.getElementById('replaceAllBtn');
        const findNextBtn = document.getElementById('findNextBtn');
        const extraToolbar = document.getElementById('extraToolbar');
        const findStatus = document.getElementById('findStatus');

        // --- 1. REPLACE SINGLE BUTTON ---
        if (replaceBtn) {
            replaceBtn.onclick = (e) => {
                e.preventDefault();
                const activeHighlight = notepad.querySelector('.found-term');
                const newValue = replaceInput.value;

                if (activeHighlight) {
                    activeHighlight.innerText = newValue;
                    activeHighlight.style.backgroundColor = "#4CAF50"; 
                    
                    setTimeout(() => {
                        const parent = activeHighlight.parentNode;
                        const textNode = document.createTextNode(activeHighlight.innerText);
                        parent.replaceChild(textNode, activeHighlight);
                        parent.normalize();

                        if (findNextBtn) findNextBtn.click();
                    }, 100); 
                } else {
                    if (findNextBtn) findNextBtn.click();
                }
            };
        }

        // --- 2. REPLACE ALL BUTTON (The Fix) ---
        if (replaceAllBtn) {
            replaceAllBtn.onclick = (e) => {
                e.preventDefault();
                const query = findInput.value.trim();
                const replacement = replaceInput.value;

                if (!query) {
                    alert("Please enter a word in the Find box first.");
                    return;
                }

                // Get content and replace using Global Regex
                // We use innerHTML to preserve line breaks/tags
                const currentHTML = notepad.innerHTML;
                const regex = new RegExp(query, 'gi');
                
                // Check if any matches exist before replacing
                if (regex.test(currentHTML)) {
                    notepad.innerHTML = currentHTML.replace(regex, replacement);
                    if (findStatus) findStatus.innerText = "All replaced!";
                } else {
                    if (findStatus) findStatus.innerText = "No matches found.";
                }
            };
        }

        // --- 3. ENTER KEY IN REPLACE BOX ---
        if (replaceInput) {
            replaceInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (replaceBtn) replaceBtn.click();
                }
            });
        }

        // --- 4. KEYBOARD SHORTCUT (CTRL + SHIFT + R) ---
        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
            const shiftPressed = e.shiftKey;

            const isFocusedInApp = 
                document.activeElement === notepad || 
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.closest('.toolbar');

            if (ctrlOrCmd && shiftPressed && e.key.toLowerCase() === 'r') {
                if (isFocusedInApp) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (extraToolbar && extraToolbar.style.display === 'none') {
                        const toggleBtn = document.getElementById('toggleExtraBtn');
                        if (toggleBtn) toggleBtn.click();
                    }

                    setTimeout(() => {
                        if (replaceInput) {
                            replaceInput.focus();
                            replaceInput.select();
                        }
                    }, 50);
                }
            }
        });
    });
})();
