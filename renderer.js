const func = async () => {
  const response = await window.versions.ping()
  console.log(response) // prints out 'pong'
}

func()

const highScoreElements = [
  ['#home-high-score', 'neon-dino-high-score'],
  ['#snake-high-score', 'neon-snake-high-score'],
  ['#tetris-high-score', 'neon-tetris-high-score'],
  ['#pendu-high-score', 'neon-pendu-high-score'],
]

highScoreElements.forEach(([selector, storageKey]) => {
  const highScoreElement = document.querySelector(selector)

  if (!highScoreElement) return

  const savedHighScore = Number.parseInt(localStorage.getItem(storageKey) || '0', 10)
  highScoreElement.textContent = String(savedHighScore).padStart(5, '0')
})
