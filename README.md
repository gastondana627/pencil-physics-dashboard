
---

# Pencil Physics Dashboard (VS Code Extension)

A custom VS Code extension providing a native, real-time metrics dashboard for the **Pencil Physics** mechanical constraint pipeline.

---

## 🚀 Features

* **Live Telemetry Monitoring:** Automatically watches `telemetry_calendar.json` and local benchmark result files for updates.
* **Native Integration:** Renders a clean, integrated leaderboard directly inside your IDE.
* **Diagnostics:** Visual indicators for pipeline status, file path detection, and evaluation metrics.

---

## ⚙️ How to Run

This is an extension development project. To view the dashboard locally:

1. **Open** this workspace in VS Code.
2. **Launch:** Press `F5` to start the **Extension Development Host**.
3. **Command:** In the new window, press `Cmd + Shift + P` (or `Ctrl + Shift + P` on Windows).
4. **Action:** Type `Pencil Physics: Open Metric Panel` and select it.

---

## 🏗️ System Architecture

* **Data Source:** Reads telemetry from `telemetry_calendar.json` (project root) and `.run.json` files in the `benchmark-results` directory.
* **Renderer:** Uses the VS Code `WebviewPanel` API to generate the leaderboard UI.
* **Watcher:** Utilizes `vscode.workspace.createFileSystemWatcher` for instant updates when the background `auto_sync.sh` daemon modifies data files.

---

## 💻 Development

| Task | Location / Command |
| --- | --- |
| **UI/HTML** | Edit `getWebviewContent` in `src/extension.ts` |
| **Commands** | Defined in `package.json` under `contributes.commands` |
| **Compilation** | `npm run watch` (TSC compiler) |

---

*Created for the Pencil Physics Mechanical Constraint Test.*