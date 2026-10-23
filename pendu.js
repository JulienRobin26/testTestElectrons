const words = [
  'ARCADE', 'DINOSAURE', 'ELECTRON', 'FANTOME', 'JOUEUR',
  'ORDINATEUR', 'PIXEL', 'SERPENT', 'TETRIS', 'VICTOIRE',
  'GALAXIE', 'PIRATE', 'CHATEAU', 'MUSIQUE', 'SOLEIL'
]

const wordElement = document.querySelector('#hangman-word')
const statusElement = document.querySelector('#hangman-status')
const lettersElement = document.querySelector('#hangman-letters')
const livesElement = document.querySelector('#hangman-lives')
const startButton = document.querySelector('#hangman-start')
const drawingParts = [...document.querySelectorAll('.hangman-part')]

let selectedWord = ''
let guessedLetters = new Set()
let mistakes = 0
let gameOver = false

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const updateDrawing = () => {
  drawingParts.forEach((part) => {
    part.classList.toggle('is-visible', Number(part.dataset.part) <= mistakes)
  })
  livesElement.textContent = String(Math.max(0, 7 - mistakes))
}

const updateWord = () => {
  wordElement.textContent = selectedWord
    .split('')
    .map((letter) => guessedLetters.has(letter) ? letter : '_')
    .join(' ')
}

const finishGame = (won) => {
  gameOver = true
  document.querySelectorAll('.hangman-letter').forEach((button) => {
    button.disabled = true
  })
  if (won) {
    statusElement.textContent = 'Bravo, tu as trouvé le mot !'
  } else {
    wordElement.textContent = selectedWord.split('').join(' ')
    statusElement.textContent = `Perdu ! Le mot était ${selectedWord}.`
  }
}

const guess = (letter, button) => {
  if (gameOver || guessedLetters.has(letter)) return
  guessedLetters.add(letter)
  button.disabled = true

  if (selectedWord.includes(letter)) {
    statusElement.textContent = 'Bonne lettre !'
  } else {
    mistakes += 1
    statusElement.textContent = 'Mauvaise lettre...'
  }

  updateWord()
  updateDrawing()

  if (selectedWord.split('').every((wordLetter) => guessedLetters.has(wordLetter))) {
    finishGame(true)
  } else if (mistakes >= 7) {
    finishGame(false)
  }
}

const createLetterButtons = () => {
  lettersElement.replaceChildren()
  alphabet.forEach((letter) => {
    const button = document.createElement('button')
    button.className = 'hangman-letter'
    button.type = 'button'
    button.textContent = letter
    button.addEventListener('click', () => guess(letter, button))
    lettersElement.append(button)
  })
}

const startGame = () => {
  selectedWord = words[Math.floor(Math.random() * words.length)].normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  guessedLetters = new Set()
  mistakes = 0
  gameOver = false
  statusElement.textContent = 'Trouve le mot secret !'
  createLetterButtons()
  updateWord()
  updateDrawing()
}

document.addEventListener('keydown', (event) => {
  const letter = event.key.toUpperCase()
  if (alphabet.includes(letter)) {
    const button = [...document.querySelectorAll('.hangman-letter')]
      .find((candidate) => candidate.textContent === letter)
    if (button) guess(letter, button)
  }
})

startButton.addEventListener('click', startGame)
startGame()
