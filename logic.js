// Developed by Parthkumar Rathod (Wardragon3399)
document.addEventListener('DOMContentLoaded', () => {
    const notepad = document.getElementById('notepad');
    const micBtn = document.getElementById('micBtn');
    const stopMicBtn = document.getElementById('stopMicBtn');
    const fileInput = document.getElementById('fileInput');
    const statusLight = document.getElementById('statusLight');
    const srcDropdown = document.getElementById('srcLang');
    const targetDropdown = document.getElementById('targetLang');

    let silenceTimer;
    const SILENCE_LIMIT = 3000; 

    // --- 1. Smart Dual-Sync Initialization ---
    function autoSetDropdowns() {
        const systemLang = navigator.language; // e.g., 'gu-IN' or 'en-US'
        const systemBase = systemLang.split('-')[0]; // e.g., 'gu' or 'en'

        // Set Source (Speech-to-Text)
        srcDropdown.value = systemLang;
        if (srcDropdown.selectedIndex === -1) {
            // Fallback: search for base language match
            for (let i = 0; i < srcDropdown.options.length; i++) {
                if (srcDropdown.options[i].value.startsWith(systemBase)) {
                    srcDropdown.selectedIndex = i;
                    break;
                }
            }
        }
        // If still no match, default to English (India)
        if (srcDropdown.selectedIndex <= 0) srcDropdown.value = "en-IN";

        // Set Target (Translation)
        targetDropdown.value = systemBase;
        // If no match found for target, default to English (en) to avoid Arabic
        if (targetDropdown.selectedIndex === -1) {
            targetDropdown.value = "en";
        }

        // Visual feedback to confirm auto-selection
        [srcDropdown, targetDropdown].forEach(el => {
            el.classList.add('detected-flash');
            setTimeout(() => el.classList.remove('detected-flash'), 1500);
        });
    }

    // Run sync with a tiny delay to ensure DOM stability
    setTimeout(autoSetDropdowns, 100);

    // --- 2. Voice Recognition Setup ---
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isUserStopping = true;

    if (Recognition) {
        recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            clearTimeout(silenceTimer);
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            const existingInterim = document.getElementById('interim-span');
            if (existingInterim) existingInterim.remove();

            if (finalTranscript) notepad.innerText += " " + finalTranscript;

            if (interimTranscript) {
                const span = document.createElement('span');
                span.id = 'interim-span';
                span.innerText = " " + interimTranscript;
                notepad.appendChild(span);
            }

            silenceTimer = setTimeout(() => {
                if (!isUserStopping) notepad.innerText += "\n\n";
            }, SILENCE_LIMIT);
        };

        recognition.onstart = () => {
            statusLight.style.background = "#4caf50";
            statusLight.style.boxShadow = "0 0 10px #4caf50";
        };

        recognition.onerror = () => { statusLight.style.background = "#d13438"; };

        recognition.onend = () => {
            if (!isUserStopping) {
                try { recognition.start(); } catch (e) {}
            } else {
                statusLight.style.background = "gray";
                statusLight.style.boxShadow = "none";
            }
        };
    }

    function startVoice() {
        if (!recognition) return alert("Speech Recognition not supported.");
        isUserStopping = false;
        notepad.classList.add('recording-active');
        micBtn.style.display = "none";
        stopMicBtn.style.display = "inline-block";
        recognition.lang = srcDropdown.value === 'auto' ? 'en-US' : srcDropdown.value;
        recognition.start();
    }

    function stopVoice() {
        isUserStopping = true;
        clearTimeout(silenceTimer);
        recognition.stop();
        micBtn.style.display = "inline-block";
        stopMicBtn.style.display = "none";
        notepad.classList.remove('recording-active');
    }

    // --- 3. Translation & Audio Functions ---
    async function translateText() {
        const text = notepad.innerText.trim();
        if(!text) return;
        const target = targetDropdown.value;

        // Apply RTL for Arabic/Hebrew
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
        } catch (e) { console.error("Translation Error"); }
    }

    function playAudio() {
        window.speechSynthesis.cancel();
        const text = notepad.innerText.trim();
        if (!text) return;
        const utter = new SpeechSynthesisUtterance(text);
        const targetCode = targetDropdown.value;
        utter.lang = targetCode;

        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.lang.startsWith(targetCode));
        if (bestVoice) utter.voice = bestVoice;

        window.speechSynthesis.speak(utter);
    }

    // --- 4. Event Listeners ---
    micBtn.addEventListener('click', startVoice);
    stopMicBtn.addEventListener('click', stopVoice);
    document.getElementById('saveBtn').addEventListener('click', () => {
        const blob = new Blob([notepad.innerText], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Note_${Date.now()}.txt`;
        a.click();
    });
    document.getElementById('openBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = (event) => { notepad.innerText = event.target.result; };
        reader.readAsText(e.target.files[0]);
    });
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
});
