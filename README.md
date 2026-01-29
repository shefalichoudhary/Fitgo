## Fitgo – Mobile App (iOS & Android)

Fitgo is a cross-platform mobile application built using Expo + React Native (Ignite).
The app supports iOS and Android and uses modern OTA (over-the-air) updates for fast delivery of fixes and improvements.

📱 Platforms Supported

iOS (Simulator & Physical Devices)

Android (Emulator & Physical Devices)

🚀 Quick Start (For Running the App)

This project uses Expo Development Builds.
⚠️ Expo Go is NOT used.

## ✅ Requirements

General

Node.js (LTS)

npm

Git

iOS (macOS only)

Xcode

iOS Simulator

Android

Android Studio

Android SDK

## Android Emulator or physical device

📦 Install Dependencies
npm install --legacy-peer-deps

🧱 Install the App (One-Time)

A development build must be installed once per device.

iOS
npm run build:ios:sim # iOS Simulator
npm run build:ios:device # Physical iPhone

Android
npm run build:android:sim # Android Emulator
npm run build:android:device # Physical Android device

## ▶️ Start the App

npx expo start --dev-client

Press i for iOS

Press a for Android

Or open the app directly on the device

## 🔄 App Updates (Automatic)

The app supports instant updates without reinstalling.

Updates are checked when the app opens

Bug fixes and UI changes are delivered automatically

No manual update action is required

⚠️ Developers should NOT run eas update manually
Updates are handled automatically via GitHub Actions.

## 🚀 Production Builds (App Store / Play Store)

npm run build:ios:prod
npm run build:android:prod

These builds are:

App Store ready

Play Store ready

Stable production versions

📦 App Details

App Name: Fitgo

iOS Bundle ID: com.fitgo

Android Package: com.fitgo

Runtime Version: fitgo-runtime-v1

JS Engine: Hermes

New Architecture: Enabled

## 👩‍💻 For New Developers (Important)

If you are cloning or forking this repository, you must create your own Expo / EAS project.

You cannot use the existing builds or Expo project.

❓ Why is this required?

Expo projects are linked to one Expo account

Builds, updates, and credentials cannot be shared

Each developer must use their own EAS project

🧱 One-Time Setup for New Developers

## 1️⃣ Login to Expo

npx expo login

## 2️⃣ Initialize Your Own EAS Project

npx eas init

This will:

Create a new Expo project

Generate a new EAS Project ID

Link the app to your Expo account

## 3️⃣ Update app.json

Replace the existing project ID with your own:

"extra": {
"eas": {
"projectId": "YOUR_OWN_PROJECT_ID"
}
}

⚠️ Do NOT commit your personal projectId back to the main repository

## 4️⃣ Create Your Own Development Builds

npm run build:ios:sim
npm run build:android:sim

## 5️⃣ Start the App

npx expo start --dev-client

⚠️ Important Notes

Rebuild is required when:

Native libraries change

Expo plugins change

App configuration changes

JavaScript-only changes are delivered instantly via OTA updates

Each developer manages their own builds

## 🤝 Community & Resources

⭐️ Help us out by [starring on GitHub](https://github.com/infinitered/ignite), filing bug reports in [issues](https://github.com/infinitered/ignite/issues) or [ask questions](https://github.com/infinitered/ignite/discussions).

💬 Join us on [Slack](https://join.slack.com/t/infiniteredcommunity/shared_invite/zt-1f137np4h-zPTq_CbaRFUOR_glUFs2UA) to discuss.

📰 Make our Editor-in-chief happy by [reading the React Native Newsletter](https://reactnativenewsletter.com/).
