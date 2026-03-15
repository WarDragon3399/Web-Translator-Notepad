/**
 * timestamp.js - Pro Court Logic
 * Developed by: Wardragon3399
 */
(function() {
    let startTime = null;
    let timerInterval = null;

    // This makes the function available to your STT script
    window.insertProTimestamp = function() {
        const notepad = document.getElementById('notepad');
        const timeToggleBtn = document.getElementById('timestampToggle');

        // Only run if the Time Toggle is actually "ON"
        if (timeToggleBtn && timeToggleBtn.innerText.includes("ON") && startTime) {
            const sec = Math.floor((Date.now() - startTime) / 1000);
            const timePart = new Date(sec * 1000).toISOString().substr(11, 8);
            const html = `<b style="color: #ff9800; user-select: none;">[${timePart}]</b>&nbsp;`;
            
            // Insert the timestamp at the current cursor position
            document.execCommand('insertHTML', false, html);
        }
    };

    window.addEventListener('load', () => {
        const timeToggleBtn = document.getElementById('timestampToggle');
        const timerDisplay = document.getElementById('sessionTimer');

        timeToggleBtn.onclick = (e) => {
            e.preventDefault();
            if (!timeToggleBtn.innerText.includes("ON")) {
                startTime = Date.now();
                timeToggleBtn.innerText = "⏱️ Time: ON";
                timeToggleBtn.style.background = "#d32f2f";
                timerDisplay.style.display = "inline";
                
                // Initial stamp
                window.insertProTimestamp();

                timerInterval = setInterval(() => {
                    const sec = Math.floor((Date.now() - startTime) / 1000);
                    timerDisplay.innerText = new Date(sec * 1000).toISOString().substr(11, 8);
                }, 1000);
            } else {
                clearInterval(timerInterval);
                timeToggleBtn.innerText = "⏱️ Time: OFF";
                timeToggleBtn.style.background = "#009688";
                timerDisplay.style.display = "none";
                startTime = null;
            }
        };
    });
})();
