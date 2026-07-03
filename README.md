# Confession Axis UI

Static interactive UI based on the Figma draft frame `Frame 33`.

## Online Preview

This project is designed to run as a static GitHub Pages site. Open the published Pages URL in any browser to preview it on another computer.

## Local Preview

Run a local static server from this folder:

```bash
node serve.mjs
```

Then open `http://127.0.0.1:8087/`.

The UI maps pointer position to four confession quadrants:

- X left: `My fault`
- X right: `Can't explain`
- Y top: `I knew`
- Y bottom: `I had no idea`

Assets:

- `assets/scene-background.mp4` is the looping video background.
- `assets/figma-frame-33.png` is a full-frame reference export for visual comparison.

No Figma token is stored in this project.
