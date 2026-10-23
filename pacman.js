const canvas = document.querySelector('#maze-canvas')
const context = canvas.getContext('2d')
const scoreElement = document.querySelector('#maze-score')
const livesElement = document.querySelector('#maze-lives')
const statusElement = document.querySelector('#maze-status')
const startButton = document.querySelector('#maze-start')
const restartButton = document.querySelector('#maze-restart')
const overElement = document.querySelector('#maze-over')
const resultElement = document.querySelector('#maze-result')

const map = [
  '#####################',
  '#.........#.........#',
  '#.###.###.#.###.###.#',
  '#o###.###.#.###.###o#',
  '#...................#',
  '#.###.#.#######.#.###',
  '#.....#...###...#...#',
  '#####.###.###.###.###',
  '#.........   .......#',
  '#####.###.###.###.###',
  '#.....#...###...#...#',
  '#.###.#.#######.#.###',
  '#...................#',
  '#o###.###.#.###.###o#',
  '#.........#.........#',
  '#####################'
]
const tile = 20
const directions = {
  ArrowUp: { x: 0, y: -1 }, z: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, q: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }
}
let grid
let player
let enemies
let nextDirection
let score
let lives
let running
let timer

const isWall = (x, y) => !grid[y] || grid[y][x] === '#'
const canMove = (entity, direction) => !isWall(entity.x + direction.x, entity.y + direction.y)

const updateHud = () => {
  scoreElement.textContent = String(score).padStart(5, '0')
  livesElement.textContent = String(lives)
}

const draw = () => {
  context.fillStyle = '#070813'
  context.fillRect(0, 0, canvas.width, canvas.height)
  grid.forEach((line, y) => line.forEach((cell, x) => {
    if (cell === '#') {
      context.fillStyle = '#25236b'
      context.fillRect(x * tile, y * tile, tile, tile)
      context.strokeStyle = '#18e7ff'
      context.strokeRect(x * tile + 3, y * tile + 3, tile - 6, tile - 6)
    } else if (cell === '.' || cell === 'o') {
      context.fillStyle = cell === 'o' ? '#ffdd62' : '#f7f8ff'
      context.beginPath()
      context.arc(x * tile + tile / 2, y * tile + tile / 2, cell === 'o' ? 5 : 2, 0, Math.PI * 2)
      context.fill()
    }
  }))

  context.fillStyle = '#60ff9a'
  context.beginPath()
  context.arc(player.x * tile + 10, player.y * tile + 10, 8, 0, Math.PI * 2)
  context.fill()
  enemies.forEach((enemy) => {
    context.fillStyle = enemy.color
    context.beginPath()
    context.arc(enemy.x * tile + 10, enemy.y * tile + 10, 8, 0, Math.PI * 2)
    context.fill()
  })
}

const resetPositions = () => {
  player = { x: 1, y: 1 }
  enemies = [
    { x: 19, y: 1, color: '#ff3cac', direction: { x: -1, y: 0 } },
    { x: 19, y: 14, color: '#a855f7', direction: { x: -1, y: 0 } },
    { x: 1, y: 14, color: '#ff8a3d', direction: { x: 1, y: 0 } }
  ]
  nextDirection = { x: 0, y: 0 }
}

const endGame = (won) => {
  running = false
  window.clearInterval(timer)
  resultElement.textContent = won ? 'LABYRINTHE TERMINÉ !' : 'GAME OVER'
  statusElement.textContent = won ? 'Tous les points sont récupérés !' : 'Les chasseurs t’ont attrapé.'
  overElement.hidden = false
}

const loseLife = () => {
  lives -= 1
  if (lives <= 0) {
    endGame(false)
  } else {
    resetPositions()
    statusElement.textContent = 'Attention aux chasseurs !'
    updateHud()
  }
}

const moveEnemy = (enemy) => {
  const choices = Object.values(directions).filter((direction) => canMove(enemy, direction))
  if (!canMove(enemy, enemy.direction) || Math.random() < 0.25) {
    enemy.direction = choices[Math.floor(Math.random() * choices.length)] || enemy.direction
  }
  if (canMove(enemy, enemy.direction)) {
    enemy.x += enemy.direction.x
    enemy.y += enemy.direction.y
  }
}

const tick = () => {
  if (!running) return
  if (canMove(player, nextDirection)) {
    player.x += nextDirection.x
    player.y += nextDirection.y
  }
  const cell = grid[player.y][player.x]
  if (cell === '.' || cell === 'o') {
    score += cell === 'o' ? 50 : 10
    grid[player.y][player.x] = ' '
  }
  enemies.forEach(moveEnemy)
  if (enemies.some((enemy) => enemy.x === player.x && enemy.y === player.y)) loseLife()
  if (!grid.some((line) => line.includes('.') || line.includes('o'))) endGame(true)
  updateHud()
  draw()
}

const startGame = () => {
  window.clearInterval(timer)
  grid = map.map((line) => line.split(''))
  score = 0
  lives = 3
  running = true
  overElement.hidden = true
  statusElement.textContent = 'Récupère tous les points !'
  startButton.textContent = 'RECOMMENCER'
  resetPositions()
  updateHud()
  draw()
  timer = window.setInterval(tick, 180)
}

window.addEventListener('keydown', (event) => {
  const direction = directions[event.key]
  if (!direction) return
  event.preventDefault()
  nextDirection = direction
})
startButton.addEventListener('click', startGame)
restartButton.addEventListener('click', startGame)
grid = map.map((line) => line.split(''))
resetPositions()
updateHud()
draw()
