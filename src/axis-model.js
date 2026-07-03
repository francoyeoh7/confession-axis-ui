const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const X_AXIS_POINT_COUNT = 100;
const Y_AXIS_POINT_COUNT = 100;
const X_AXIS_HALF_LENGTH = 750;
const Y_AXIS_HALF_LENGTH = 325;
const X_AXIS_MIN_LENGTH = 46;
const Y_AXIS_MIN_LENGTH = 43;

export const AXIS_LABELS = {
  left: "My fault",
  right: "Can't explain",
  top: "I knew",
  bottom: "I had no idea",
};

export const QUADRANTS = {
  q1: {
    id: "q1",
    shortName: "Known / Unexplainable",
    xLabel: AXIS_LABELS.right,
    yLabel: AXIS_LABELS.top,
    tone: "haunted certainty",
    line: "Yeah. I wanted the money. I wanted it so bad I couldn't see straight.",
  },
  q2: {
    id: "q2",
    shortName: "Known / My Fault",
    xLabel: AXIS_LABELS.left,
    yLabel: AXIS_LABELS.top,
    tone: "clear confession",
    line: "Yeah. I wanted the money. I wanted it so bad I couldn't see straight.",
  },
  q3: {
    id: "q3",
    shortName: "Blind / My Fault",
    xLabel: AXIS_LABELS.left,
    yLabel: AXIS_LABELS.bottom,
    tone: "late guilt",
    line: "No. I had no idea. But if someone has to carry this, it still feels like me.",
  },
  q4: {
    id: "q4",
    shortName: "Blind / Unexplainable",
    xLabel: AXIS_LABELS.right,
    yLabel: AXIS_LABELS.bottom,
    tone: "dissociation",
    line: "No. I had no idea. I keep trying to explain it, and the words keep breaking.",
  },
};

export const AXIS_SCALE = {
  xPoints: X_AXIS_POINT_COUNT,
  yPoints: Y_AXIS_POINT_COUNT,
  xHalfLength: X_AXIS_HALF_LENGTH,
  yHalfLength: Y_AXIS_HALF_LENGTH,
  xMinLength: X_AXIS_MIN_LENGTH,
  yMinLength: Y_AXIS_MIN_LENGTH,
};

export function normalizePoint(clientX, clientY, rect) {
  const rawX = ((clientX - rect.left) / rect.width) * 2 - 1;
  const rawY = 1 - ((clientY - rect.top) / rect.height) * 2;

  return {
    x: clamp(rawX, -1, 1),
    y: clamp(rawY, -1, 1),
  };
}

export function getQuadrant(point) {
  if (point.x >= 0 && point.y >= 0) return QUADRANTS.q1;
  if (point.x < 0 && point.y >= 0) return QUADRANTS.q2;
  if (point.x < 0 && point.y < 0) return QUADRANTS.q3;
  return QUADRANTS.q4;
}

export function getAxisIntensity(point) {
  const xPower = Math.round(Math.abs(point.x) * X_AXIS_POINT_COUNT);
  const yPower = Math.round(Math.abs(point.y) * Y_AXIS_POINT_COUNT);

  return {
    xLabel: point.x >= 0 ? AXIS_LABELS.right : AXIS_LABELS.left,
    yLabel: point.y >= 0 ? AXIS_LABELS.top : AXIS_LABELS.bottom,
    xPercent: clamp(xPower, 0, 100),
    yPercent: clamp(yPower, 0, 100),
  };
}

export function getAxisSegmentLengths(point) {
  const xLength = Math.max(Math.abs(point.x) * X_AXIS_HALF_LENGTH, X_AXIS_MIN_LENGTH);
  const yLength = Math.max(Math.abs(point.y) * Y_AXIS_HALF_LENGTH, Y_AXIS_MIN_LENGTH);

  return {
    left: point.x < 0 ? xLength : X_AXIS_MIN_LENGTH,
    right: point.x >= 0 ? xLength : X_AXIS_MIN_LENGTH,
    top: point.y >= 0 ? yLength : Y_AXIS_MIN_LENGTH,
    bottom: point.y < 0 ? yLength : Y_AXIS_MIN_LENGTH,
  };
}

export function buildResponse(point) {
  const quadrant = getQuadrant(point);
  const intensity = getAxisIntensity(point);

  return {
    quadrant,
    intensity,
    line: quadrant.line,
  };
}
