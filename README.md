# LokNet

<p align="center">
  <img src="./public/brand.png" alt="LokNet Logo" width="160"/>
</p>

> **LokNet is a Chromium-based browser distribution, not a new browser engine.**  
> It exists to ensure resilience, openness, and user control over the web.

---

## Why LokNet Exists

The modern web depends heavily on a small number of platforms, vendors, and cloud services.  
When access to those platforms is disrupted—by policy, geopolitics, or commercial decisions—users and institutions are left with few real alternatives.

**LokNet exists to reduce that fragility.**

It is designed as a calm, reliable, and forkable browser base that can continue to function independently of mandatory accounts, proprietary cloud services, or centralized control.

LokNet is not built for hype.  
It is built for **longevity**.

---

## Design Principles

### 🧭 Openness
- Fully open source
- Clear build instructions
- Designed to be forked, modified, and redistributed

### 🔐 User Control
- No mandatory accounts
- No hidden telemetry
- No silent data collection
- Clear, visible privacy defaults

### 🧱 Resilience
- No hard dependency on a single vendor or platform
- Offline-installable
- Capable of surviving platform-level disruptions

### ⚙️ Practical Performance
- Optimized for low-RAM and older machines
- Minimal background processes
- Lightweight UI with no unnecessary animations

### 🧘 Calm by Default
- No feeds, noise, or attention-hijacking UI
- The browser stays out of the way and lets users work

---

## What LokNet Is (and Is Not)

**LokNet is:**
- A Chromium-based desktop web browser
- A privacy-first browser distribution
- A stable base for long-term community ownership

**LokNet is not:**
- A new browser engine
- A replacement for Chromium itself
- A political or ideological statement
- A data-driven or ad-driven product

---

## Core Features (v0.1)

- Chromium rendering engine (via Electron)
- Tabbed browsing with memory-conscious tab management
- Built-in tracker blocking (lightweight, transparent)
- Google Safe Browsing disabled by default
- No telemetry or analytics
- DuckDuckGo as the default search (replaceable)
- Built-in PDF viewer
- Reader-friendly, distraction-free UI
- Local JSON-based storage for history and bookmarks

---

## Architecture Overview

LokNet is built using:

- **Electron** (desktop shell)
- **Chromium** (rendering engine)
- **WebContentsView** for tab isolation and performance
- **React + Vite** for a lightweight, modern UI layer

Key architectural components:

- **Main Process** – window lifecycle, security, and privacy enforcement  
- **ViewManager** – tab orchestration, creation, destruction, and resource cleanup  
- **Renderer** – browser chrome UI (tabs, address bar)  
- **Store** – local JSON persistence for transparency and portability  

---

## 🛠️ How to Run (from GitHub)

If you have downloaded this project from GitHub, follow these steps to get it running on your local machine.

### 1. Prerequisites (Required Software)
You need to have these installed on your computer:
*   **Node.js** (Version 18 or higher): [Download Here](https://nodejs.org/)
*   **Git**: [Download Here](https://git-scm.com/)

### 2. Setup
Open your terminal (Command Prompt, PowerShell, or VS Code Terminal) and run:

```bash
# 1. Clone the repository (download the code)
git clone https://github.com/YOUR_USERNAME/LokNet.git
cd LokNet

# 2. Install dependencies (libraries needed to run)
npm install
```

### 3. Run the App
To start the browser in development mode:
```bash
npm run dev
```

### 4. Create an Installer (Optional)
To build a standalone `.exe` installer for Windows:
```bash
npm run build
```
The installer will be generated in the `dist` or `release` folder.

---

## Community & Governance

LokNet is designed to outlive any single maintainer.

Anyone is free to:
- Fork the project
- Maintain their own distribution
- Adapt LokNet for institutional or regional use

No central authority is required for LokNet to continue existing.

---

## License

LokNet is released under an open-source license.  
See the `LICENSE` file for details.

---

## Closing Note

LokNet is intentionally quiet software.

It does not seek attention.  
It seeks **reliability**.

If the web becomes harder to access,  
LokNet should still open.
