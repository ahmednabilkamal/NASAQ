/**
 * Wrap admin-provided legal copy for in-app WebView (RTL, plain text or HTML).
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function buildLegalWebDocument(body: string, emptyMessage: string): string {
    const trimmed = body.trim();
    const meta =
        '<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>';
    const baseStyle =
        'body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:16px;color:#1a1a1a;font-size:16px;line-height:1.65;} img{max-width:100%;height:auto;} a{color:#064E3B;}';

    if (!trimmed) {
        return `<!DOCTYPE html><html dir="rtl"><head>${meta}<style>${baseStyle}</style></head><body><p>${escapeHtml(emptyMessage)}</p></body></html>`;
    }

    const looksHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
    if (looksHtml) {
        return `<!DOCTYPE html><html dir="rtl"><head>${meta}<style>${baseStyle}</style></head><body>${trimmed}</body></html>`;
    }

    return `<!DOCTYPE html><html dir="rtl"><head>${meta}<style>${baseStyle}</style></head><body><p style="white-space:pre-wrap;">${escapeHtml(trimmed)}</p></body></html>`;
}
