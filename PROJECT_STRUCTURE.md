# NASAQ / Venus React Native — project layout

Expo Router keeps **routes under `app/`** (file names = URL paths). Do not move screens out of `app/` unless you reconfigure the router.

## Top-level folders

| Folder | Role |
|--------|------|
| `app/` | Routes only: `_layout.tsx`, `index.tsx`, `pages/**` |
| `components/` | Reusable UI (home, chat, onboarding, shells) |
| `config/` | API client, auth, RTL, env-related wiring |
| `constants/` | App-wide constants; **`routes.ts`** = all `router` paths |
| `theme/` | Colors & future tokens (`theme/colors.ts`) |
| `hooks/` | Shared hooks |
| `services/` | Push / side-effect modules |
| `providers/` | React context providers (e.g. notifications) |
| `utils/` | Pure helpers |
| `assets/` | Images, fonts references |

## Navigation

- Import paths from **`@/constants/routes`** (`ROUTES`, `href()`).
- Onboarding / home resolution lives in **`config/navigationFlow.ts`**.
- Per-login onboarding hints: **`config/authContext.tsx`** → `getOnboardingStep`.

## Styling

- Prefer **`theme/colors.ts`** for brand greens instead of hard-coded hex in new code.
- RTL: `config/rtlText.ts`, `config/rtlLayout.ts` — see comments in `app/_layout.tsx`.

## Toast

- Config lives in **`components/AppToastConfig.tsx`** (`AppToast` + `appToastConfig`).

## Optional next steps

- Gradually replace `router.push('...' as any)` with `router.push(href(ROUTES....))`.
- Split very large screens into `components/features/<feature>/`.
- Move copy JSON from `data/content.ts` into `constants/locale/` if you add i18n files.
