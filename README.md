# minesweeper-game

The popular game 'minesweeper' made available as a custom element.

## Installation

```bash
yarn add @bgoodman/minesweeper-game

npm install @bgoodman/minesweeper-game
```

## Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>Minesweeper</title>
    <script type="module" src="./dist/index.js"></script>
</head>

<body>

    <minesweeper-game width=5 height=10></minesweeper-game>

</body>

</html>
```

## Attributes

### `width` (number)

The width (in cells) of the game grid.

### `height` (number)

The height (in cells) of the game grid.

### `mines` (number)

Override the default amount of mines placed in the game.  Otherwise calculated as `Math.floor(Math.sqrt(height * width))`.

---

## Methods

### `newGame(): void`

Resets the current game using existing values of `width`, `height` and (optionally) `mines`.
