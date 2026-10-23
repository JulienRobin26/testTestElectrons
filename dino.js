const gameArea = document.querySelector('#game-area')

if (gameArea) {
  const dino = document.querySelector('#dino')
  const scoreElement = document.querySelector('#score')
  const highScoreElement = document.querySelector('#high-score')
  const statusElement = document.querySelector('#game-status')
  const startButton = document.querySelector('#start-button')
  const gameOverElement = document.querySelector('#game-over')
  const finalScoreElement = document.querySelector('#final-score')
  const finalHighScoreElement = document.querySelector('#final-high-score')
  const restartButton = document.querySelector('#restart-button')
  const highScoreKey = 'neon-dino-high-score'
  let score = 0
  let obstacleTimer
  let scoreTimer
  let running = false
  let jumping = false

  highScoreElement.textContent = String(Number.parseInt(localStorage.getItem(highScoreKey) || '0', 10)).padStart(5, '0')

  const updateScore = () => {
    scoreElement.textContent = String(score).padStart(5, '0')
  }

  const jump = () => {
    if (!running || jumping) return
    jumping = true
    dino.classList.add('jumping')
    window.setTimeout(() => {
      jumping = false
      dino.classList.remove('jumping')
    }, 620)
  }

  const createObstacle = () => {
    if (!running) return
    const obstacle = document.createElement('span')
    obstacle.className = 'obstacle'
    obstacle.textContent = Math.random() > 0.5 ? '🌵' : '🪨'
    obstacle.style.animationDuration = `${2.1 + Math.random() * 0.8}s`
    gameArea.append(obstacle)
    obstacle.addEventListener('animationend', () => obstacle.remove())
  }

  const checkCollision = () => {
    if (!running) return
    const dinoBox = dino.getBoundingClientRect()
    const collision = [...gameArea.querySelectorAll('.obstacle')].some((obstacle) => {
      const obstacleBox = obstacle.getBoundingClientRect()
      return dinoBox.right - 12 > obstacleBox.left &&
        dinoBox.left + 12 < obstacleBox.right &&
        dinoBox.bottom - 10 > obstacleBox.top &&
        dinoBox.top + 10 < obstacleBox.bottom
    })

    if (collision) {
      running = false
      window.clearInterval(obstacleTimer)
      window.clearInterval(scoreTimer)
      const savedScore = Number.parseInt(localStorage.getItem(highScoreKey) || '0', 10)
      if (score > savedScore) {
        localStorage.setItem(highScoreKey, String(score))
      }
      const bestScore = Math.max(score, savedScore)
      highScoreElement.textContent = String(bestScore).padStart(5, '0')
      finalScoreElement.textContent = String(score).padStart(5, '0')
      finalHighScoreElement.textContent = String(bestScore).padStart(5, '0')
      statusElement.textContent = 'Partie terminée'
      gameArea.classList.add('is-over')
      gameOverElement.hidden = false
      return
    }
    window.requestAnimationFrame(checkCollision)
  }

  const startGame = () => {
    window.clearInterval(obstacleTimer)
    window.clearInterval(scoreTimer)
    gameArea.querySelectorAll('.obstacle').forEach((obstacle) => obstacle.remove())
    gameOverElement.hidden = true
    gameArea.classList.remove('is-over')
    score = 0
    running = true
    jumping = false
    updateScore()
    statusElement.textContent = 'Cours et evite les obstacles !'
    startButton.textContent = 'RECOMMENCER'
    obstacleTimer = window.setInterval(createObstacle, 1350)
    scoreTimer = window.setInterval(() => {
      score += 10
      updateScore()
    }, 250)
    window.requestAnimationFrame(checkCollision)
  }

  const handleAction = (event) => {
    if (event.type === 'keydown' && ![' ', 'ArrowUp'].includes(event.key)) return
    event.preventDefault()
    if (running) jump()
    else startGame()
  }

  startButton.addEventListener('click', startGame)
  restartButton.addEventListener('click', (event) => {
    event.stopPropagation()
    startGame()
  })
  gameArea.addEventListener('click', handleAction)
  document.addEventListener('keydown', handleAction)
}
