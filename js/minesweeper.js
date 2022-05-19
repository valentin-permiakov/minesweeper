import { shuffle } from './shuffle.js';

const flagsLeftContainer = document.createElement('div');
const flagsLeft = document.createElement('span');

let flags = 0;
let squares = [];
let isGameOver = false;
let width, bombAmount;

const boom = new Audio('../assets/boom.mp3');
const clickBtn = new Audio('../assets/click.mp3');
const winSound = new Audio('../assets/win.mp3');

function createSettings() {
    // resetting everything
    document.body.innerHTML = '';
    width = 0;
    bombAmount = 0;
    flags = 0;
    isGameOver = false;
    squares = [];

    const heading = document.createElement('h1');
    const settingsHeading = document.createElement('h2');
    const gameSettingsWrapper = document.createElement('div');
    const hint = document.createElement('p');
    const form = document.createElement('form');
    const buttonWrapper = document.createElement('div');
    const mapSizeBtnSm = document.createElement('button');
    const mapSizeBtnMd = document.createElement('button');
    const mapSizeBtnLg = document.createElement('button');
    const bombInput = document.createElement('input');
    const startBtn = document.createElement('button');

    gameSettingsWrapper.classList.add('settings-wrapper');
    hint.classList.add('settings-hint');
    form.classList.add('settings-form');
    buttonWrapper.classList.add('button-wrapper');
    mapSizeBtnSm.classList.add('settings-button', 'map-size-button');
    mapSizeBtnMd.classList.add('settings-button', 'map-size-button');
    mapSizeBtnLg.classList.add('settings-button', 'map-size-button');
    bombInput.classList.add('settings-input');
    startBtn.classList.add('settings-button', 'start-game-button');

    mapSizeBtnSm.id = 'small';
    mapSizeBtnMd.id = 'medium';
    mapSizeBtnLg.id = 'large';

    heading.textContent = 'Minesweeper Game';
    settingsHeading.textContent = 'Game Settings';
    hint.textContent = 'Choose Map Size and Bomb Amount';
    mapSizeBtnSm.textContent = 'Small Map';
    mapSizeBtnMd.textContent = 'Medium Map';
    mapSizeBtnLg.textContent = 'Large Map';
    bombInput.type = 'number';
    startBtn.textContent = 'Start Game';
    bombInput.placeholder = 'Choose the amount of bombs';
    document.body.append(heading, gameSettingsWrapper);
    gameSettingsWrapper.append(settingsHeading, hint, form);
    buttonWrapper.append(mapSizeBtnSm, mapSizeBtnMd, mapSizeBtnLg);
    form.append(buttonWrapper, bombInput, startBtn);


    // Choosing Map Size
    let mapSizeBtns = document.querySelectorAll('.map-size-button');
    mapSizeBtns.forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            buttonWrapper.style.backgroundColor = '#f5e6d0';
            if (e.target.id === 'small') {
                width = 10;
                bombInput.placeholder = 'Choose the amount of bombs below 80';
                mapSizeBtnSm.classList.add('map-size-button--active');
                mapSizeBtnMd.classList.remove('map-size-button--active');
                mapSizeBtnLg.classList.remove('map-size-button--active');
            }
            if (e.target.id === 'medium') {
                width = 15;
                bombInput.placeholder = 'Choose the amount of bombs below 200';
                mapSizeBtnSm.classList.remove('map-size-button--active');
                mapSizeBtnMd.classList.add('map-size-button--active');
                mapSizeBtnLg.classList.remove('map-size-button--active');
            }
            if (e.target.id === 'large') {
                width = 20;
                bombInput.placeholder = 'Choose the amount of bombs below 380';
                mapSizeBtnSm.classList.remove('map-size-button--active');
                mapSizeBtnMd.classList.remove('map-size-button--active');
                mapSizeBtnLg.classList.add('map-size-button--active');
            }
        });
    });

    bombInput.addEventListener('input', () => {
        bombInput.style.backgroundColor = '#f5e6d0';
    });

    form.addEventListener('submit', e => {
        e.preventDefault();

        if (!bombInput.value) {
            bombInput.style.backgroundColor = '#f5d0df';
            alert('Choose the amount of bombs to be placed');
            return;
        }

        if (width === 10 && bombInput.value > 80 || width === 15 && bombInput.value > 200 || width === 10 && bombInput.value > 380) {
            bombInput.style.backgroundColor = '#f5d0df';
            alert('Too many bombs!');
            return;
        }

        if (!width) {
            buttonWrapper.style.backgroundColor = '#f5d0df';
            alert('Choose map size');
            return;
        }

        bombAmount = Number(bombInput.value);

        createBoard();
    });
}

// Create the game board
function createBoard() {
    document.querySelector('.settings-wrapper').remove();
    // shuffle squares with random bombs
    
    const grid = document.createElement('div');
    grid.classList.add('grid');
    grid.style.width = `${width * 35 + 20}px`;
    grid.style.height = `${width * 35 + 20}px`;
    
    flagsLeftContainer.classList.add('flags-counter');
    flagsLeftContainer.innerHTML = '&#x1F6A9; left: ';
    flagsLeft.innerHTML = bombAmount;
    flagsLeftContainer.append(flagsLeft);
    
    document.body.append(flagsLeftContainer, grid);

    const bombArray = Array(bombAmount).fill('bomb')
    const emptyArray = Array(width * width - bombAmount).fill('safe');
    const gameArray = emptyArray.concat(bombArray);
    const shuffledArray = shuffle(gameArray);

    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.style
        square.setAttribute('id', i);
        square.classList.add(shuffledArray[i]);
        grid.appendChild(square);
        squares.push(square);

        //normal click
        square.addEventListener('click', function (e) {
            click(square);
        })

        // cntrl and left click
        square.oncontextmenu = function (e) {
            clickBtn.play();
            e.preventDefault();
            addFlag(square);
        }
    }

    // Add numbers to safe squares around 'bombs'
    for (let i = 0; i < squares.length; i++) {
        let total = 0;
        const isLeftEdge = (i % width === 0);
        const isRightEdge = (i % width === width - 1);

        if (squares[i].classList.contains('safe')) {
            if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++;
            if (i > width - 1 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++;
            if (i > width && squares[i - width].classList.contains('bomb')) total++;
            if (i > width + 1 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++;
            if (i < width * width - 2 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++;
            if (i < width * width - width && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++;
            if (i < width * width - width - 2 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++;
            if (i < width * width - width - 1 && squares[i + width].classList.contains('bomb')) total++;
            squares[i].setAttribute('data', total);
        }
    }

};

// Add Flag with RightClick
function addFlag(square) {
    if (isGameOver) return;
    if (!square.classList.contains('checked') && (flags < bombAmount)) {
        if (!square.classList.contains('flag')) {
            square.classList.add('flag');
            square.innerHTML = '&#x1F6A9;';
            flags++;
            flagsLeft.innerHTML = bombAmount - flags; 
            checkForWin();
        } else {
            square.classList.remove('flag');
            square.innerHTML = '';
            flags--;
            flagsLeft.innerHTML = bombAmount - flags;
        }
    } else if (!square.classList.contains('checked') && flags === bombAmount && square.classList.contains('flag')) {
        square.classList.remove('flag');
        square.innerHTML = '';
        flags--;
        flagsLeft.innerHTML = bombAmount - flags;
    }
}

// click on square actions
function click(square) {
    clickBtn.play();
    let currentId = square.id;

    if (isGameOver) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;

    if (square.classList.contains('bomb')) { // BOMB CLICK!
        boom.play();
        setTimeout(() => gameOver(square), 100);
    } else {
        let total = square.getAttribute('data');
        if (total != 0) {
            square.classList.add('checked');
            if (total == 1) square.classList.add('one')
            if (total == 2) square.classList.add('two')
            if (total == 3) square.classList.add('three')
            if (total >= 4) square.classList.add('four')
            square.innerHTML = total;
            return;
        }
        checkSquare(square, currentId);
    }
    square.classList.add('checked');
}

// check neighboring squares
function checkSquare(square, currentId) {
    const isLeftEdge = (currentId % width === 0);
    const isRightEdge = (currentId % width === width - 1);

    setTimeout(() => {
        if (currentId > 0 && !isLeftEdge) {
            const newId = parseInt(currentId) - 1;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
        if (currentId > width - 1 && !isRightEdge) {
            const newId = parseInt(currentId) + 1 - width;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
        if (currentId > width) {
            const newId = parseInt(currentId) - width;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
        if (currentId > width + 1 && !isLeftEdge) {
            const newId = parseInt(currentId) - 1 - width;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
        if (currentId < width * width - 2 && !isRightEdge) {
            const newId = parseInt(currentId) + 1;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
        if (currentId < width * width - width && !isLeftEdge) {
            const newId = parseInt(currentId) - 1 + width;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
        if (currentId < width * width - width - 2 && !isRightEdge) {
            const newId = parseInt(currentId) + 1 + width;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
        if (currentId < width * width - width - 1) {
            const newId = parseInt(currentId) + width;
            const newSquare = document.getElementById(newId);
            click(newSquare);
        }
    }, 10);
}

// GameOver Function
function gameOver() {
    const modal = document.createElement('div');
    const message = document.createElement('p');
    const tryAgain = document.createElement('button');

    modal.classList.add('game-over-modal');
    message.classList.add('game-over-message');
    tryAgain.classList.add('try-again-btn');

    message.textContent = 'Boom! You Loose!';
    tryAgain.textContent = 'Try Again?';

    isGameOver = true;
    // show all bombs
    squares.forEach(square => {
        if (square.classList.contains('bomb')) {
            square.classList.add('checked');
            square.innerHTML = '&#x1F4A3;';
        }
    });

    modal.append(message, tryAgain);
    document.body.append(modal);

    modal.classList.add('game-over-modal--active');

    tryAgain.addEventListener('click', () => {
        createSettings()
    });


}

// Win conditions
function checkForWin() {
    let matches = 0;

    for (let i = 0; i < squares.length; i++) {
        if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
            matches++;
        }
        if (matches === bombAmount) {
            isGameOver = true;
        }
    }

    if (isGameOver) {
        const modal = document.createElement('div');
        const message = document.createElement('p');
        const tryAgain = document.createElement('button');

        modal.classList.add('game-over-modal');
        message.classList.add('game-over-message');
        tryAgain.classList.add('try-again-btn');

        message.textContent = 'You won!';
        tryAgain.textContent = 'Try Again?';

        winSound.play();
        modal.append(message, tryAgain);
        document.body.append(modal);

        modal.classList.add('game-over-modal--active');

        tryAgain.addEventListener('click', () => {
            createSettings();
        })
    };
}

document.addEventListener('DOMContentLoaded', () => {

    // Create Settings
    createSettings();

});

