export type LabelItem = {
  /** Marker center, in canvas pixels. */
  x: number;
  y: number;
  /** Label box size, in canvas pixels. */
  width: number;
  height: number;
  /** Marker box size; no label may cover it. */
  marker: number;
  /** Higher-priority labels claim a spot first. */
  priority: number;
  /** Must stay visible even when no spot is free. */
  required: boolean;
};

/**
 * Where a label sits: `angle` is the direction from the marker in degrees,
 * clockwise from the right (-90 is above), and `offset` the gap between the
 * marker and the label's nearest edge or corner. Both are what
 * chartjs-plugin-datalabels takes as `align` and `offset`. `leader` asks for a
 * line back to the marker; `hidden` means no spot was free.
 */
export type LabelPlacement = {
  angle: number;
  offset: number;
  leader: boolean;
  hidden: boolean;
  /** The space the label claims, for drawing its leader line. */
  box?: Box;
};

type Box = { left: number; top: number; right: number; bottom: number };

/** Sides first, then corners, so labels stay level with their marker when they can. */
const ANGLES = [-90, 0, 90, 180, -45, 45, 135, -135];
/** Labels pushed out this many offsets get a leader line. */
const FAR_RING = 2.6;
/** Clear space kept around every marker. */
const MARKER_MARGIN = 2;

/** Mirrors chartjs-plugin-datalabels: the label's edge (or corner) sits `offset` from the marker. */
function labelBox(item: LabelItem, angle: number, offset: number): Box {
  const rad = (angle * Math.PI) / 180;
  const vx = Math.cos(rad);
  const vy = Math.sin(rad);
  const scale = 1 / Math.max(Math.abs(vx), Math.abs(vy));
  const cx = item.x + (item.width / 2) * vx * scale + offset * vx;
  const cy = item.y + (item.height / 2) * vy * scale + offset * vy;
  return {
    left: cx - item.width / 2,
    top: cy - item.height / 2,
    right: cx + item.width / 2,
    bottom: cy + item.height / 2,
  };
}

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const overlapArea = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

const inside = (a: Box, area: Box) =>
  a.left >= area.left &&
  a.right <= area.right &&
  a.top >= area.top &&
  a.bottom <= area.bottom;

const HIDDEN: LabelPlacement = {
  angle: -90,
  offset: 0,
  leader: false,
  hidden: true,
};

function placeInOrder(
  items: LabelItem[],
  order: number[],
  area: Box,
  offset: number,
): { placements: LabelPlacement[]; unplaced: number[] } {
  const markers = items.map(({ x, y, marker }) => {
    const r = marker / 2 + MARKER_MARGIN;
    return { left: x - r, top: y - r, right: x + r, bottom: y + r };
  });
  const candidates = [offset, offset * FAR_RING].flatMap((ring) =>
    ANGLES.map((angle) => ({ angle, offset: ring })),
  );
  const placed: Box[] = [];
  const placements = items.map(() => HIDDEN);
  const unplaced: number[] = [];
  for (const i of order) {
    const fits = (box: Box) =>
      inside(box, area) && !placed.some((p) => overlaps(box, p));
    const coversMarker = (box: Box) =>
      markers.some((m, j) => j !== i && overlaps(box, m));
    const spot = candidates.find(({ angle, offset: o }) => {
      const box = labelBox(items[i], angle, o);
      return fits(box) && !coversMarker(box);
    });
    if (spot) {
      const box = labelBox(items[i], spot.angle, spot.offset);
      placements[i] = {
        ...spot,
        leader: spot.offset > offset,
        hidden: false,
        box,
      };
      placed.push(box);
      continue;
    }
    unplaced.push(i);
    if (!items[i].required) continue;
    // A required label with no clear spot covers as little marker area as it can.
    const fallback = candidates
      .map(({ angle, offset: o }) => {
        const box = labelBox(items[i], angle, o);
        const cover = markers.reduce(
          (sum, m, j) => (j === i ? sum : sum + overlapArea(box, m)),
          0,
        );
        return { angle, offset: o, box, cover, fits: fits(box) };
      })
      .filter((c) => c.fits)
      .sort((a, b) => a.cover - b.cover)[0];
    if (fallback) {
      placements[i] = {
        angle: fallback.angle,
        offset: fallback.offset,
        leader: fallback.offset > offset,
        hidden: false,
        box: fallback.box,
      };
      placed.push(fallback.box);
    }
  }
  return { placements, unplaced };
}

/**
 * Gives each label a spot that stays inside `area` and covers no other label
 * and no marker: the four sides first, then the four corners, then the same
 * eight a ring further out with a leader line. Labels are placed in priority
 * order; when one is left without a spot, it moves to the front of the order
 * and placement reruns, and the arrangement that leaves the fewest labels
 * without a spot wins. Optional labels with no spot are hidden (the tooltip
 * still names the point); required ones take the spot covering the least
 * marker area.
 */
export function placeLabels(
  items: LabelItem[],
  area: Box,
  offset: number,
): LabelPlacement[] {
  let order = items
    .map((_, i) => i)
    .sort((a, b) => items[b].priority - items[a].priority);
  let current = placeInOrder(items, order, area, offset);
  let best = current;
  for (
    let attempt = 0;
    attempt < items.length * 2 && current.unplaced.length > 0;
    attempt++
  ) {
    const stuck = current.unplaced[0];
    order = [stuck, ...order.filter((i) => i !== stuck)];
    current = placeInOrder(items, order, area, offset);
    if (current.unplaced.length < best.unplaced.length) best = current;
  }
  return best.placements;
}
