export type LabelSide =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-right"
  | "bottom-right"
  | "bottom-left"
  | "top-left";

export type LabelItem = {
  /** Marker center, in canvas pixels. */
  x: number;
  y: number;
  /** Label box size, in canvas pixels. */
  width: number;
  height: number;
  /** Marker box size; other labels may not cover it. */
  marker: number;
  /** Higher-priority labels claim a spot first. */
  priority: number;
};

type Box = { left: number; top: number; right: number; bottom: number };

const SIDES: LabelSide[] = [
  "top",
  "right",
  "bottom",
  "left",
  "top-right",
  "bottom-right",
  "bottom-left",
  "top-left",
];

/** Unit direction from the marker to the label for each side. */
const DIRECTIONS: Record<LabelSide, [number, number]> = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
  "top-right": [Math.SQRT1_2, -Math.SQRT1_2],
  "bottom-right": [Math.SQRT1_2, Math.SQRT1_2],
  "bottom-left": [-Math.SQRT1_2, Math.SQRT1_2],
  "top-left": [-Math.SQRT1_2, -Math.SQRT1_2],
};

/**
 * Mirrors chartjs-plugin-datalabels: the box edge (or corner, on a diagonal)
 * nearest the marker sits `offset` pixels from it along the side's direction.
 */
function labelBox(item: LabelItem, side: LabelSide, offset: number): Box {
  const { x, y, width: w, height: h } = item;
  const [vx, vy] = DIRECTIONS[side];
  const cx = x + Math.sign(vx) * (w / 2) + vx * offset;
  const cy = y + Math.sign(vy) * (h / 2) + vy * offset;
  return {
    left: cx - w / 2,
    top: cy - h / 2,
    right: cx + w / 2,
    bottom: cy + h / 2,
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

type Placement = { sides: LabelSide[]; unplaced: number[] };

function placeInOrder(
  items: LabelItem[],
  order: number[],
  area: Box,
  offset: number,
): Placement {
  const markers = items.map(({ x, y, marker }) => ({
    left: x - marker / 2,
    top: y - marker / 2,
    right: x + marker / 2,
    bottom: y + marker / 2,
  }));
  const placed: Box[] = [];
  const sides: LabelSide[] = items.map(() => "top");
  const unplaced: number[] = [];
  for (const i of order) {
    const candidates = SIDES.map((side) => {
      const box = labelBox(items[i], side, offset);
      const markerCover = markers.reduce(
        (sum, m, j) => (j === i ? sum : sum + overlapArea(box, m)),
        0,
      );
      const fits = inside(box, area) && !placed.some((p) => overlaps(box, p));
      return { side, fits, markerCover };
    }).filter((c) => c.fits);
    const side = (
      candidates.find((c) => c.markerCover === 0) ??
      [...candidates].sort((a, b) => a.markerCover - b.markerCover)[0]
    )?.side;
    if (side) {
      sides[i] = side;
      placed.push(labelBox(items[i], side, offset));
    } else {
      unplaced.push(i);
    }
  }
  return { sides, unplaced };
}

/**
 * Picks a side for each label: the first of top, right, bottom, left and the
 * four diagonals that stays inside `area` and covers no placed label and no other marker. If no
 * side is free, it takes the side that covers no placed label and the least
 * marker area. Labels are placed in priority order; when one is left without
 * a spot, it moves to the front of the order and placement reruns; the
 * arrangement that leaves the fewest labels without a spot wins. Those stay on top, where the chart's
 * own overlap hiding applies.
 */
export function placeLabels(
  items: LabelItem[],
  area: Box,
  offset: number,
): LabelSide[] {
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
  return best.sides;
}
