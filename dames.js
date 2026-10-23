const boardElement = document.querySelector('#checkers-board')
const statusElement = document.querySelector('#checkers-status')
const turnElement = document.querySelector('#checkers-turn')
const startButton = document.querySelector('#checkers-start')

const size = 8
const players = {
  red: { label: 'ROUGE', direction: -1 },
  blue: { label: 'BLEU', direction: 1 }
}

let board
let currentPlayer
let selected
let availableMoves
let forcedPiece
let gameOver

const isInside = (row, column) => row >= 0 && row < size && column >= 0 && column < size
const isPlayable = (row, column) => (row + column) % 2 === 1

const createInitialBoard = () => {
  const newBoard = Array.from({ length: size }, () => Array(size).fill(null))

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (isPlayable(row, column)) newBoard[row][column] = { player: 'blue', king: false }
    }
  }

  for (let row = 5; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (isPlayable(row, column)) newBoard[row][column] = { player: 'red', king: false }
    }
  }

  return newBoard
}

const getDirections = (piece, player) => {
  if (piece.king) {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  }
  return players[player].direction === -1
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]]
}

const getMoves = (row, column, captureOnly = false) => {
  const piece = board[row][column]
  if (!piece) return []

  const moves = []
  getDirections(piece, piece.player).forEach(([rowStep, columnStep]) => {
    const nextRow = row + rowStep
    const nextColumn = column + columnStep
    const jumpRow = row + rowStep * 2
    const jumpColumn = column + columnStep * 2

    if (!captureOnly && isInside(nextRow, nextColumn) && !board[nextRow][nextColumn]) {
      moves.push({ row: nextRow, column: nextColumn, capture: null })
    }

    if (
      isInside(jumpRow, jumpColumn) &&
      board[nextRow]?.[nextColumn]?.player &&
      board[nextRow][nextColumn].player !== piece.player &&
      !board[jumpRow][jumpColumn]
    ) {
      moves.push({ row: jumpRow, column: jumpColumn, capture: { row: nextRow, column: nextColumn } })
    }
  })

  return captureOnly ? moves.filter((move) => move.capture) : moves
}

const getAllCaptures = (player) => {
  const captures = []
  board.forEach((line, row) => line.forEach((piece, column) => {
    if (piece?.player === player) {
      getMoves(row, column, true).forEach((move) => captures.push({ row, column, move }))
    }
  }))
  return captures
}

const hasMoves = (player) => board.some((line, row) =>
  line.some((piece, column) => piece?.player === player && getMoves(row, column).length > 0)
)

const selectPiece = (row, column) => {
  const piece = board[row][column]
  if (!piece || piece.player !== currentPlayer) return
  if (forcedPiece && (forcedPiece.row !== row || forcedPiece.column !== column)) return

  const mustCapture = getAllCaptures(currentPlayer).length > 0 || forcedPiece
  const moves = getMoves(row, column, mustCapture)
  if (moves.length === 0) return

  selected = { row, column }
  availableMoves = moves
  render()
}

const movePiece = (move) => {
  const piece = board[selected.row][selected.column]
  board[move.row][move.column] = piece
  board[selected.row][selected.column] = null
  if (move.capture) board[move.capture.row][move.capture.column] = null

  if ((piece.player === 'red' && move.row === 0) || (piece.player === 'blue' && move.row === size - 1)) {
    piece.king = true
  }

  const canCaptureAgain = move.capture && getMoves(move.row, move.column, true).length > 0
  if (canCaptureAgain) {
    forcedPiece = { row: move.row, column: move.column }
    selected = forcedPiece
    availableMoves = getMoves(move.row, move.column, true)
    statusElement.textContent = 'Continue la prise avec le même pion.'
    render()
    return
  }

  forcedPiece = null
  selected = null
  availableMoves = []
  currentPlayer = currentPlayer === 'red' ? 'blue' : 'red'
  finishTurn()
}

const finishTurn = () => {
  const opponent = currentPlayer === 'red' ? 'blue' : 'red'
  const piecesLeft = board.flat().some((piece) => piece?.player === currentPlayer)
  if (!piecesLeft || !hasMoves(currentPlayer)) {
    gameOver = true
    const winner = players[opponent].label
    statusElement.textContent = `${winner} gagne la partie !`
  } else {
    const capturesRequired = getAllCaptures(currentPlayer).length > 0
    statusElement.textContent = capturesRequired
      ? `${players[currentPlayer].label} : une prise est obligatoire.`
      : `${players[currentPlayer].label}, à toi de jouer.`
  }
  render()
}

const handleCellClick = (row, column) => {
  if (gameOver) return
  const move = availableMoves.find((candidate) => candidate.row === row && candidate.column === column)
  if (selected && move) {
    movePiece(move)
  } else {
    selectPiece(row, column)
  }
}

const render = () => {
  boardElement.replaceChildren()
  turnElement.textContent = players[currentPlayer].label
  turnElement.style.color = currentPlayer === 'red' ? '#ff3cac' : '#18e7ff'

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const cell = document.createElement('button')
      const piece = board[row][column]
      const isSelected = selected?.row === row && selected?.column === column
      const isMove = availableMoves.some((move) => move.row === row && move.column === column)
      cell.className = `checkers-cell ${(row + column) % 2 === 0 ? 'light' : 'dark'}`
      cell.type = 'button'
      cell.setAttribute('role', 'gridcell')
      cell.setAttribute('aria-label', `Ligne ${row + 1}, colonne ${column + 1}`)
      if (isSelected) cell.classList.add('selected')
      if (isMove) cell.classList.add('possible')
      if (piece) {
        const pieceElement = document.createElement('span')
        pieceElement.className = `checkers-piece ${piece.player}${piece.king ? ' king' : ''}`
        pieceElement.textContent = piece.king ? '★' : ''
        cell.append(pieceElement)
      }
      cell.addEventListener('click', () => handleCellClick(row, column))
      boardElement.append(cell)
    }
  }
}

const startGame = () => {
  board = createInitialBoard()
  currentPlayer = 'red'
  selected = null
  availableMoves = []
  forcedPiece = null
  gameOver = false
  statusElement.textContent = 'Les rouges commencent. Sélectionne un pion.'
  startButton.textContent = 'RECOMMENCER'
  render()
}

startButton.addEventListener('click', startGame)
startGame()
