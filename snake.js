const snakeBoard = document.querySelector('#snake-board')
import { ajouterPoints } from "./logic/score.mjs";

if (snakeBoard) {
  const canvas = document.querySelector('#snake-canvas')
  const context = canvas.getContext('2d')
  const scoreElement = document.querySelector('#snake-score')
  const highScoreElement = document.querySelector('#snake-high-score')
  const statusElement = document.querySelector('#snake-status')
  const gameOverElement = document.querySelector('#snake-game-over')
  const finalScoreElement = document.querySelector('#snake-final-score')
  const finalHighScoreElement = document.querySelector('#snake-final-high-score')
  const startButton = document.querySelector('#snake-start')
  const restartButton = document.querySelector('#snake-restart')
  const highScoreKey = 'neon-snake-high-score'
  const cellSize = 20
  const boardSize = canvas.width / cellSize
  let snake
  let food
  let direction
  let nextDirection
  let score = 0
  let timer
  let running = false

  const savedHighScore = Number.parseInt(localStorage.getItem(highScoreKey) || '0', 10)
  highScoreElement.textContent = String(savedHighScore).padStart(5, '0')

  const updateScore = () => {
    scoreElement.textContent = String(score).padStart(5, '0')
  }

  const placeFood = () => {
    do {
      food = {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize)
      }
    } while (snake.some((part) => part.x === food.x && part.y === food.y))
  }

  const draw = () => {
    context.fillStyle = '#090b18'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(24, 231, 255, 0.08)'
    for (let index = 0; index <= boardSize; index += 1) {
      context.beginPath()
      context.moveTo(index * cellSize, 0)
      context.lineTo(index * cellSize, canvas.height)
      context.moveTo(0, index * cellSize)
      context.lineTo(canvas.width, index * cellSize)
      context.stroke()
    }
    context.fillStyle = '#ff3cac'
    context.shadowColor = '#ff3cac'
    context.shadowBlur = 14
    context.fillRect(food.x * cellSize + 3, food.y * cellSize + 3, cellSize - 6, cellSize - 6)
    context.shadowBlur = 0
    snake.forEach((part, index) => {
      context.fillStyle = index === 0 ? '#18e7ff' : '#a855f7'
      context.shadowColor = context.fillStyle
      context.shadowBlur = 10
      context.fillRect(part.x * cellSize + 2, part.y * cellSize + 2, cellSize - 4, cellSize - 4)
    })
    context.shadowBlur = 0
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

  const tick = () => {
    direction = nextDirection
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y }
    const hitWall = head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize
    const hitSnake = snake.some((part) => part.x === head.x && part.y === head.y)
    if (hitWall || hitSnake) {
      endGame()
      return
    }
    snake.unshift(head)
    if (head.x === food.x && head.y === food.y) {
      score += ajouterPoints(score);
      updateScore()
      placeFood()
    } else {
      snake.pop()
    }
    draw()
  }

  const startGame = () => {
    window.clearInterval(timer)
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    direction = { x: 1, y: 0 }
    nextDirection = { x: 1, y: 0 }
    score = 0
    running = true
    gameOverElement.hidden = true
    statusElement.textContent = 'Mange les pixels roses !'
    startButton.textContent = 'RECOMMENCER'
    updateScore()
    placeFood()
    draw()
    timer = window.setInterval(tick, 220)
  }

  const changeDirection = (event) => {
    const directions = {
      ArrowUp: { x: 0, y: -1 }, z: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, q: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
    }
    const selected = directions[event.key]
    if (!selected || !running || selected.x === -direction.x && selected.y === -direction.y) return
    event.preventDefault()
    nextDirection = selected
  }

  startButton.addEventListener('click', startGame)
  restartButton.addEventListener('click', startGame)
  document.addEventListener('keydown', changeDirection)
}
