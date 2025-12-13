# Electromagnetic Waves & Speed of Light Visualization
# 電磁波與光速 - 3D 互動教學網頁

[English](#english) | [繁體中文](#繁體中文)

---

<div id="english">

## 📖 About
This interactive web project demonstrates **Maxwell's Equations** and the propagation of **Electromagnetic Waves** using 3D visualization. It helps students understand how oscillating electric and magnetic fields sustain each other and travel at the speed of light.

### 🌟 Features
- **3D Interactive Model**: Visualizes $\mathbf{E}$ (Electric) and $\mathbf{B}$ (Magnetic) fields in real-time.
- **Physics Simulation**: Correct phase relationship and propagation direction.
- **Controls**: Toggle fields, adjust animation speed, and interactive camera.
- **Responsive Design**: Works on desktop and mobile devices.

### 🚀 Usage
This project is static-site ready. You can host it on **GitHub Pages**.

1. **Calculations**: Uses real-time math to generate sine waves.
2. **Library**: Uses [Three.js](https://threejs.org/) via CDN (ES Modules).

</div>

---

<div id="繁體中文">

## 📖 關於專案
這是一個互動式教學網頁，旨在透過 3D 視覺化技術，展示 **馬克士威方程組** 與 **電磁波** 的傳播原理。幫助學生直觀理解變動的電場與磁場如何在空間中交互感應，並以光速傳播。

### 🌟 特色功能
- **3D 互動模型**：即時呈現電場（紅）與磁場（藍）的動態變化。
- **物理模擬**：精確展示波動的相位關係與傳播方向。
- **操作控制**：可開關個別場的顯示、調整波速，並支援自由旋轉縮放視角。
- **響應式設計**：適合電腦與行動裝置瀏覽。

### 🚀 如何使用
本專案為靜態網頁，完全支援 **GitHub Pages** 直接託管。

- **技術核心**：使用 [Three.js](https://threejs.org/) 進行 3D 渲染。
- **部屬方式**：將此儲存庫上傳至 GitHub，並在 Settings > Pages 中開啟 GitHub Pages 服務即可。

</div>

## 🛠️ Setup for Development
Using a local server is required due to CORS policies on ES Modules.

```bash
# Using Python
python -m http.server 8000

# OR using Node.js http-server
npx http-server
```
