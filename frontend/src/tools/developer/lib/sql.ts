/** Minify SQL: strip comments and collapse whitespace, preserving string literals and identifiers. */
export function minifySql(sql: string, keepComments = false): string {
  let out = '';
  let i = 0;
  let pendingSpace = false;
  const push = (s: string) => {
    if (pendingSpace && out && !/[\s(,;]$/.test(out) && !/^[),;]/.test(s)) out += ' ';
    pendingSpace = false;
    out += s;
  };
  while (i < sql.length) {
    const c = sql[i];
    const two = sql.slice(i, i + 2);
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === c && sql[j + 1] === c) j += 2;
        else if (sql[j] === '\\' && c !== '`') j += 2;
        else if (sql[j] === c) break;
        else j++;
      }
      if (j >= sql.length)
        throw new Error(
          `Unterminated ${c === "'" ? 'string' : 'quoted identifier'} starting at position ${i + 1}.`,
        );
      push(sql.slice(i, j + 1));
      i = j + 1;
    } else if (two === '--' || c === '#') {
      const end = sql.indexOf('\n', i);
      const comment = sql.slice(i, end === -1 ? sql.length : end);
      if (keepComments) {
        push(comment);
        out += '\n';
      } else pendingSpace = true;
      i = end === -1 ? sql.length : end + 1;
    } else if (two === '/*') {
      const end = sql.indexOf('*/', i + 2);
      if (end === -1) throw new Error('Unterminated /* comment.');
      if (keepComments) push(sql.slice(i, end + 2));
      else pendingSpace = true;
      i = end + 2;
    } else if (/\s/.test(c)) {
      pendingSpace = true;
      i++;
    } else {
      push(c);
      i++;
    }
  }
  return out.trim();
}
