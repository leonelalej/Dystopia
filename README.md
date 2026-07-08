# Dystopia Bowling 3D 🎳

A premium, interactive 3D bowling animation web application built with React, Three.js, React Three Fiber, Framer Motion, and Tailwind CSS.

## Features
- **Stunning 3D Graphics**: Realistic bowling lane, pins, and ball animations.
- **Dynamic Physics & Interactivity**: Interactive rolling animations and strike effects.
- **Modern Responsive Design**: Beautiful glassmorphic UI, typography, and dark mode aesthetics.

## Local Development Setup

To run this project locally, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd bowling-animation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy the example environment file and update it if necessary:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   This will start the Vite dev server. Open the local address printed in the terminal (usually `http://localhost:5173`) in your browser.

### Share Local Server with Cloudflare Tunnel 🌐

To share your local development or preview server with others using a secure Cloudflare Tunnel:

1. **For the development server (`http://localhost:5173`)**:
   - Make sure your dev server is running: `npm run dev`
   - In a new terminal window, run:
     ```bash
     npm run tunnel
     ```
   
2. **For the production build preview (`http://localhost:4173`)**:
   - Build the application: `npm run build`
   - Start the preview server: `npm run preview`
   - In a new terminal window, run:
     ```bash
     npm run tunnel:preview
     ```

In both cases, `npx cloudflared` will spin up a secure, temporary Cloudflare Quick Tunnel and display the public URL (e.g., `https://random-name.trycloudflare.com`) in your console.

### Build for Production
To build the application for production deployment, run:
```bash
npm run build
```
The output will be generated in the `dist` directory.

