# Bankroll - Poker Session Tracker

A mobile app built with React Native and Expo for tracking poker sessions, analyzing performance, and managing staking arrangements.

## Features

- Track poker sessions with buy-in, cash out, location, and duration
- View profit/loss charts and statistics
- Analyze performance by location
- View monthly summaries
- Manage staking arrangements
- Beautiful dark theme UI

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Studio (for Android development)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd bankroll
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Run on your device:

- Scan the QR code with the Expo Go app (Android)
- Press 'i' for iOS simulator
- Press 'a' for Android emulator

## Project Structure

```
bankroll/
├── src/
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   ├── types/          # TypeScript types and interfaces
│   └── utils/          # Utility functions
├── App.tsx            # Root component
└── package.json       # Dependencies and scripts
```

## Tech Stack

- React Native
- Expo
- React Navigation
- React Native Paper
- Victory Native (for charts)
- TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
