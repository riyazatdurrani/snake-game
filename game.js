const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 400;

// Game constants
const GRID_SIZE = 20;
const GRID_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 100;

// Colors
const COLORS = {
    snake: '#4ade80',
    food: '#fb7185',
    background: 'rgba(0, 0, 0, 0.2)'
};

// Game state
let snake = [
    { x: Math.floor(GRID_COUNT / 2), y: Math.floor(GRID_COUNT / 2) }
];
let food = generateFood();
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let gameActive = true;

// Update high score display
document.getElementById('highScore').textContent = highScore;

// Direction handlers
const directions = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right'
};

// Mobile controls
document.getElementById('upBtn').addEventListener('click', () => setDirection('up'));
document.getElementById('downBtn').addEventListener('click', () => setDirection('down'));
document.getElementById('leftBtn').addEventListener('click', () => setDirection('left'));
document.getElementById('rightBtn').addEventListener('click', () => setDirection('right'));

// Keyboard controls
document.addEventListener('keydown', (e) => {
    const newDirection = directions[e.key];
    if (newDirection) setDirection(newDirection);
});

function setDirection(newDir) {
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    if (opposites[newDir] !== direction) {
        nextDirection = newDir;
    }
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
}

function wrapPosition(pos, max) {
    if (pos < 0) return max - 1;
    if (pos >= max) return 0;
    return pos;
}

function updateGame() {
    if (!gameActive) return;

    direction = nextDirection;
    const head = { ...snake[0] };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Wrap around walls
    head.x = wrapPosition(head.x, GRID_COUNT);
    head.y = wrapPosition(head.y, GRID_COUNT);

    // Check collision with self only
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food = generateFood();
    } else {
        snake.pop();
    }

    // Draw game
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        const color = index === 0 ? COLORS.snake : COLORS.snake + '99';
        drawSquare(segment.x, segment.y, color);
    });

    // Draw food
    drawSquare(food.x, food.y, COLORS.food);
}

function gameOver() {
    gameActive = false;
    clearInterval(gameLoop);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 60);

    // Listen for space key to restart
    document.addEventListener('keydown', restartHandler);
}

function restartHandler(e) {
    if (e.code === 'Space') {
        document.removeEventListener('keydown', restartHandler);
        startGame();
    }
}

function startGame() {
    snake = [{ x: Math.floor(GRID_COUNT / 2), y: Math.floor(GRID_COUNT / 2) }];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    document.getElementById('score').textContent = '0';
    food = generateFood();
    gameActive = true;
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, GAME_SPEED);
}

// Start the game
startGame(); 