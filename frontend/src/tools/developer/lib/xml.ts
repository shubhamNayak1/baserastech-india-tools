export interface XmlResult {
  ok: boolean;
  error?: string;
  line?: number;
  doc?: Document;
}

export function parseXml(text: string): XmlResult {
  if (!text.trim()) return { ok: false, error: 'Input is empty.' };
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const err = doc.getElementsByTagName('parsererror')[0];
  if (err) {
    const msg = (err.textContent ?? 'Invalid XML').replace(/\s+/g, ' ').trim();
    const line = /line(?: number)?\s*(\d+)/i.exec(msg);
    const clean = msg
      .replace(/^This page contains the following errors:\s*/i, '')
      .replace(/Below is a rendering.*$/i, '')
      .trim();
    return { ok: false, error: clean || 'Invalid XML', line: line ? Number(line[1]) : undefined };
  }
  return { ok: true, doc };
}

const escText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string) => escText(s).replace(/"/g, '&quot;');

export function formatXml(text: string, indent = '  '): string {
  const r = parseXml(text);
  if (!r.ok || !r.doc) throw new Error(r.error ?? 'Invalid XML');
  const out: string[] = [];
  const declMatch = /^\s*(<\?xml[^?]*\?>)/.exec(text);
  if (declMatch) out.push(declMatch[1]);
  const walk = (node: Node, depth: number) => {
    const pad = indent.repeat(depth);
    switch (node.nodeType) {
      case Node.ELEMENT_NODE: {
        const el = node as Element;
        const attrs = Array.from(el.attributes)
          .map((a) => ` ${a.name}="${escAttr(a.value)}"`)
          .join('');
        const kids = Array.from(el.childNodes).filter(
          (c) => !(c.nodeType === Node.TEXT_NODE && !c.textContent?.trim()),
        );
        if (!kids.length) out.push(`${pad}<${el.tagName}${attrs}/>`);
        else if (kids.length === 1 && kids[0].nodeType === Node.TEXT_NODE)
          out.push(
            `${pad}<${el.tagName}${attrs}>${escText(kids[0].textContent!.trim())}</${el.tagName}>`,
          );
        else {
          out.push(`${pad}<${el.tagName}${attrs}>`);
          kids.forEach((k) => walk(k, depth + 1));
          out.push(`${pad}</${el.tagName}>`);
        }
        break;
      }
      case Node.TEXT_NODE:
        out.push(`${pad}${escText(node.textContent!.trim())}`);
        break;
      case Node.CDATA_SECTION_NODE:
        out.push(`${pad}<![CDATA[${node.textContent}]]>`);
        break;
      case Node.COMMENT_NODE:
        out.push(`${pad}<!--${node.textContent}-->`);
        break;
      case Node.PROCESSING_INSTRUCTION_NODE: {
        const pi = node as ProcessingInstruction;
        out.push(`${pad}<?${pi.target} ${pi.data}?>`);
        break;
      }
      case Node.DOCUMENT_TYPE_NODE: {
        const dt = node as DocumentType;
        out.push(
          `<!DOCTYPE ${dt.name}${dt.publicId ? ` PUBLIC "${dt.publicId}"` : ''}${dt.systemId ? ` "${dt.systemId}"` : ''}>`,
        );
        break;
      }
    }
  };
  Array.from(r.doc.childNodes).forEach((n) => walk(n, 0));
  return out.join('\n');
}

export function minifyXml(text: string): string {
  const r = parseXml(text);
  if (!r.ok) throw new Error(r.error);
  return text
    .replace(/>\s+</g, '><')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}
