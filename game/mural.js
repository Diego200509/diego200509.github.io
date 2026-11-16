import { tonalTable } from "../rgb-tone.js";

export const muralPalette = [[246, 83, 81], [96, 232, 147], [100, 160, 255]];
export const muralCells = Array.from({ length: 72 }, (_, index) => {
  const col = Math.floor(index / 6);
  const row = index % 6;
  const rise = Math.abs(Math.sin(col * .58 + .2)) * 2.7;
  return { col, row, band: row < 1 + rise * .53 ? 1 : row < 2.4 + rise * .72 ? 0 : 2, shade: row % 2 ? 153 : 173 };
});

export function muralColors(levels) {
  const tables = levels.map(level => tonalTable(true, level));
  return muralPalette.map(color => color.map((value, index) => tables[index][value]));
}
