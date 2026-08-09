# Sudoku Game 🎮

A modern, interactive Sudoku game built with **Next.js, TypeScript, and Tailwind CSS**.

The game includes multiple difficulty levels, mistake tracking, a timer, keyboard controls, pause/resume, and win/game-over popups.

## ✨ Features

* 🧩 Sudoku puzzle generation
* 🎯 Easy, Medium, and Hard difficulty levels
* ⏱️ Game timer
* ❌ Mistake tracking
* 🚫 Game ends after 4 mistakes
* 🎉 Congratulations popup when the puzzle is solved
* 😔 Game Over popup after 4 mistakes
* ⌨️ Keyboard controls

  * `1–9` → Enter numbers
  * `Arrow Keys` → Move between cells
  * `Delete` / `Backspace` → Clear a cell
* ⏸️ Pause and Resume
* 🔄 New Game
* 🎨 Responsive UI
* 📱 Works on desktop and mobile

## 🛠️ Technologies

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **JavaScript / HTML / CSS**

## 📁 Project Structure

```text
sudoku-game/
├── app/
│   ├── lib/
│   │   └── sudoku.ts
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── public/
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🧠 Game Logic

The Sudoku logic is handled in:

```text
app/lib/sudoku.ts
```

It contains the core functions used to:

* Generate Sudoku puzzles
* Validate Sudoku moves
* Check whether the board is complete
* Generate solutions
* Control puzzle difficulty

The board uses a `9 × 9` grid.

Empty cells are represented by:

```text
0
```

## 🎮 How the Game Works

### Starting a Game

When the application starts, a Medium Sudoku puzzle is generated automatically.

The player can change the difficulty using:

* Easy
* Medium
* Hard

### Entering Numbers

The player selects an empty cell and enters a number using either:

* The on-screen number pad
* Keyboard numbers `1–9`

### Wrong Answers

If the entered number is incorrect:

* The cell briefly turns red.
* A `❌ Wrong number!` message appears.
* The mistake counter increases.

The player is allowed **3 mistakes**.

The **4th mistake ends the game**.

### Completing the Puzzle

When every cell is correctly filled:

```text
🎉 Congratulations!
```

appears in a popup with the player's completion time.

### Game Over

After the 4th mistake:

```text
😔 Game Over
```

appears and the current game stops.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/sudoku-game.git
```

### 2. Enter the project

```bash
cd sudoku-game
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Go to:

```text
http://localhost:3000
```

## 📜 Available Scripts

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Run ESLint:

```bash
npm run lint
```

## 🔮 Future Improvements

Possible future features:

* 🏆 Leaderboard
* 👤 User accounts
* 💾 Save game progress
* 📊 Statistics
* 🔥 Daily Sudoku
* 🌙 Dark mode
* 🎵 Sound effects
* 🏅 Achievements
* 💡 Sudoku hints
* 🧠 Sudoku solver
* 📅 Daily challenges
* 🌍 Online multiplayer
* 📱 PWA / installable mobile version

## 📄 License

This project is currently for learning and development purposes.

```

**One thing to change:** replace `YOUR_USERNAME` in the clone URL with your actual new GitHub username before pushing the README.
```
