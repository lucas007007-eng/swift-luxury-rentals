# Berlin Luxe Rentals - Desktop Transfer Guide

## 🚀 Simple Transfer Method

### Step 1: Copy the Folder
1. Copy the entire `berlinluxerentals` folder from your laptop
2. Transfer via:
   - **USB Drive** (fastest)
   - **OneDrive/Google Drive** (if synced)
   - **Network share** (if on same network)
   - **Email zip file** (if small enough)

### Step 2: Place on Desktop
Put the folder anywhere you want, for example:
- `C:\Users\YourName\Desktop\berlinluxerentals`
- `C:\Users\YourName\Documents\Projects\berlinluxerentals`

### Step 3: Run Setup (One-time only)
1. **Right-click** on `DESKTOP_SETUP.bat`
2. **Select "Run as Administrator"** (important!)
3. The script will:
   ✅ Check if Node.js is installed
   ✅ Install all dependencies (`npm install`)
   ✅ Create a desktop-specific start script
   ✅ Test everything works

**NOTE:** The existing `start-server.bat` and `start-server.ps1` files are now **PORTABLE** and will work from any location! They auto-detect their directory.

### Step 4: Start Working
1. **Double-click** `start-server-desktop.bat` to start server
2. **Open** the folder in Cursor AI
3. **Access** your site at `http://localhost:3002`

---

## 📋 What Gets Transferred:

### ✅ Copy These:
- All source code (`src/` folder)
- Images and assets (`public/` folder)  
- Configuration files (`package.json`, `next.config.js`, etc.)
- Your custom scripts (`start-server.bat`, etc.)
- **NEW:** `DESKTOP_SETUP.bat` (setup script)

### ❌ Don't Copy These (Will be recreated):
- `node_modules/` (too large - setup script recreates this)
- `.next/` (build cache)

---

## 🔧 If Node.js isn't installed on desktop:

1. Go to: https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Install with default options
4. Restart your computer
5. Run the setup script again

---

## 🎯 After Transfer - Tell Cursor AI:

Just say: **"start server"** and I'll automatically use the desktop batch file!

The setup script creates `start-server-desktop.bat` that works with your desktop paths.

