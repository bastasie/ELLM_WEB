# ELLM website

This folder contains a standalone, shareable copy of the full ELLM web app. It runs the prime-encoded knowledge engine entirely in the browser—no servers or build steps required.

## Quick start

```bash
python -m http.server 8000 -d "ELLM website"
```

Open <http://127.0.0.1:8000/> in your browser. You can also double-click `index.html` to launch it directly.

## Usage
1. Press **Load sample knowledge** to preload the facts and rules from the original ELLM demonstration.
2. Click **Learn from text** to store the statements in the knowledge base.
3. Ask a natural-language question (e.g., `Is the engine part of the transportation system?`).
4. Review the answer and the reasoning chain, and inspect the facts/rules stored in the page.

## Contents
- `index.html` – Page shell and layout for the standalone web app.
- `styles.css` – Visual styling for the panels and responsive grid.
- `ellm-core.js` – Complete ELLM implementation (prime encoder, parser, reasoner).
- `main.js` – UI wiring that connects the controls to the ELLM core.

