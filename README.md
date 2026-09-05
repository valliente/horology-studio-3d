# Horology Studio 3D

[![Build & Release Engine](https://github.com/valliente/horology-studio-3d/actions/workflows/release.yml/badge.svg)](https://github.com/valliente/horology-studio-3d/actions/workflows/release.yml)
[![Release Tag](https://img.shields.io/github/v/release/valliente/horology-studio-3d?color=00E5FF&label=Release)](https://github.com/valliente/horology-studio-3d/releases/latest)
[![C++ Standard](https://img.shields.io/badge/C%2B%2B-20-blue.svg)](https://isocpp.org/)
[![Qt Version](https://img.shields.io/badge/Qt-6.8%2B-green.svg)](https://www.qt.io/)

**Horology Studio 3D** is a native C++20 / Qt 6 (Qt Quick 3D + QML) desktop customizer for 3D luxury watches. It features dynamic C++ texture mapping for custom watch dials, PBR sapphire crystal and steel materials, interactive 360° orbit viewport controls, and dynamic strap switching in a dark dashboard interface.

---

## Core Features

- **Native C++20 / Qt 6 Engine**: High-performance PBR shader pipeline rendered with `Qt Quick 3D`.
- **Dynamic Watch Dial Mapper**: Upload custom watch face images (`.jpg`, `.png`) to map graphics onto the 3D watch dial in real time via C++ (`DialController`).
- **3D Sapphire Crystal & Brushed Steel Case**: Multi-layered PBR materials including anti-reflective glass transparency and specular highlights.
- **Dark Dashboard Interface**: Low-latency dark slate theme (`#101115`) with sidebar navigation.
- **Strap Variant Selector**: Real-time switching between `Vintage Leather`, `NATO Fabric`, `Milanese Loop`, and `Rubber`.
- **Interactive Orbit Camera**: Smooth 360° mouse rotation, pan, and scroll-wheel zoom.
- **Automated CI/CD GitHub Release**: Automated MSVC compilation, `windeployqt` packaging, and release deployment on tag push (`v1.0.0`).

---

## Architecture & Project Layout

```
horology-studio-3d/
├── .github/workflows/release.yml  # GitHub Actions automated release pipeline
├── qml/
│   ├── main.qml                   # Main Viewport & Qt Quick 3D scene
│   ├── Sidebar.qml                # Dark sidebar navigation & dial file selector
│   └── StrapSelector.qml          # 3D strap selector overlay
├── src/
│   ├── main.cpp                   # Qt Application entry point
│   ├── DialController.h           # C++ dynamic texture mapper header
│   └── DialController.cpp         # C++ texture signal & file loader implementation
├── CMakeLists.txt                 # Qt6 Quick / Quick3D CMake build script
├── app.manifest                   # Windows High-DPI execution manifest
├── resource.rc                    # Executable PE metadata script
└── build_local.bat                # MSVC/Ninja local build script
```

---

## Building from Source

### Prerequisites
- Qt 6.8+ (with `Qt Quick 3D` module)
- C++20 compatible compiler (MSVC 2022 / GCC 12+ / Clang 15+)
- CMake 3.16+ & Ninja

### Local Compilation
Run the local build script:
```cmd
build_local.bat
```

Or manually with CMake:
```bash
mkdir build && cd build
cmake -G "Ninja" -DCMAKE_PREFIX_PATH="C:/Qt/6.8.0/msvc2022_64" ..
cmake --build . --config Release
./HorologyStudio3D.exe
```

---

## Releases

Pre-compiled Windows binaries (`HorologyStudio3D-Windows-x64.zip`) are available under [GitHub Releases](https://github.com/valliente/horology-studio-3d/releases).
