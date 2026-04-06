# 🌿 Potea - Premium Plant Shopping App

**Potea** is a high-fidelity, premium mobile application built with React Native and Expo. It offers a seamless and aesthetically pleasing experience for plant enthusiasts to browse, buy, and manage their indoor and outdoor greenery.

---

## ✨ Key Features

- **🌱 My Garden**: Track your personal indoor plant collection and their ongoing care.
- **🔐 Secure Authentication**: Real authentication with Firebase, including Google Sign-In.
- **💳 Stripe Payments & Subscriptions**: Secure checkout for orders and premium tier subscriptions.
- **🤝 Community Forum**: Dedicated space to connect with other plant enthusiasts and share tips.
- **🏆 Loyalty Program**: Earn points on purchases and redeem them for rewards.
- **🛒 Seamless Shopping**: Browse an expanded catalog of 50+ plants with detailed metadata, reviews, and ratings.
- **💳 My E-Wallet**: A complete financial hub with top-up flows, transaction history, and digital e-receipts.
- **📍 Smart Shipping**: Advanced address management with location previews and default settings.
- **🛠️ Rich Profiles**: Comprehensive profile editing, notification preferences, and security settings.

---

## 🚀 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Authentication**: Firebase Auth (Email/Password & Google Sign-In)
- **Database / Backend**: Firebase Firestore
- **Payments**: Stripe (Stripe React Native & Checkout)
- **Icons**: [Ionicons](https://ionic.io/icons) via `@expo/vector-icons`
- **State Management**: React Hooks & Zustand
- **Typography**: Custom premium styles

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go app on your mobile device (to preview)

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Mdakszin/Potea.git
   cd potea
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Copy the example file and fill in your keys:

   ```bash
   cp .env.example .env
   ```

4. **Start the project**:

   ```bash
   npx expo start
   ```

---

## 📂 Project Structure

- `app/`: Expo Router file-based route definitions (screens and layout)
- `src/components`: Reusable UI components (Buttons, TextFields, Cards, etc.)
- `src/services`: API and Backend integration (Firebase, Stripe, etc.)
- `src/store`: Global state management (Zustand)
- `src/constants`: Theme, data, and global constants
- `src/config`: Integration and third-party configuration

---

## 📝 License

This project is for demonstration and portfolio purposes.

---
*Created with ❤️ by Odwa Tervin Mdanyana*
