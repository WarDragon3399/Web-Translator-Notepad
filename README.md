# Web Translator Notepad

A lightweight, offline‑first multilingual editor with speech‑to‑text, text‑to‑speech, translation, and timestamps.  
Built for students, reporters, courts, and professionals who need fast, sovereign tools without cloud dependency.

👉 **Live Demo:** [Web Translator Notepad](https://wardragon3399.github.io/Web-Translator-Notepad/)

---

## ✨ Features
- 🎤 **Speech‑to‑text** in 30+ languages  
- 🌐 **Translation with fallback** (Google → local pack → alert)  
- 🔊 **Text‑to‑speech output**  
- 🕒 **Timestamps** for transcripts and records  
- ✍️ **Editing tools**: find/replace, bold, italic, underline, strikethrough, font styles, colors  
- 📄 **Save/export options**: TXT, PDF  
- 🎨 **Formatting controls**: font size, clear formatting, watermark  
- 🔧 **Extra tools**: auto‑save toggle, word/character counter, theme selection  

---

## 🛡️ Philosophy
This project wasn’t planned on paper.  
It started as a personal tool built after 2020 to solve real needs, then expanded with features useful to everyday users.  

- No APIs  
- No PHP burden  
- No forced cloud  

Just a **sovereign, offline‑first tool** that adapts to your device and language.

---

## 📚 Use Cases
- 🏫 **Students** → Record lectures with timestamps  
- 📰 **Reporters** → Transcribe interviews in multiple languages  
- ⚖️ **Courts/Parliament** → Official records with formatting  
- 🌍 **Everyday users** → Multilingual notes and translations  

---

## 🚀 Installation
- Use directly via the [Live Demo](https://wardragon3399.github.io/Web-Translator-Notepad/)  
- Or install the packaged extension (Edge/Chrome)  

---

## 🤝 Contributing
Feedback and contributions are welcome.  
This project is organic, built from real needs — improvements should follow the same philosophy: lightweight, sovereign, and practical.

### Language Handling(How languages works...)
- By default, the app detects and works in your device’s native language.
- Translation and speech models follow a fallback chain:
  1. Local device language pack (PC or mobile).
  2. Alert to download missing pack or use online Google support (download via Android/Windows settings see Wiki  for more info).
    wiki : https://github.com/WarDragon3399/Web-Translator-Notepad/wiki
  4. Google support (direct web, no API).
  5. If in above all case fail you must download missing pack of setp 2. 
- Ensures seamless use across European, SEA, Arabic, Indian, and East Asian languages.

# Contribution Guidelines
- This project is free to use and extend for personal or educational purposes.
- Direct modifications to the base code are not permitted without prior discussion and approval.
- If you wish to add new modules (e.g., PDF/Word export), please contact the maintainer first.
- Proper credit must be given to the base idea and module when extending functionality.

### Language Support(most working covers)
- Full coverage of European languages (French, German, Spanish, etc.)
- South East Asian languages (Thai, Vietnamese, Filipino, Malay, Burmese)
- Arabic with right-to-left script support
- Indian native languages (Hindi, Gujarati, Tamil, Bengali, Marathi, Telugu, etc.)
- East Asian languages (Japanese, Chinese, Korean)
