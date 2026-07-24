# ⏱️ Micro-Timegrapher Studio Pro v1.0

![GitHub stars](https://img.shields.io/github/stars/valliente/micro-timegrapher?style=for-the-badge&color=00F5D4)
![GitHub releases](https://img.shields.io/github/v/release/valliente/micro-timegrapher?style=for-the-badge&color=9D4EDD)
![License](https://img.shields.io/github/license/valliente/micro-timegrapher?style=for-the-badge&color=3B82F6)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Web%20%7C%20PWA-00F5D4?style=for-the-badge)

> **Enterprise Acoustic Mechanical Watch Diagnostic Workstation & Signal Autocorrelation Engine**

[**🚀 Launch Live Web App**](https://valliente.github.io/micro-timegrapher/) • [**📥 Download Windows Executable**](https://github.com/valliente/micro-timegrapher/releases/tag/v1.0.0) • [**📖 Documentation**](#-key-features)

---

## 🌟 Overview

**Micro-Timegrapher Studio Pro** is an open-source, high-precision acoustic watch diagnostic platform. It listens to mechanical watch escapement ticks through any microphone or piezo pickup, computes real-time chronometric metrics via Web Audio autocorrelation DSP, and renders dual-mode CRT oscilloscope waveform and paper-tape dot drift visualizers.

Strictly adhering to professional horological standards, it calculates **Rate Drift ($s/day$)**, **Beat Error ($ms$)**, and **Balance Wheel Amplitude ($\text{degrees}$)** using custom lift-angle algorithms ($44^\circ - 58^\circ$).

---

## ✨ Key Features

- **⚡ WASM & Web Audio DSP Engine**: High-sample-rate signal processing (48kHz–96kHz) with dual-stage Biquad High-Pass and Low-Pass filters (2kHz–7kHz) targeting ruby jewel strikes.
- **📈 Dual-Mode CRT Visualizers**: Phosphor-fade WebGL/Canvas renderer supporting paper-tape dot drift diagrams and high-speed audio waveform oscilloscopes.
- **🎯 6-Positional Stability Suite & SVG Polar Radar Chart**: Full horological positional testing protocol (Dial Up, Dial Down, Crown Down, Crown Up, Crown Left, Crown Right) with interactive polar radar plots and positional delta calculations ($\Delta R_{max}$, $\Delta A_{max}$).
- **💾 10-Second Raw WAV Telemetry Archiving**: Record 10-second raw `.wav` audio clips of escapement ticks and archive them inside local IndexedDB alongside movement specifications (ETA 2824-2, Rolex 3135, Omega 8800, Grand Seiko 9S85).
- **📄 Client PDF Certificate Generator**: Generate printable chronometric service certificates with client details, movement metadata, positional breakdown matrices, and technician signatures.
- **🛡️ Zero-AV False Positive Architecture**: Provided as an offline Progressive Web App (PWA), single-click `run_app.bat` runner, and standalone executable binary `MicroTimegrapherPro-Setup-1.0.0.exe`.

---

## 🎨 UI/UX Design System

Adhering to dark dashboard design standards:
- **Primary Accent**: Mint Cyan (`#00F5D4`)
- **Secondary Accent**: Deep Purple (`#9D4EDD`)
- **Background**: Deep Charcoal Black (`#0B0C10` / `#14161E`)
- **PRO Badge**: Glowing Blue (`#3B82F6`)

---

## 🚀 Quick Start & Installation

### Option 1: Standalone Runner (No Setup Required)
1. Download the latest release from the [Releases Page](https://github.com/valliente/micro-timegrapher/releases/tag/v1.0.0).
2. Double-click `run_app.bat` or launch `start.html` directly in your browser.

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/valliente/micro-timegrapher.git
cd micro-timegrapher

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle & standalone executable
npm run build:exe
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Feel free to check the [issues page](https://github.com/valliente/micro-timegrapher/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
