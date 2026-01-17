# LokNet

> "LokNet is a Chromium-based browser distribution, not a new browser engine. Its goal is resilience, openness, and user control."

LokNet is a people-first, open, resilient web browser designed to remain usable, forkable, and maintainable even during geopolitical, platform, or vendor-level disruptions.

## Project Vision
- **Sovereignty**: Does not depend on mandatory accounts or foreign cloud services.
- **Privacy**: No telemetry, no tracking, strict defaults.
- **Performance**: Optimized for low-resource hardware.

## Build Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To start the browser in development mode:
```bash
npm run dev
```

### Building for Production
To create a distributable installer/executable:
```bash
npm run build
```

## Architecture
LokNet is built on **Electron**, leveraging the **Chromium** rendering engine. It uses a custom Main Process orchestrator to manage `WebContentsView` instances, providing a tabbed browsing experience without the bloat of standard Chrome configurations.
