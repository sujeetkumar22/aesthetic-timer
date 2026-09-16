export const parseTimeString = (raw: string): number | null => {
  if (!raw) return null;
  try {
    // Normalize string: decode URI components, replace underscores and pluses with space, lowercase
    let str = decodeURIComponent(raw).trim().toLowerCase().replace(/[+_]/g, ' ');

    // Disallow negative values
    if (str.includes('-')) return null;

    // Convert word numbers (e.g. "two hours 45 minutes" -> "2 hours 45 minutes")
    const words: Record<string, string> = {
      zero: '0', one: '1', two: '2', three: '3', four: '4',
      five: '5', six: '6', seven: '7', eight: '8', nine: '9',
      ten: '10', fifteen: '15', twenty: '20', thirty: '30',
      forty: '40', fifty: '50'
    };
    for (const [w, n] of Object.entries(words)) {
      str = str.replace(new RegExp(`\\b${w}\\b`, 'g'), n);
    }

    // Pattern 1: HH:MM:SS or MM:SS (e.g. "02:45:00", "01:30:00" or "25:00")
    if (str.includes(':')) {
      const parts = str.split(':').map((p) => parseFloat(p.trim()));
      if (parts.some((n) => isNaN(n) || n < 0)) return null;

      if (parts.length === 3) {
        const [h, m, s] = parts;
        return Math.round(h * 3600 + m * 60 + s);
      } else if (parts.length === 2) {
        const [m, s] = parts;
        return Math.round(m * 60 + s);
      }
      return null;
    }

    // Pattern 2: Multi-unit or natural language strings:
    // "2 hours 45 minutes", "2 hrs 45 mins", "2h 45m", "2h45m", "2.5h", "165m", "90s"
    let foundUnit = false;
    let totalSeconds = 0;

    // Hours: e.g. "2 hours", "2 hrs", "2 hr", "2h", "2.5h"
    const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)(?![a-z])/i);
    if (hourMatch) {
      foundUnit = true;
      totalSeconds += parseFloat(hourMatch[1]) * 3600;
    }

    // Minutes: e.g. "45 minutes", "45 mins", "45 min", "45m"
    const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|min|m)(?![a-z])/i);
    if (minMatch) {
      foundUnit = true;
      totalSeconds += parseFloat(minMatch[1]) * 60;
    }

    // Seconds: e.g. "30 seconds", "30 secs", "30 sec", "30s"
    const secMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|sec|s)(?![a-z])/i);
    if (secMatch) {
      foundUnit = true;
      totalSeconds += parseFloat(secMatch[1]);
    }

    if (foundUnit && totalSeconds > 0) {
      return Math.round(totalSeconds);
    }

    // Pattern 3: Pure number (e.g. "25" -> 25 minutes; "300" -> 300 seconds if > 180)
    const pureNum = parseFloat(str);
    if (!isNaN(pureNum) && pureNum > 0 && /^\d+(?:\.\d+)?$/.test(str.trim())) {
      if (pureNum <= 180) {
        return Math.round(pureNum * 60);
      } else {
        return Math.round(pureNum);
      }
    }
  } catch (e) {
    return null;
  }

  return null;
};

export const getTimerFromLocation = (): number | null => {
  try {
    // 1. Check pathname: /t/25m or /25m
    const pathname = window.location.pathname;
    const pathMatch = pathname.match(/\/(?:t\/)?([^/]+)/);
    if (pathMatch && pathMatch[1] && pathMatch[1] !== 't') {
      const parsed = parseTimeString(pathMatch[1]);
      if (parsed) return parsed;
    }

    // 2. Check query string: ?t=25m or ?time=25m
    const params = new URLSearchParams(window.location.search);
    const queryTime = params.get('t') || params.get('time');
    if (queryTime) {
      const parsed = parseTimeString(queryTime);
      if (parsed) return parsed;
    }

    // 3. Check hash: #/t/25m or #t=25m
    const hash = window.location.hash;
    if (hash) {
      const hashClean = hash.replace(/^#\/?(?:t\/)?/, '');
      const parsed = parseTimeString(hashClean);
      if (parsed) return parsed;
    }
  } catch (e) {
    console.error('Error parsing timer URL', e);
  }
  return null;
};

export const formatDurationToSlug = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join('') : '0s';
};

export const generateShareUrl = (totalSeconds: number): string => {
  const slug = formatDurationToSlug(totalSeconds);
  const base = `${window.location.origin}${window.location.pathname.replace(/\/t\/.*$/, '')}`;
  // Provide query param fallback which works reliably on all static hosts without server rewrites
  return `${base}?t=${slug}`;
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
};
