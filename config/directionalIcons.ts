/**
 * RTL icon helpers for Arabic-only app.
 * Since the app is always RTL, these return fixed values.
 * "Back" in RTL visually points right (forward chevron).
 * "Forward" in RTL visually points left (back chevron).
 */

export function getBackChevron(): 'chevron-back' | 'chevron-forward' {
    return 'chevron-forward';
}

export function getForwardChevron(): 'chevron-back' | 'chevron-forward' {
    return 'chevron-back';
}
