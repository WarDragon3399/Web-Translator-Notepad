/**
 * autosave.js - Independent Tab Engine
 */
(function() {
    const autoSaveBtn = document.getElementById('autoSaveToggle');
    const notepad = document.getElementById('notepad');
    let isAutoSaveOn = false;

    // We use sessionStorage so every tab is its own "World"
    const STORAGE_KEY = 'notepad_tab_session';
    const CONFIG_KEY = 'autosave_tab_enabled';

    const initAutoSave = () => {
        // 1. Check if THIS SPECIFIC TAB has autosave on
        if (sessionStorage.getItem(CONFIG_KEY) === 'true') {
            enableUI();
            
            const lastData = sessionStorage.getItem(STORAGE_KEY);
            if (lastData) {
                notepad.innerHTML = lastData;
                if (typeof updateCounts === "function") updateCounts();
                console.log("Tab Session Restored.");
            }
        }
    };

    const enableUI = () => {
        isAutoSaveOn = true;
        autoSaveBtn.style.background = "#4caf50";
        autoSaveBtn.innerText = "🔄 Auto-Save: ON";
    };

    const disableUI = () => {
        isAutoSaveOn = false;
        autoSaveBtn.style.background = "#444";
        autoSaveBtn.innerText = "🔄 Auto-Save: OFF";
        sessionStorage.removeItem(STORAGE_KEY); 
    };

    autoSaveBtn.addEventListener('click', () => {
        if (!isAutoSaveOn) {
            const consent = confirm(
                "⚠️ INDEPENDENT TAB AUTO-SAVE:\n\n" +
                "This will save data ONLY for this specific tab.\n" +
                "Data is cleared when you close this tab.\n\n" +
                "Proceed?"
            );

            if (consent) {
                sessionStorage.setItem(CONFIG_KEY, 'true');
                enableUI();
                sessionStorage.setItem(STORAGE_KEY, notepad.innerHTML);
            }
        } else {
            sessionStorage.setItem(CONFIG_KEY, 'false');
            disableUI();
        }
    });

    notepad.addEventListener('input', () => {
        if (isAutoSaveOn) {
            sessionStorage.setItem(STORAGE_KEY, notepad.innerHTML);
        }
    });

    initAutoSave();
})();