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

### `scale` (number)

Override the game's default scale in multiples of `1`.  Values less(greater) than `1` will result in a smaller(larger) width and height of the game grid.  Default scale (`1`) renders each cell in the game grid as `30px` x `30px`.

---

## Methods

### `newGame(): void`

Resets the current game using existing values of `width`, `height` and (optionally) `mines`.
