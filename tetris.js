const tetrisBoard = document.querySelector('#tetris-board')

if (tetrisBoard) {
  const canvas = document.querySelector('#tetris-canvas')
  const context = canvas.getContext('2d')
  const scoreElement = document.querySelector('#tetris-score')
  const highScoreElement = document.querySelector('#tetris-high-score')
  const statusElement = document.querySelector('#tetris-status')
  const gameOverElement = document.querySelector('#tetris-game-over')
  const finalScoreElement = document.querySelector('#tetris-final-score')
  const finalHighScoreElement = document.querySelector('#tetris-final-high-score')
  const startButton = document.querySelector('#tetris-start')
  const restartButton = document.querySelector('#tetris-restart')
  const highScoreKey = 'neon-tetris-high-score'
  const columns = 10
  const rows = 20
  const cellSize = 24
  const pieces = [
    { shape: [[1, 1, 1, 1]], color: '#18e7ff' },
    { shape: [[1, 1], [1, 1]], color: '#ffdd62' },
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#ff8a3d' },
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#4287ff' },
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#60ff9a' },
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff3cac' }
  ]
  let board
  let activePiece
  let score = 0
  let timer
  let running = false

  highScoreElement.textContent = String(Number.parseInt(localStorage.getItem(highScoreKey) || '0', 10)).padStart(5, '0')

  const updateScore = () => {
    scoreElement.textContent = String(score).padStart(5, '0')
  }

  const newBoard = () => Array.from({ length: rows }, () => Array(columns).fill(null))

  const createPiece = () => {
    const selected = pieces[Math.floor(Math.random() * pieces.length)]
    return {
      shape: selected.shape.map((line) => [...line]),
      color: selected.color,
      x: Math.floor((columns - selected.shape[0].length) / 2),
      y: 0
    }
  }

  const collides = (piece, offsetX = 0, offsetY = 0, shape = piece.shape) => shape.some((line, y) =>
    line.some((cell, x) => cell && (
      piece.x + x + offsetX < 0 ||
      piece.x + x + offsetX >= columns ||
      piece.y + y + offsetY >= rows ||
      (board[piece.y + y + offsetY] && board[piece.y + y + offsetY][piece.x + x + offsetX])
    ))
  )

  const drawCell = (x, y, color) => {
    context.fillStyle = color
    context.shadowColor = color
    context.shadowBlur = 10
    context.fillRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4)
    context.shadowBlur = 0
  }

  const draw = () => {
    context.fillStyle = '#090b18'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(24, 231, 255, 0.08)'
    for (let x = 0; x <= columns; x += 1) {
      context.beginPath()
      context.moveTo(x * cellSize, 0)
      context.lineTo(x * cellSize, canvas.height)
      context.stroke()
    }
    for (let y = 0; y <= rows; y += 1) {
      context.beginPath()
      context.moveTo(0, y * cellSize)
      context.lineTo(canvas.width, y * cellSize)
      context.stroke()
    }
    board.forEach((line, y) => line.forEach((color, x) => {
      if (color) drawCell(x, y, color)
    }))
    activePiece.shape.forEach((line, y) => line.forEach((cell, x) => {
      if (cell) drawCell(activePiece.x + x, activePiece.y + y, activePiece.color)
    }))
  }

  const rotate = (shape) => shape[0].map((_, index) => shape.map((line) => line[index]).reverse())

  const clearLines = () => {
    let lines = 0
    board = board.filter((line) => {
      if (line.every(Boolean)) {
        lines += 1
        return false
      }
      return true
    })
    while (board.length < rows) board.unshift(Array(columns).fill(null))
    score += [0, 100, 300, 500, 800][lines]
  }

  const lockPiece = () => {
    activePiece.shape.forEach((line, y) => line.forEach((cell, x) => {
      if (cell) board[activePiece.y + y][activePiece.x + x] = activePiece.color
    }))
    clearLines()
    updateScore()
    activePiece = createPiece()
    if (collides(activePiece)) endGame()
  }

  const drop = () => {
    if (!running) return
    if (!collides(activePiece, 0, 1)) activePiece.y += 1
    else lockPiece()
    draw()
  }

  const endGame = () => {
    running = false
    window.clearInterval(timer)
    const previousHighScore = Number.parseInt(localStorage.getItem(highScoreKey) || '0', 10)
    const bestScore = Math.max(score, previousHighScore)
    if (score > previousHighScore) localStorage.setItem(highScoreKey, String(score))
    highScoreElement.textContent = String(bestScore).padStart(5, '0')
    finalScoreElement.textContent = String(score).padStart(5, '0')
    finalHighScoreElement.textContent = String(bestScore).padStart(5, '0')
    statusElement.textContent = 'Partie terminée'
    gameOverElement.hidden = false
  }

  const startGame = () => {
    window.clearInterval(timer)
    board = newBoard()
    score = 0
    running = true
    gameOverElement.hidden = true
    statusElement.textContent = 'Empile les blocs et complète les lignes !'
    startButton.textContent = 'RECOMMENCER'
    activePiece = createPiece()
    updateScore()
    draw()
    timer = window.setInterval(drop, 650)
  }

  const handleKey = (event) => {
    if (!running) return
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key)) event.preventDefault()
    if (event.key === 'ArrowLeft' && !collides(activePiece, -1, 0)) activePiece.x -= 1
    if (event.key === 'ArrowRight' && !collides(activePiece, 1, 0)) activePiece.x += 1
    if (event.key === 'ArrowDown') drop()
    if (event.key === ' ') {
      while (!collides(activePiece, 0, 1)) activePiece.y += 1
      drop()
    }
    if (event.key === 'ArrowUp') {
      const rotated = rotate(activePiece.shape)
      if (!collides(activePiece, 0, 0, rotated)) activePiece.shape = rotated
    }
    draw()
  }

  startButton.addEventListener('click', startGame)
  restartButton.addEventListener('click', startGame)
  document.addEventListener('keydown', handleKey)
}
