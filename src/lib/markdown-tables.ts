/**
 * Repair GFM tables that were collapsed into a single line
 * (common when pasting from Word/docs or some CMS exports).
 *
 * Example broken:
 * `| a | b | | --- | --- | | c | d |`
 *
 * Fixed:
 * ```
 * | a | b |
 * | --- | --- |
 * | c | d |
 * ```
 */
export function normalizeMarkdownTables(input: string): string {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  for (const line of lines) {
    const fixed = expandCollapsedTableLine(line);
    out.push(fixed ?? line);
  }

  return out.join("\n");
}

function cellsFromRowSegment(segment: string): string[] {
  let s = segment.trim();
  if (!s) return [];
  if (!s.startsWith("|")) s = `|${s}`;
  if (!s.endsWith("|")) s = `${s}|`;
  return s
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
}

function formatRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

function expandCollapsedTableLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return null;

  // Separator block: | --- | :---: | ---: |
  const sepRe = /((?:\|\s*:?-{3,}:?\s*)+\|)/;
  const match = sepRe.exec(trimmed);
  if (!match || match.index == null) return null;

  const sepBlock = match[1];
  const sepCells = cellsFromRowSegment(sepBlock);
  const colCount = sepCells.length;
  if (colCount < 1) return null;

  // Already a normal single-row table line (only separator) — leave alone
  const beforeRaw = trimmed.slice(0, match.index).trim();
  const afterRaw = trimmed.slice(match.index + sepBlock.length).trim();
  if (!beforeRaw && !afterRaw) return null;

  // Not collapsed if header/body already on other lines (this line is only sep)
  if (!beforeRaw && afterRaw.startsWith("|") === false && !afterRaw) return null;

  // Collapsed tables usually have header on the same line before the separator
  if (!beforeRaw) return null;

  // If the line already looks like a single well-formed row (few pipes), skip
  const pipeCount = (trimmed.match(/\|/g) ?? []).length;
  if (pipeCount < colCount * 2 + 2) return null;

  let headerCells = cellsFromRowSegment(beforeRaw);
  // Drop trailing empty cell produced by `| |` before separator
  while (headerCells.length > colCount && headerCells[headerCells.length - 1] === "") {
    headerCells = headerCells.slice(0, -1);
  }
  if (headerCells.length > colCount) {
    headerCells = headerCells.slice(-colCount);
  }
  if (headerCells.length !== colCount) return null;

  const rows: string[][] = [headerCells, sepCells];

  if (afterRaw) {
    // Body rows were joined with `| |` (empty delimiter between rows)
    const chunks = afterRaw
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split(/\|\s*\|/)
      .map((chunk) => cellsFromRowSegment(`|${chunk}|`))
      .filter((cells) => cells.some((c) => c.length > 0));

    for (const chunk of chunks) {
      let cells = chunk;
      while (cells.length > colCount && cells[cells.length - 1] === "") {
        cells = cells.slice(0, -1);
      }
      if (cells.length < colCount) {
        while (cells.length < colCount) cells.push("");
      } else if (cells.length > colCount) {
        cells = cells.slice(0, colCount);
      }
      rows.push(cells);
    }
  }

  if (rows.length < 2) return null;
  return rows.map(formatRow).join("\n");
}
