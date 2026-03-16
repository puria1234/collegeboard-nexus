# CollegeBoard Nexus

CollegeBoard Nexus is a browser extension with a suite of tools designed to help you with AP Classroom. It helps you extract and export questions, hide answers while studying, and generate AI study materials.

## Install

1. Download or clone this repository.
2. Open your browser’s extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder (the one containing `manifest.json`).
5. The extension should now appear in your toolbar. Open AP Classroom to use it.

## Usage

1. Open an AP Classroom assignment or quiz page that shows multiple‑choice questions.
2. Click the CollegeBoard Nexus extension icon to open the popup.
3. Select your course from the **Course** dropdown (required before extraction).
4. Optional: toggle **Answer Hider** to hide correct/incorrect indicators. A small floating panel also appears on the page for quick toggling.
5. Click **Extract Questions**.
6. Review the preview and click **Download** to save a `.txt` export.
7. Optional: use **AI Study Tools** to generate similar questions, flashcards, or a concept summary.
   - Click the gear icon in the top right to open **Settings**.
   - Input your NVIDIA API key (free from [build.nvidia.com](https://build.nvidia.com/explore/discover)).
   - Pick a mode and (if applicable) a count.
   - Click **Generate with AI** to see the output.

### Notes

- Only multiple‑choice questions are supported.
- If answer choices are images, the export will note that the choices weren’t extractable as text.
- You must be on `apclassroom.collegeboard.org` for the popup to activate.
- Your API key is stored securely in your browser's local storage.
