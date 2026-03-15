/**
 * Developed by: Wardragon3399
 * advanced_logic.js 
 * Professional Find, Replace, and Formatting Reset
 */

(function() {
    console.log("Wardragon Advanced Logic: Button Sync Active");

    window.addEventListener('load', () => {
        const notepad = document.getElementById('notepad');
        const findInput = document.getElementById('findInput');
        const findStatus = document.getElementById('findStatus');
        const findNextBtn = document.getElementById('findNextBtn');
        const clearBtn = document.getElementById('clearFormatBtn');
        
        let currentMatchIndex = 0;

        // 1. CLEAR HIGHLIGHTS
        function clearPermanentHighlights() {
            const highlights = notepad.querySelectorAll('.found-term');
            highlights.forEach(h => {
                const parent = h.parentNode;
                parent.replaceChild(document.createTextNode(h.innerText), h);
                parent.normalize();
            });
        }

        // 2. MAIN FIND ENGINE
        function executeFind() {
            const query = findInput.value.trim();
            if (!query) return;

            clearPermanentHighlights();

            const walker = document.createTreeWalker(notepad, NodeFilter.SHOW_TEXT, null, false);
            let nodes = [];
            let node;
            while (node = walker.nextNode()) nodes.push(node);

            let allMatches = [];
            nodes.forEach(n => {
                let startIndex = 0;
                const text = n.nodeValue;
                while ((startIndex = text.toLowerCase().indexOf(query.toLowerCase(), startIndex)) > -1) {
                    allMatches.push({ node: n, start: startIndex });
                    startIndex += query.length;
                }
            });

            if (allMatches.length === 0) {
                findStatus.innerText = "0/0";
                return;
            }

            if (currentMatchIndex >= allMatches.length) currentMatchIndex = 0;
            const match = allMatches[currentMatchIndex];

            try {
                const range = document.createRange();
                range.setStart(match.node, match.start);
                range.setEnd(match.node, match.start + query.length);
                
                const span = document.createElement('span');
                span.className = 'found-term';
                range.surroundContents(span);

                span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                findStatus.innerText = `${currentMatchIndex + 1}/${allMatches.length}`;
                currentMatchIndex++;
            } catch (err) {
                // If surroundContents fails (complex HTML), fall back to native find
                console.warn("Complex HTML detected, falling back to selection.");
                notepad.focus();
                window.find(query, false, false, true);
                currentMatchIndex++;
            }
        }

		// 3. FIND ALL ENGINE (Highlights everything at once)
        function executeFindAll() {
            const query = findInput.value.trim();
            if (!query) return;

            // Clear old highlights first
            clearPermanentHighlights();

            const walker = document.createTreeWalker(notepad, NodeFilter.SHOW_TEXT, null, false);
            let nodes = [];
            let node;
            while (node = walker.nextNode()) nodes.push(node);

            let matchCount = 0;

            // We iterate backwards through nodes to avoid "offset" issues 
            // when adding <span> tags to the same node
            nodes.forEach(n => {
                const text = n.nodeValue;
                const regex = new RegExp(query, 'gi');
                let match;
                
                // We have to collect matches and apply from end to start 
                // so the character positions don't shift
                let nodeMatches = [];
                while ((match = regex.exec(text)) !== null) {
                    nodeMatches.push(match);
                }

                for (let i = nodeMatches.length - 1; i >= 0; i--) {
                    const m = nodeMatches[i];
                    const range = document.createRange();
                    range.setStart(n, m.index);
                    range.setEnd(n, m.index + query.length);

                    const span = document.createElement('span');
                    span.className = 'found-term';
                    try {
                        range.surroundContents(span);
                        matchCount++;
                    } catch (e) {
                        console.warn("Skipping complex match");
                    }
                }
            });

            findStatus.innerText = `Total: ${matchCount}`;
        }

        

        // --- ATTACH EVENTS TO EVERYTHING ---

        // A. The Enter Key
        findInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeFind();
            }
        });

        // B. The Find Next Button (Fixed)
        if (findNextBtn) {
            findNextBtn.onclick = (e) => {
                e.preventDefault();
                executeFind();
            };
        }

        // C. The Reset/Clear Button
        if (clearBtn) {
            clearBtn.onclick = (e) => {
                e.preventDefault();
                clearPermanentHighlights();
                findInput.value = "";
                findStatus.innerText = "0/0";
                currentMatchIndex = 0;
                
                // Also reset editor focus
                notepad.focus();
                window.getSelection().collapseToEnd();
            };
        }

        // D. Status update as you type
        findInput.addEventListener('input', () => {
            currentMatchIndex = 0;
            const text = notepad.innerText.toLowerCase();
            const query = findInput.value.toLowerCase().trim();
            if(!query) { findStatus.innerText = "0/0"; return; }
            const count = (text.match(new RegExp(query, 'g')) || []).length;
            findStatus.innerText = `0/${count}`;
        });
		
		// --- ATTACH FIND ALL BUTTON ---
        const findAllBtn = document.getElementById('findAllBtn');
        if (findAllBtn) {
            findAllBtn.onclick = (e) => {
                e.preventDefault();
                executeFindAll();
            };
        }	
    });
	
		// --- GLOBAL KEYBOARD SHORTCUT: CTRL + F ---
	document.addEventListener('keydown', (e) => {
		// Check for Ctrl+F (or Cmd+F on Mac)
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

		if (ctrlOrCmd && e.key.toLowerCase() === 'f') {
			e.preventDefault(); // Stop the browser's default find bar

			// 1. Ensure the Extra Tools menu is visible
			const extraToolbar = document.getElementById('extraToolbar');
			const toggleBtn = document.getElementById('toggleExtraBtn');
			
			if (extraToolbar.style.display === 'none') {
				extraToolbar.style.display = 'flex';
				if (toggleBtn) {
					toggleBtn.innerHTML = '🛠️ Extra Tools ▴';
					toggleBtn.style.background = 'var(--accent)';
				}
			}

			// 2. Focus the Find Input and select any existing text
			findInput.focus();
			findInput.select(); 
			
			console.log("Shortcut: Find menu opened and focused.");
		}
	});
	
})();
