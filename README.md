# 🎯 GoalTracker

A beautiful, **local-first** goal tracking app. Track habits and measurable goals,
keep streaks alive with a GitHub-style activity heatmap, and see where your current
trend is heading with smart projections — all offline, no account, your data stays
on your device.

![stack](https://img.shields.io/badge/React-19-61dafb) ![vite](https://img.shields.io/badge/Vite-8-646cff) ![pwa](https://img.shields.io/badge/PWA-installable-5a0fc8) ![desktop](https://img.shields.io/badge/Desktop-Tauri%202-ffc131)

## ✨ Features

- **Two flexible goal types**
  - **Habit** — recurring actions you check off. Add sub-tasks (e.g. *“Do 20 pushups”*)
    or keep it as a single one-tap *“Done today”* goal (e.g. *“Commit Daily to GitHub”*).
  - **Metric** — track a number toward a target (e.g. *80 → 75 kg*). Metric goals can
    also carry supporting daily habits.
- **Optional target dates** with live countdowns.
- **Progress rings & bars** that animate as you complete actions.
- **GitHub-style contribution heatmap** of the last year of activity per goal.
- **Projection chart** — least-squares trend of your progress, the projected outcome
  *if the current trend continues*, and the *pace required* to hit your target by its
  end date, with an **ahead / on-track / behind** verdict.
- **Dashboard analytics** — animated counters for active goals, best streak, weekly
  completion %, and goals on track, plus a 30-day activity graph.
- **Streaks & confetti** to keep momentum fun.
- **Responsive** — desktop sidebar, mobile bottom nav. **Installable PWA**, works offline.
- **Native Windows app** — ships as a tiny (~3 MB) Tauri desktop build that reuses the
  system WebView2 runtime; same code, same local IndexedDB data.
- **Dark glass / gradient UI** with smooth Framer Motion animations.

## 🧱 Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Recharts ·
Zustand (persisted to IndexedDB) · React Router · date-fns · vite-plugin-pwa ·
Tauri 2 (Windows desktop wrapper).

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build + service worker
npm run preview  # preview the production build
```

On first run the app seeds three demo goals (matching the examples above) so the
UI feels alive. Delete them anytime — your data lives in IndexedDB on this device.

## 🖥️ Windows desktop app (Tauri)

GoalTracker can be packaged as a native Windows app via [Tauri 2](https://tauri.app).
It reuses the WebView2 runtime built into Windows 11, so the installer is only ~3 MB
(no bundled Chromium) and the app runs the exact same React UI with its own persistent
IndexedDB store.

**Prerequisites:** the [Rust toolchain](https://rustup.rs) and the MSVC C++ build tools
(Visual Studio "Desktop development with C++" workload). WebView2 ships with Windows 11.

```bash
npm run app:dev      # live-reload the app in a native window
npm run app:build    # produce a Windows installer
```

The installer is written to:

```
src-tauri/target/release/bundle/msi/GoalTracker_<version>_x64_en-US.msi
```

Install it and launch **GoalTracker** from the Start menu. The PWA service worker is
automatically omitted from the desktop build (it's only used for the web/PWA build).

## 📁 Structure

```
src/
  lib/          # pure logic: dates, progress, streaks, heatmap, projection, theme
  store/        # Zustand store (IndexedDB persist), selectors, hooks
  components/   # ui/ primitives, layout/, dashboard/, goal/, forms/
  pages/        # Dashboard, GoalsPage, GoalDetail
  types.ts      # data model
src-tauri/      # Tauri 2 desktop shell (config, icons, Rust entrypoint)
```

All progress, streak, heatmap and projection math lives in `src/lib/` and is fully
decoupled from the UI.
