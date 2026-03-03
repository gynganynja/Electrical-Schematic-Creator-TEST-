# Mobile Setup Guide (Capacitor)

Circuit Generator is wrapped with [Capacitor](https://capacitorjs.com/) to run as a native Android/iOS app.

---

## Prerequisites

| Platform | Requirement |
|---|---|
| Android | [Android Studio](https://developer.android.com/studio) + JDK 17+ |
| iOS | macOS + [Xcode](https://developer.apple.com/xcode/) 14+ |

---

## First-Time Platform Setup

### 1. Add Android platform
```bash
npm run cap:add:android
```

### 2. Add iOS platform (macOS only)
```bash
npm run cap:add:ios
```

These commands create `android/` and `ios/` folders in the project root.

---

## Building & Deploying

### Android
```bash
# Build web app + sync to Android
npm run build:android

# Open in Android Studio
npm run cap:open:android
```
Then in Android Studio: **Run ▶** to launch on a device or emulator.

### iOS (macOS only)
```bash
# Build web app + sync to iOS
npm run build:ios

# Open in Xcode
npm run cap:open:ios
```
Then in Xcode: select your target device and press **Run ▶**.

---

## Iterative Development

After any code change:
```bash
npm run build       # Rebuild web app
npm run cap:sync    # Sync dist/ to all native platforms
```

Then re-run from Android Studio / Xcode — no need to re-add platforms.

---

## App Configuration

Edit `capacitor.config.ts` to change:
- `appId` — reverse-domain bundle ID (e.g. `com.yourname.circuitgenerator`)
- `appName` — display name on the device
- `webDir` — build output folder (`dist`)

---

## Mobile UX Changes Made

| Feature | Mobile Behaviour |
|---|---|
| **Component Palette** | Hidden sidebar → floating **+** FAB button → bottom sheet drawer with tap-to-add |
| **Toolbar** | Sim controls always visible; Edit/File actions in hamburger **⋮** dropdown |
| **Inspector** | Slides in from the right when a component is selected; tap backdrop or ✕ to close |
| **Canvas** | Pinch-to-zoom, two-finger pan, larger connection handles for touch |
| **Viewport** | `100dvh`, `viewport-fit=cover`, safe-area insets for notched phones |

---

## Troubleshooting

- **White screen on Android**: ensure `base: './'` is set in `vite.config.ts` (already done).
- **Fonts not loading**: Google Fonts requires network. For offline use, self-host or use system fonts.
- **File Save/Load on iOS**: Capacitor's `@capacitor/filesystem` plugin can replace the browser download approach if native file picking is needed.
