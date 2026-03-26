/**
 * logic.js 
 * Developed by: Wardragon3399
 * Core logic tools moslty from mainmenu buttons. 
 */
document.addEventListener('DOMContentLoaded', () => {
    const notepad = document.getElementById('notepad');
    const micBtn = document.getElementById('micBtn');
    const stopMicBtn = document.getElementById('stopMicBtn');
    const fileInput = document.getElementById('fileInput');
    const statusLight = document.getElementById('statusLight');
    const srcDropdown = document.getElementById('srcLang');
    const targetDropdown = document.getElementById('targetLang');
	const srcLang = document.getElementById('srcLang');
	const saveMenuBtn = document.getElementById('saveMenuBtn');
	const saveDropdown = document.getElementById('saveDropdown');

    let silenceTimer;
    const SILENCE_LIMIT = 3000; 

    // --- 1. Smart Dual-Sync Initialization ---
    function autoSetDropdowns() {
        const systemLang = navigator.language;
        const systemBase = systemLang.split('-')[0];

        srcDropdown.value = systemLang;
        if (srcDropdown.selectedIndex === -1) {
            for (let i = 0; i < srcDropdown.options.length; i++) {
                if (srcDropdown.options[i].value.startsWith(systemBase)) {
                    srcDropdown.selectedIndex = i;
                    break;
                }
            }
        }
        if (srcDropdown.selectedIndex <= 0) srcDropdown.value = "en-IN";

        targetDropdown.value = systemBase;
        if (targetDropdown.selectedIndex === -1) {
            targetDropdown.value = "en";
        }

        [srcDropdown, targetDropdown].forEach(el => {
            el.classList.add('detected-flash');
            setTimeout(() => el.classList.remove('detected-flash'), 1500);
        });
    }

    setTimeout(autoSetDropdowns, 100);

    // --- 2. Voice Recognition Setup ---
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	let recognition;
	let isUserStopping = true;

	if (Recognition) {
		recognition = new Recognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = () => {
			micBtn.style.display = 'none';
			stopMicBtn.style.display = 'inline-block';
			statusLight.style.background = '#ffc107'; // Yellow: Listening
			console.log("Voice Active");
		};

		recognition.onspeechstart = () => {
			statusLight.style.background = '#4caf50'; // Green: Speaking
			statusLight.style.boxShadow = "0 0 10px #4caf50";
		};

		recognition.onspeechend = () => {
			statusLight.style.background = '#ffc107'; // Back to Yellow
			statusLight.style.boxShadow = "none";
		};

		recognition.onresult = (event) => {
			clearTimeout(silenceTimer);
			let finalTranscript = "";
			let interimTranscript = "";

			// 1. Loop through results
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				const transcript = event.result[0].transcript;
				if (result.isFinal) {
					finalTranscript += transcript;
				} else {
					interimTranscript += transcript;
				}
			}

			// 2. Handle the temporary "Interim" text (gray/italic preview)
			const existingInterim = document.getElementById('interim-span');
			if (existingInterim) existingInterim.remove();

			// 3. Insert the Finalized text
			if (finalTranscript !== '') {
				let processedText = finalTranscript.trim();
				const currentLang = document.getElementById('srcLang').value;

				// Apply CapsLock only if it's ON and language is English
				if (isCapsLockOn && currentLang.startsWith('en')) {
					processedText = finalTranscript.toUpperCase();
				}
				
				// Use ONLY this to insert text at the cursor (prevents double writing)
				document.execCommand('insertText', false, " " + processedText);
				
				// Auto-scroll to bottom
				notepad.scrollTop = notepad.scrollHeight;
				if (typeof updateCounts === "function") updateCounts();
			}
				
			if (interimTranscript) {
				const span = document.createElement('span');
				span.id = 'interim-span';
				span.style.color = '#888';
				span.style.fontStyle = 'italic';
				span.innerText = " " + interimTranscript;
				notepad.appendChild(span);
			}

			silenceTimer = setTimeout(() => {
				// 1. Create the new line
				document.execCommand('insertParagraph', false);
				
				// 2. IMMEDIATELY call our new timestamp function
				if (typeof window.insertProTimestamp === "function") {
					window.insertProTimestamp();
				}
			}, SILENCE_LIMIT);
		};
	 
		recognition.onerror = (event) => {
			console.error("Mic Error:", event.error);
			statusLight.style.background = "#d13438"; 
		};

		recognition.onend = () => {
			if (!isUserStopping) {
				try { recognition.start(); } catch (e) {}
			} else {
				micBtn.style.display = "inline-block";
				stopMicBtn.style.display = "none";
				statusLight.style.background = "gray";
				statusLight.style.boxShadow = "none";
				notepad.classList.remove('recording-active');
			}
		};
	}

	// Global functions for the Button OnClicks
	function startVoice() {
		if (!recognition) return alert("Speech Recognition not supported on this browser.");
		const useOnline = confirm("Use Online Google Services for better accuracy?\n\nOK = Online (Google)\nCancel = Local (Device Only)");
		if (useOnline) {
			alert("System: Using Online Google Cloud Services.");
		} else {
			// Note: Browsers don't give a direct "isInstalled" for Speech yet, 
			// but we can warn them to check settings.
			alert("System: Attempting Local Device Recognition. If it fails, please download the Language Pack in your Device Settings.");
		}
		
		if (typeof focusAtEnd === "function") focusAtEnd(notepad);

		if (notepad.innerText.trim().length > 0) {
			document.execCommand('insertParagraph', false);
		}

		if (typeof window.insertProTimestamp === "function") {
			window.insertProTimestamp();
		}

		isUserStopping = false;
		notepad.classList.add('recording-active');
		
		recognition.lang = srcDropdown.value === 'auto' ? 'en-US' : srcDropdown.value;
		
		try {
			recognition.start();
		} catch (e) {
			console.log("Recognition already running");
		}
	}

	function stopVoice() {
		isUserStopping = true;
		clearTimeout(silenceTimer);
		recognition.stop();
	}

    // --- 3. Translation & Audio Functions ---
	
	// --- HYBRID LANGUAGE ENGINE ---

	// Helper to check if a Local Voice is installed
	function isLanguageInstalledLocally(langCode) {
		const voices = window.speechSynthesis.getVoices();
		// Check if any installed voice matches the language (e.g., "gu-IN")
		return voices.some(v => v.lang.startsWith(langCode.split('-')[0]) && !v.localService === false);
	}
	
    async function translateText() {
        const text = notepad.innerText.trim();
        if(!text) return;
        const target = targetDropdown.value;

        if (target === 'ar' || target === 'he') {
            notepad.style.textAlign = 'right';
            notepad.dir = 'rtl';
        } else {
            notepad.style.textAlign = 'left';
            notepad.dir = 'ltr';
        }

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURI(text)}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            notepad.innerText = data[0].map(item => item[0]).join("");
			if (typeof updateCounts === "function") {
				updateCounts(); 
			}
        } catch (e) { console.error("Translation Error"); }
    }

    function playAudio() {
        window.speechSynthesis.cancel();
        const text = notepad.innerText.trim();
        if (!text) return;
		const targetCode = targetDropdown.value;
		const isInstalled = isLanguageInstalledLocally(targetCode);

		if (!isInstalled) {
			const choice = confirm(`Language Pack for [${targetCode}] is MISSING on this device.\n\nWould you like to use the Online Google Voice instead?`);
			if (!choice) {
				return alert("Action Cancelled. Please download the Language Pack in your Device/Windows Settings to use offline.");
			}
			alert("System: Using Online Google Voice.");
		} 
		else {
			alert("System: Using Local Device Voice.");
		}
		
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = targetCode;

        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.lang.startsWith(targetCode));
        if (bestVoice) utter.voice = bestVoice;

        window.speechSynthesis.speak(utter);
    }

    // --- 4. Event Listeners ---
    micBtn.addEventListener('click', startVoice);
    stopMicBtn.addEventListener('click', stopVoice);
	
	// --- 1. TOGGLE SAVE MENU ---
	saveMenuBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		
		// 1. Get the exact position of the button on the screen
		const rect = saveMenuBtn.getBoundingClientRect();
		
		// 2. Position the menu exactly under the button
		saveDropdown.style.top = (rect.bottom + 5) + 'px';
		saveDropdown.style.left = rect.left + 'px';
		
		// 3. Toggle visibility
		const isHidden = saveDropdown.style.display === 'none' || saveDropdown.style.display === '';
		saveDropdown.style.display = isHidden ? 'block' : 'none';
	});

    // Close menu if user clicks anywhere else
    window.addEventListener('click', () => {
		saveDropdown.style.display = 'none';
	});

    // --- 2. SAVE AS TEXT (.TXT) ---
    document.getElementById('saveTxtBtn').addEventListener('click', async () => {
		const text = notepad.innerText.trim();
		if (!text) return alert("Nothing to save!");

		const fileName = `My note.txt`;

		// 1. TRY THE MODERN WAY (Desktop Only)
		if ('showSaveFilePicker' in window && !/Android|iPhone|iPad/i.test(navigator.userAgent)) {
			try {
				const handle = await window.showSaveFilePicker({
					suggestedName: fileName,
					types: [{ description: 'Text', accept: {'text/plain': ['.txt']} }]
				});
				const writable = await handle.createWritable();
				await writable.write(text);
				await writable.close();
				return; // Success on Desktop
			} catch (err) { 
				console.log("Save Picker cancelled or failed"); 
			}
		}

		// 2. THE UNIVERSAL WAY (Mobile & Fallback)
		// This creates a virtual file and "clicks" it for the user
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		
		a.href = url;
		a.download = fileName;
		
		document.body.appendChild(a);
		a.click(); // This triggers the download bar on Chrome/Brave Mobile
		document.body.removeChild(a);
		
		URL.revokeObjectURL(url);
		console.log("Mobile Download Triggered");
	});

    // --- 3. SAVE AS PDF (PRINT) ---
    document.getElementById('savePdfBtn').addEventListener('click', () => {
        if (!notepad.innerText.trim()) return alert("Nothing to print!");
        window.print();
    });

	// --- KEYBOARD SHORTCUT: CTRL/CMD + S ---
    document.addEventListener('keydown', (e) => {
        // Check for S key + Control (Windows) or Meta (Mac)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            
            // Only trigger if the user is currently typing in the notepad
            if (document.activeElement === notepad) {
                e.preventDefault(); // Stop the browser's default save window
                
                // Trigger the click on our existing Text Save button
                document.getElementById('saveTxtBtn').click();
            }
        }
    });

	//Open file logic
    document.getElementById('openBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (event) => { notepad.innerText = event.target.result; };
        reader.readAsText(e.target.files[0]);
    });

	//share logic
    document.getElementById('shareBtn').addEventListener('click', () => {
        const text = notepad.innerText.trim();
        if (navigator.share) navigator.share({ title: 'My Note', text: text });
        else window.open(`https://mail.google.com/mail/?view=cm&fs=1&body=${encodeURIComponent(text)}`);
    });

    document.getElementById('creditsBtn').addEventListener('click', () => document.getElementById('creditsModal').style.display = 'flex');
    document.getElementById('closeCredits').addEventListener('click', () => document.getElementById('creditsModal').style.display = 'none');
    document.getElementById('convertBtn').addEventListener('click', translateText);
    document.getElementById('speakBtn').addEventListener('click', playAudio);
    document.getElementById('stopBtn').addEventListener('click', () => window.speechSynthesis.cancel());
    document.getElementById('themeBtn').addEventListener('click', () => document.body.classList.toggle('light-mode'));
	
	//// Function to force cursor to the end of the text
	function focusAtEnd(element) {
		element.focus();
		const range = document.createRange();
		const selection = window.getSelection();
		
		// Select all content and collapse the range to the very end
		range.selectNodeContents(element);
		range.collapse(false); 
		
		selection.removeAllRanges();
		selection.addRange(range);
		
		// Ensure the view scrolls to the cursor
		element.scrollTop = element.scrollHeight;
	}
	
	// --- HELP MODAL LOGIC ---
    const helpModal = document.getElementById('helpModal');
    let lastCursorRange = null;

    document.getElementById('helpBtn').addEventListener('click', () => {
        // Save cursor position before opening help
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            lastCursorRange = sel.getRangeAt(0);
        }
        
        helpModal.style.display = 'flex';
    });

    document.getElementById('closeHelp').addEventListener('click', () => {
        helpModal.style.display = 'none';
        
        // Restore cursor position so user can continue typing immediately
        notepad.focus();
        if (lastCursorRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(lastCursorRange);
        } else {
            focusAtEnd(notepad); // Fallback to end if notepad was empty
        }
    });

    // Close if clicking outside the content box
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            document.getElementById('closeHelp').click();
        }
    });
	
	//checking is capslock is on or not
	let isCapsLockOn = false;

	// Track CapsLock state globally
	document.addEventListener('keydown', (e) => {
		if (e.getModifierState) {
			isCapsLockOn = e.getModifierState('CapsLock');
		}
	});
	
	// for Capslock logic
	document.addEventListener('keyup', (e) => {
    isCapsLockOn = e.getModifierState('CapsLock');
    document.getElementById('capsWarning').style.display = isCapsLockOn ? 'inline' : 'none';
	});
	
	//for spelling and word checker
	function updateSpellcheckLanguage() {
        const fullLang = srcLang.value; // e.g., "gu-IN"
        
        if (fullLang === 'auto') {
            notepad.setAttribute('lang', 'en'); // Default to English if Auto
        } else {
            // Extracts the primary language code (e.g., "gu" from "gu-IN")
            const primaryLang = fullLang.split('-')[0]; 
            notepad.setAttribute('lang', primaryLang);
        }

        // Force the browser to re-evaluate the text
        notepad.spellcheck = false;
        setTimeout(() => {
            notepad.spellcheck = true;
        }, 10);
    }

    // Run when the language dropdown changes
    srcLang.addEventListener('change', updateSpellcheckLanguage);

    // Initial run
    updateSpellcheckLanguage();

	// word couts 
	function updateCounts() {
		const text = notepad.innerText.trim();
		const words = text ? text.split(/\s+/).length : 0;
		const chars = text.length;

		document.getElementById('wordCount').innerText = `Words: ${words}`;
		document.getElementById('charCount').innerText = `Characters: ${chars}`;
	}

	// Update counts whenever the user types
	notepad.addEventListener('input', updateCounts);

});
