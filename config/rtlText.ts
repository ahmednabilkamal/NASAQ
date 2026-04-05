/**
 * `rtlText.alignStart` / `alignEnd` = **where Arabic lines should begin / end**, not
 * “screen left” or “screen right”.
 *
 * ┌─────────────┬──────────────────────────────────────────────────────────────┐
 * │ Platform    │ alignStart maps to…        │ Why                            │
 * ├─────────────┼────────────────────────────┼────────────────────────────────┤
 * │ Web         │ `textAlign: 'right'`       │ Under `dir="rtl"` /            │
 * │             │                            │ `direction: 'rtl'`, that edge  │
 * │             │                            │ is **reading start**.          │
 * ├─────────────┼────────────────────────────┼────────────────────────────────┤
 * │ iOS/Android │ `textAlign: 'left'`        │ With `forceRTL`, RN **mirrors**│
 * │             │                            │ left↔right for paragraph text  │
 * │             │                            │ (`RCTAttributedTextUtils`,     │
 * │             │                            │ `ReactTextShadowNode`).        │
 * │             │                            │ So **`left` = inline start** = │
 * │             │                            │ visually **right** for RTL.    │
 * │             │                            │ Using `'right'` here would be  │
 * │             │                            │ **end**, i.e. visual **left**. │
 * └─────────────┴────────────────────────────┴────────────────────────────────┘
 *
 * Android `TextInput` only accepts left/right/center/auto — no `start`/`end` — so
 * this same mapping applies to inputs.
 *
 * Do not add `direction: 'rtl'` on native roots that already use `forceRTL` (see
 * `_layout.tsx` / `rtlLayout.ts` for web vs stylist subtree exceptions).
 */
import { Platform, type TextStyle } from 'react-native';

/** Web: physical `right` is reading-start under RTL document + RN tree direction. */
const web = {
    alignStart: { textAlign: 'right' as const },
    alignEnd: { textAlign: 'left' as const },
};

/**
 * Native: `'left'` / `'right'` are **logical** after RTL mirroring — see table above.
 * This is the correct mapping; it is not “backwards”.
 */
const nativeMirrored = {
    alignStart: { textAlign: 'left' as const },
    alignEnd: { textAlign: 'right' as const },
};

export const rtlText = Platform.OS === 'web' ? web : nativeMirrored;

/**
 * TextInput (and multiline) — typed text + placeholder alignment for Arabic RTL.
 * `alignStart` alone is tuned for `Text` and often leaves placeholders on the wrong edge inside inputs.
 */
export const rtlInput: TextStyle = Platform.select({
    web: { textAlign: 'right' as const },
    ios: { textAlign: 'right' as const, writingDirection: 'rtl' as const },
    /** Android: explicit RTL fixes placeholder + cursor alignment in TextInputs */
    default: { textAlign: 'right' as const, writingDirection: 'rtl' as const },
}) as TextStyle;

/** Pair with `rtlText.alignStart` on `Text` for Arabic paragraphs on native (onboarding, labels). */
export const rtlWritingMode: TextStyle =
    Platform.OS === 'web' ? {} : { writingDirection: 'rtl' as const };
