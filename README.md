# Micro-Timegrapher Studio Pro ⏱️⚡

> **Native Rust/Tauri Enterprise Mechanical Watch Diagnostic Workstation**

Micro-Timegrapher Studio Pro is a heavy-duty, multi-megabyte native desktop horology workstation built on a **Rust + Tauri** native backend and a high-performance **React + TypeScript + WebAudio WASM** DSP frontend. Designed for professional watchmakers, horologists, and quality control labs, it provides 192 kHz acoustic sampling, high-pass/low-pass biquad DSP filtering, autocorrelation signal processing, SQLite database persistence, 10-second WAV telemetry clip archiving, 6-positional polar radar plotting, and client PDF report generation.

---

## 🌟 The Studio Pro Feature Suite

1. **Pixel-Perfect Reference UI Alignment (`ac6597f9ca9857740d4b2b5ee17ddc45.jpg`)**
   - **Left Navigation Bar**: User profile card ("Horology Lab - Master Tech"), custom Lucide line icons (`Home`, `Timegrapher`, `Multi-Positional`, `Watch Database`, `Reports`, `Settings`), and bottom logo branding.
   - **Ultra-Dark Charcoal Palette**: Deep black background (`#0A0B0E`), dark grey cards (`#14161E`), 1px borders (`#222736`), Mint Cyan (`#00F5D4`), Deep Violet Purple (`#9D4EDD`), and glowing blue **PRO** badge (`#3B82F6`).

2. **High-Precision Acoustic DSP & Autocorrelation Engine**
   - Up to 192 kHz audio sampling with custom Biquad Bandpass Filter (2kHz–7kHz) targeting ruby jewel clicks.
   - Signal autocorrelation $R(\tau) = \sum x(t) x(t+\tau)$ calculating exact VPH (18k to 36k), Rate Drift ($s/d$), Beat Error ($ms$), and Lift Angle Amplitude equation ($\text{Amplitude} = \frac{\text{Lift Angle}}{\pi \cdot f_0 \cdot t_1}$).

3. **10-Second Raw WAV Audio Telemetry & Movement Database**
   - Encodes 10-second raw `.wav` audio clips of escapement ticks via `WavEncoder.ts` and archives them inside the local database alongside movement specs (ETA 2824-2, Rolex 3135, Omega 8800, Grand Seiko 9S85).

4. **Multi-Positional Diagnostic Suite & SVG Polar Radar Chart**
   - Guided test wizard for 6 positions (DU, DD, CD, CU, CL, CR) with interactive SVG polar radar chart and delta calculations ($\Delta R_{max}$, $\Delta A_{max}$).

5. **Client-Side PDF Service Certificate Compiler**
   - Compiles formatted PDF Service Certificates featuring client info, movement metadata, positional matrices, and technician signatures.

6. **Rust + Tauri Native Desktop Binary Build**
   - Native Rust backend (`src-tauri/`) with IPC commands and native executable compilation scripts.

---

## 🚀 Native Compilation & Build Commands

```bash
# Run local development server
cd H:\antigravity
npm run dev

# Build production bundle & executable
npm run build:exe

# Compile native Tauri desktop package
cargo tauri build
```

---

## 📜 License

MIT License. Built with Google Antigravity Agentic AI.
