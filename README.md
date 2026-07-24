# Micro-Timegrapher Pro ⏱️⚡

> **Enterprise Acoustic Mechanical Watch Diagnostic Suite & Chronometric Calibration Platform**

Micro-Timegrapher Pro is a complete, scaled chronometric diagnostic engine and watchmaker dashboard. Designed for professional watchmakers, horologists, and collectors, it features a dual-sidebar interface inspired by modern laboratory instruments, multi-microphone profile calibration, multi-stage parametric DSP filtering, IndexedDB session storage, 6-positional stability testing, PDF report generation, and Stratum-1 NTP time synchronization.

---

## 🌟 The Pro Feature Suite

1. **Hard Design Alignment (Pro Dashboard Theme)**
   - Dual-sidebar architecture: Primary navigation sidebar + Center workspace + Right contextual inspector panel.
   - Charcoal black background (`#0d0f14`), slate modules (`#161a23`), Electric Cyan/Green accents (`#00F5D4`), Vibrant Purple accents (`#9D4EDD`), and glowing blue "PRO" badge (`#3B82F6`).

2. **Multi-Microphone Calibration Profiles**
   - Manage input gain, acoustic bandpass cutoffs, and noise floor threshold profiles for Laptop Mics, Clip-On Piezo Sensors, Studio Shotguns, and USB Audio Interfaces.

3. **Multi-Stage Parametric DSP Chain Engine**
   - Visual Parametric EQ curve canvas targeting ruby jewel impact harmonics (~2.8 kHz unlock, ~4.2 kHz impulse pin, ~5.5 kHz drop impact).
   - High-Pass & Low-Pass Cutoff controls, input gain boost multiplier, and auto noise floor calibration.

4. **IndexedDB Session Database & Side-by-Side Compare**
   - Store complete diagnostic runs (Rate Drift $s/d$, Beat Error $ms$, Amplitude $^\circ$, VPH, positional logs) locally with watch make, model, caliber, and service tags.
   - Side-by-side session comparison tool to evaluate performance pre-service vs post-service.

5. **6-Positional Stability Testing Module**
   - Full 6-position watch testing protocol (DU, DD, CD, CU, CL, CR) with position timer, automated data logging, and positional variance ($\Delta Rate$, $\Delta Amplitude$) calculations.

6. **Advanced PDF Service Report Generator**
   - Compile watch sessions into formatted PDF Service Certificates with client details, positional matrices, and technician signature block.

7. **Stratum-1 NTP Network Time Reference Module**
   - Synchronize system clock with Stratum-1 atomic time servers for high-precision time reference during testing.

---

## 🚀 Quick Start & Build Commands

```bash
# Navigate to project root
cd H:\antigravity

# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Compile production bundle and standalone executable
npm run build:exe
```

---

## 📜 License

MIT License. Built with Google Antigravity Agentic AI.
