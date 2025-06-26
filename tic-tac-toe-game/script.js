let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Add click event listeners to all cells
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(event) {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Check if cell is already taken or game is over
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }

    // Make the move
    gameBoard[cellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    clickedCell.disabled = true;

    // Check for winner
    if (checkWinner()) {
        document.getElementById('winnerMessage').textContent = `🎉 Player ${currentPlayer} wins!`;
        document.querySelector('.current-player').textContent = `Game Over!`;
        gameActive = false;
        return;
    }

    // Check for draw
    if (gameBoard.every(cell => cell !== '')) {
        document.getElementById('winnerMessage').textContent = `🤝 It's a draw!`;
        document.getElementById('winnerMessage').classList.add('draw');
        document.querySelector('.current-player').textContent = `Game Over!`;
        gameActive = false;
        return;
    }

    // Switch players
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    document.querySelector('.current-player').textContent = `Player ${currentPlayer}'s turn`;
}

function checkWinner() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameBoard[index] === currentPlayer;
        });
    });
}

function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    
    document.querySelector('.current-player').textContent = `Player ${currentPlayer}'s turn`;
    document.getElementById('winnerMessage').textContent = '';
    document.getElementById('winnerMessage').classList.remove('draw');
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.disabled = false;
        cell.classList.remove('x', 'o');
    });
}