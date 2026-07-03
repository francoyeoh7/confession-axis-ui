import {
  buildResponse,
  getAxisSegmentLengths,
  getAxisIntensity,
  getQuadrant,
  normalizePoint,
} from "./axis-model.js";

const scene = document.querySelector(".scene");
const backgroundVideo = document.getElementById("backgroundVideo");
const uiStage = document.getElementById("uiStage");
const axisPad = document.getElementById("axisPad");
const axisHitArea = document.getElementById("axisHitArea");
const axisStage = document.querySelector(".axis-stage");
const selector = document.getElementById("selector");
const sectorHighlight = document.querySelector(".sector-highlight");
const responseLine = document.getElementById("responseLine");
const replyLine = document.getElementById("replyLine");
const confirmButton = document.getElementById("confirmButton");
const dialogueChoice = document.querySelector(".dialogue__choice");

const JACK_REPLY = "Seems we're done for. V... You knew before we walked in. Didn't you...";
const DESIGN = { width: 1920, height: 1080 };
const AXIS_PAD = { left: 210, top: 215, width: 1500, height: 650 };
const AXIS_CENTER = { x: 960, y: 540 };
const LABEL_OFFSET = { x: 72, top: 80, bottom: 45 };
const LOOP_EARLY_SECONDS = 0.08;

let activePointerId = null;
let lastPoint = { x: 0.81456, y: 0.87424 };
let stageLayout = { scale: 1, left: 0, top: 0 };
let isLocked = false;
let isPreviewHidden = false;

function setVideoLoop() {
  if (!backgroundVideo) return;

  backgroundVideo.addEventListener("loadedmetadata", () => {
    backgroundVideo.play().catch(() => {});
  });

  backgroundVideo.addEventListener("timeupdate", () => {
    if (!backgroundVideo.duration) return;
    if (backgroundVideo.currentTime >= backgroundVideo.duration - LOOP_EARLY_SECONDS) {
      backgroundVideo.currentTime = 0.01;
      backgroundVideo.play().catch(() => {});
    }
  });
}

function setSceneState(point, isActive = true) {
  lastPoint = point;
  const quadrant = getQuadrant(point);
  const intensity = getAxisIntensity(point);
  const axisSegments = getAxisSegmentLengths(point);
  const response = buildResponse(point);
  const rawX = (point.x + 1) / 2;
  const rawY = (1 - point.y) / 2;
  const designX = AXIS_PAD.left + rawX * AXIS_PAD.width;
  const designY = AXIS_PAD.top + rawY * AXIS_PAD.height;

  scene.dataset.quadrant = quadrant.id;
  scene.dataset.axisX = point.x >= 0 ? "right" : "left";
  scene.dataset.axisY = point.y >= 0 ? "top" : "bottom";
  scene.dataset.active = String(isActive);
  scene.style.setProperty("--point-x", `${designX}px`);
  scene.style.setProperty("--point-y", `${designY}px`);
  scene.style.setProperty("--axis-left-length", `${axisSegments.left}px`);
  scene.style.setProperty("--axis-right-length", `${axisSegments.right}px`);
  scene.style.setProperty("--axis-top-length", `${axisSegments.top}px`);
  scene.style.setProperty("--axis-bottom-length", `${axisSegments.bottom}px`);
  scene.style.setProperty("--axis-x-length", `${axisSegments.left + axisSegments.right}px`);
  scene.style.setProperty("--axis-y-length", `${axisSegments.top + axisSegments.bottom}px`);
  scene.style.setProperty("--axis-x-center", `${(axisSegments.left / (axisSegments.left + axisSegments.right)) * 100}%`);
  scene.style.setProperty("--axis-y-center", `${(axisSegments.top / (axisSegments.top + axisSegments.bottom)) * 100}%`);
  scene.style.setProperty("--label-left-x", `${AXIS_CENTER.x - axisSegments.left - LABEL_OFFSET.x}px`);
  scene.style.setProperty("--label-right-x", `${AXIS_CENTER.x + axisSegments.right + 32}px`);
  scene.style.setProperty("--label-top-y", `${AXIS_CENTER.y - axisSegments.top - LABEL_OFFSET.top}px`);
  scene.style.setProperty("--label-bottom-y", `${AXIS_CENTER.y + axisSegments.bottom + LABEL_OFFSET.bottom}px`);

  responseLine.textContent = response.line;
  replyLine.textContent = JACK_REPLY;
  selector.setAttribute(
    "aria-label",
    `${quadrant.shortName}: ${intensity.yLabel} ${intensity.yPercent} percent, ${intensity.xLabel} ${intensity.xPercent} percent`
  );
}

function getAxisInteractionRect() {
  return {
    left: stageLayout.left + AXIS_PAD.left * stageLayout.scale,
    top: stageLayout.top + AXIS_PAD.top * stageLayout.scale,
    width: AXIS_PAD.width * stageLayout.scale,
    height: AXIS_PAD.height * stageLayout.scale,
  };
}

function isInsideAxisField(event, rect) {
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.left + rect.width &&
    event.clientY >= rect.top &&
    event.clientY <= rect.top + rect.height
  );
}

function updateFromEvent(event, allowClamp = false) {
  if (isLocked || isPreviewHidden) return;

  const rect = getAxisInteractionRect();
  if (!allowClamp && !isInsideAxisField(event, rect)) return;

  const point = normalizePoint(event.clientX, event.clientY, rect);
  setSceneState(point, true);
}

function lockSelection() {
  if (isLocked) return;

  isLocked = true;
  isPreviewHidden = false;
  scene.dataset.locked = "true";
  scene.dataset.previewHidden = "false";
  confirmButton.setAttribute("aria-hidden", "true");
  confirmButton.tabIndex = -1;
  responseLine.style.color = "rgba(255, 202, 20, 1)";
  applyPreviewVisibility();
}

function togglePreviewVisibility() {
  if (isLocked) return;

  isPreviewHidden = !isPreviewHidden;
  scene.dataset.previewHidden = String(isPreviewHidden);
  applyPreviewVisibility();
}

function applyPreviewVisibility() {
  if (isLocked) {
    axisStage.style.pointerEvents = "none";
    fadeTo(axisStage, 0);
    fadeTo(sectorHighlight, 0);
    dialogueChoice.style.pointerEvents = "none";
    confirmButton.style.pointerEvents = "none";
    fadeTo(confirmButton, 0);
    return;
  }

  const pointerEvents = isPreviewHidden ? "none" : "";
  axisStage.style.pointerEvents = pointerEvents;
  fadeTo(axisStage, isPreviewHidden ? 0 : 1);
  fadeTo(sectorHighlight, isPreviewHidden ? 0 : 1);
  dialogueChoice.style.pointerEvents = pointerEvents;
  fadeTo(dialogueChoice, isPreviewHidden ? 0 : 1);
  confirmButton.style.pointerEvents = pointerEvents;
}

function fadeTo(element, targetOpacity) {
  const currentOpacity = Number.parseFloat(getComputedStyle(element).opacity);
  const fromOpacity = Number.isFinite(currentOpacity) ? currentOpacity : 1;

  if (Math.abs(fromOpacity - targetOpacity) < 0.001) {
    if (element.style.opacity) element.style.opacity = String(targetOpacity);
    return;
  }

  element.style.opacity = String(targetOpacity);
}

function layoutStage() {
  const scale = Math.min(window.innerWidth / DESIGN.width, window.innerHeight / DESIGN.height);
  const left = (window.innerWidth - DESIGN.width * scale) / 2;
  const top = (window.innerHeight - DESIGN.height * scale) / 2;
  stageLayout = { scale, left, top };
  scene.style.setProperty("--stage-scale", String(scale));
  scene.style.setProperty("--stage-left", `${left}px`);
  scene.style.setProperty("--stage-top", `${top}px`);
}

axisHitArea.addEventListener("pointerdown", (event) => {
  if (isLocked || isPreviewHidden) return;
  if (event.target.closest(".dialogue")) return;
  if (!isInsideAxisField(event, getAxisInteractionRect())) return;

  activePointerId = event.pointerId;
  axisHitArea.setPointerCapture(activePointerId);
  updateFromEvent(event, true);
});

axisHitArea.addEventListener("pointermove", (event) => {
  if (activePointerId !== null && activePointerId !== event.pointerId) return;
  updateFromEvent(event, activePointerId !== null);
});

axisHitArea.addEventListener("pointerup", (event) => {
  if (activePointerId !== event.pointerId) return;
  updateFromEvent(event, true);
  axisHitArea.releasePointerCapture(activePointerId);
  activePointerId = null;
});

axisHitArea.addEventListener("pointerleave", () => {
  if (activePointerId === null) scene.dataset.active = "false";
});

selector.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 0.18 : 0.08;
  const next = { ...lastPoint };

  if (event.key === "ArrowLeft") next.x -= step;
  else if (event.key === "ArrowRight") next.x += step;
  else if (event.key === "ArrowUp") next.y += step;
  else if (event.key === "ArrowDown") next.y -= step;
  else return;

  event.preventDefault();
  setSceneState({
    x: Math.max(-1, Math.min(1, next.x)),
    y: Math.max(-1, Math.min(1, next.y)),
  });
});

confirmButton.addEventListener("click", () => {
  lockSelection();
});

dialogueChoice.addEventListener("click", () => {
  lockSelection();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (!isLocked && key === "f") {
    confirmButton.click();
  } else if (key === "q") {
    togglePreviewVisibility();
  }
});

window.addEventListener("resize", () => {
  layoutStage();
  setSceneState(lastPoint, false);
});

setVideoLoop();
layoutStage();
scene.dataset.locked = "false";
scene.dataset.previewHidden = "false";
setSceneState(lastPoint, false);
applyPreviewVisibility();
