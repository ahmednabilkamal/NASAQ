/**
 * Saudi Riyal display for RTL Arabic UI: Arabic-Indic digits, amount then official sign (U+20C1).
 * In layouts prefer `<SarPriceText />` (SVG) for consistent rendering; this string form is for toasts and inline Text.
 */
/** Official Saudi Riyal sign (Unicode 17); may render as tofu if the font lacks the glyph */
export const SAUDI_RIYAL_SIGN = '\u20C1';

const DIGIT_MAP: Record<string, string> = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩',
};

/** Arabic decimal separator (٫) — keeps «٢٢٫٥٠» unambiguous in RTL. */
const AR_DECIMAL = '\u066B';

export function toArabicIndicDigits(input: string): string {
    return input.replace(/[0-9]/g, (d) => DIGIT_MAP[d] ?? d);
}

function parseAmount(value: unknown): number | null {
    if (value == null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const s = String(value).trim().replace(/,/g, '');
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
}

/** Core numeric string (Western digits + ASCII `.`) before Indic conversion. */
function formatAmountCore(n: number, maximumFractionDigits: number): string {
    const rounded = Math.round(n * 10 ** maximumFractionDigits) / 10 ** maximumFractionDigits;
    const isInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
    if (isInt) return String(Math.round(rounded));
    let s = rounded.toFixed(maximumFractionDigits);
    s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return s;
}

/**
 * Arabic-Indic amount only (no currency mark). Use with {@link SaudiRiyalSymbol} or {@link SarPriceText}.
 */
export function formatSarAmount(value: unknown, maximumFractionDigits = 2): string {
    const n = parseAmount(value);
    if (n == null) return '—';
    const core = formatAmountCore(n, maximumFractionDigits);
    const withArDecimal = core.replace('.', AR_DECIMAL);
    return toArabicIndicDigits(withArDecimal);
}

/**
 * @param value — number, numeric string, or null/undefined
 * @returns amount + Saudi Riyal sign, or «—» when not a finite number
 */
export function formatSarPrice(value: unknown, maximumFractionDigits = 2): string {
    const amount = formatSarAmount(value, maximumFractionDigits);
    if (amount === '—') return '—';
    return `${amount} ${SAUDI_RIYAL_SIGN}`;
}
