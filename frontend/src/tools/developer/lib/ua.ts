export interface ParsedUA {
  browser: { name: string; version: string };
  engine: string;
  os: { name: string; version: string };
  device: {
    type: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'tv' | 'unknown';
    vendor: string;
    model: string;
  };
  isBot: boolean;
}

const BOTS =
  /(googlebot|bingbot|yandex(bot)?|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|ahrefsbot|semrushbot|gptbot|claudebot|petalbot|bot\b|crawler|spider|curl|wget|python-requests|postmanruntime|headlesschrome)/i;

const WINDOWS: Record<string, string> = {
  '10.0': '10 / 11',
  '6.3': '8.1',
  '6.2': '8',
  '6.1': '7',
  '6.0': 'Vista',
  '5.1': 'XP',
};

function ver(ua: string, re: RegExp): string {
  const m = re.exec(ua);
  return m ? m[1].replace(/_/g, '.') : '';
}

export function parseUserAgent(ua: string): ParsedUA {
  const s = ua.trim();
  const bot = BOTS.exec(s);
  // Browser (order matters: many browsers include "Chrome" and "Safari").
  let browser = { name: 'Unknown', version: '' };
  const tests: [string, RegExp][] = [
    ['Microsoft Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ['Opera', /(?:OPR|Opera)\/([\d.]+)/],
    ['Samsung Internet', /SamsungBrowser\/([\d.]+)/],
    ['UC Browser', /UCBrowser\/([\d.]+)/],
    ['Brave', /Brave\/([\d.]+)/],
    ['Vivaldi', /Vivaldi\/([\d.]+)/],
    ['Yandex Browser', /YaBrowser\/([\d.]+)/],
    ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
    ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
    ['Safari', /Version\/([\d.]+).*Safari/],
    ['Internet Explorer', /(?:MSIE |Trident\/.*rv:)([\d.]+)/],
  ];
  for (const [name, re] of tests) {
    const v = ver(s, re);
    if (v) {
      browser = { name, version: v };
      break;
    }
  }
  if (bot)
    browser = {
      name: bot[1].replace(/^./, (c) => c.toUpperCase()),
      version: ver(s, new RegExp(`${bot[1]}/([\\d.]+)`, 'i')),
    };

  const engine = /Trident|MSIE/.test(s)
    ? 'Trident'
    : /Gecko\/\d/.test(s) && /Firefox/.test(s)
      ? 'Gecko'
      : /(?:Chrome|CriOS|Edg|OPR)\//.test(s) && !/iPhone|iPad|iPod/.test(s)
        ? 'Blink'
        : /AppleWebKit/.test(s)
          ? 'WebKit'
          : 'Unknown';

  let os = { name: 'Unknown', version: '' };
  if (/Windows NT ([\d.]+)/.test(s))
    os = {
      name: 'Windows',
      version: WINDOWS[ver(s, /Windows NT ([\d.]+)/)] ?? ver(s, /Windows NT ([\d.]+)/),
    };
  else if (/iPad/.test(s)) os = { name: 'iPadOS', version: ver(s, /OS ([\d_]+)/) };
  else if (/iPhone|iPod/.test(s)) os = { name: 'iOS', version: ver(s, /OS ([\d_]+)/) };
  else if (/Android/.test(s)) os = { name: 'Android', version: ver(s, /Android ([\d.]+)/) };
  else if (/CrOS/.test(s)) os = { name: 'ChromeOS', version: ver(s, /CrOS \S+ ([\d.]+)/) };
  else if (/Mac OS X/.test(s)) os = { name: 'macOS', version: ver(s, /Mac OS X ([\d_.]+)/) };
  else if (/Linux/.test(s)) os = { name: 'Linux', version: '' };

  let type: ParsedUA['device']['type'] = 'desktop';
  let vendor = '';
  let model = '';
  if (bot) type = 'bot';
  else if (/SmartTV|SMART-TV|HbbTV|AppleTV|Android TV|BRAVIA|Tizen.*TV/i.test(s)) type = 'tv';
  else if (/iPad|Tablet/.test(s) || (/Android/.test(s) && !/Mobile/.test(s))) type = 'tablet';
  else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/.test(s)) type = 'mobile';
  else if (os.name === 'Unknown' && browser.name === 'Unknown') type = 'unknown';
  if (/iPhone|iPad|iPod|Macintosh/.test(s)) {
    vendor = 'Apple';
    model = /iPhone/.test(s) ? 'iPhone' : /iPad/.test(s) ? 'iPad' : /iPod/.test(s) ? 'iPod' : 'Mac';
  } else if (/Android/.test(s)) {
    const m =
      /Android[^;)]*;\s*(?:[a-z]{2}[-_][a-z]{2};\s*)?([^;)]+?)(?:\s+Build\/[^;)]+)?\)/i.exec(s);
    model = m ? m[1].trim() : '';
    if (model === 'K') model = '';
    vendor = /^SM-|Samsung/i.test(model)
      ? 'Samsung'
      : /^(Redmi|Mi |M2|POCO|22\d{6}|23\d{6})/i.test(model)
        ? 'Xiaomi'
        : /^(CPH|OPPO)/i.test(model)
          ? 'OPPO'
          : /^(RMX)/i.test(model)
            ? 'Realme'
            : /^(V2|vivo)/i.test(model)
              ? 'vivo'
              : /Pixel/i.test(model)
                ? 'Google'
                : /OnePlus|^(IN|LE|NE|KB|CPH)2/i.test(model)
                  ? 'OnePlus'
                  : /moto/i.test(model)
                    ? 'Motorola'
                    : '';
  }
  return { browser, engine, os, device: { type, vendor, model }, isBot: Boolean(bot) };
}
