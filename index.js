const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const nextButton = document.getElementById('nextButton');
const retryButton = document.getElementById('retryButton');
const roundDisplay = document.getElementById('roundDisplay');

// 이미지 로드
const malphaImage = new Image();
malphaImage.src = './images/malphite.png'; // 말파 이미지 파일 경로

const playerImage = new Image();
playerImage.src = './images/player.png'; // 플레이어 이미지 파일 경로

const player = {
    x: canvas.width / 2 - 10,
    y: canvas.height / 2 - 10,
    targetX: canvas.width / 2 - 10,
    targetY: canvas.height / 2 - 10,
    size: 20, // 충돌 판정 크기
    displaySize: 50, // 보이는 이미지 크기
    color: 'blue',
    speed: 5
};

const malpha = {
    x: 0,
    y: 0,
    size: 20, // 충돌 판정 크기
    displaySize: 80, // 보이는 이미지 크기
    color: 'red',
    speed: 10,
    active: false
};

let playerMoved = false;
let gamePaused = false;
let round = 1;
let malphaInterval;
let malphaTimeout;

function updateRoundDisplay() {
    roundDisplay.textContent = `Round: ${round}`;
}

document.addEventListener('keydown', (event) => {
    if (!gamePaused) {
        if (malpha.active && !playerMoved) {
            playerMoved = true;
            const step = 70;
            if (event.key === 'ArrowUp') player.targetY -= step;
            if (event.key === 'ArrowDown') player.targetY += step;
            if (event.key === 'ArrowLeft') player.targetX -= step;
            if (event.key === 'ArrowRight') player.targetX += step;
            player.targetX = Math.max(0, Math.min(canvas.width - player.size, player.targetX));
            player.targetY = Math.max(0, Math.min(canvas.height - player.size, player.targetY));
        } else if (!malpha.active) {
            showMessage('쫄?', true);
        }
    }
});

function drawCharacter(character, image) {
    if (image.complete) {
        // 이미지 크기와 충돌 판정 크기 간 차이 보정
        const offset = (character.displaySize - character.size) / 2;
        ctx.drawImage(
            image,
            character.x - offset,
            character.y - offset,
            character.displaySize,
            character.displaySize
        );
    } else {
        // 기본 사각형 렌더링
        ctx.fillStyle = character.color;
        ctx.fillRect(character.x, character.y, character.size, character.size);
    }
}

function updatePlayerPosition() {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    if (Math.abs(dx) > player.speed) player.x += Math.sign(dx) * player.speed;
    else player.x = player.targetX;
    if (Math.abs(dy) > player.speed) player.y += Math.sign(dy) * player.speed;
    else player.y = player.targetY;
}

function startMalphaAttack() {
    clearInterval(malphaInterval);
    clearTimeout(malphaTimeout);
    const delay = 2000 + Math.random() * 7000;
    malphaTimeout = setTimeout(() => {
        const edges = [
            { x: Math.random() * canvas.width, y: -malpha.size },
            { x: Math.random() * canvas.width, y: canvas.height + malpha.size },
            { x: -malpha.size, y: Math.random() * canvas.height },
            { x: canvas.width + malpha.size, y: Math.random() * canvas.height }
        ];
        const spawnPoint = edges[Math.floor(Math.random() * edges.length)];
        malpha.x = spawnPoint.x;
        malpha.y = spawnPoint.y;
        const targetX = canvas.width / 2 - 10;
        const targetY = canvas.height / 2 - 10;
        const angle = Math.atan2(targetY - malpha.y, targetX - malpha.x);
        malpha.dx = Math.cos(angle) * malpha.speed;
        malpha.dy = Math.sin(angle) * malpha.speed;
        malpha.active = true;
        playerMoved = false;
        malphaInterval = setInterval(() => {
            if (
                Math.abs(malpha.x - targetX) < malpha.speed &&
                Math.abs(malpha.y - targetY) < malpha.speed
            ) {
                clearInterval(malphaInterval);
                malpha.active = false;
                if (playerMoved) {
                    malpha.speed += 2;
                    round++;
                    updateRoundDisplay();
                    showMessage(`${round - 1} 성공`, false);
                } else {
                    showMessage('풉ㅋ', true);
                }
            }
            malpha.x += malpha.dx;
            malpha.y += malpha.dy;
            render();
        }, 16);
    }, delay);
}

function resetGame(fullReset = false) {
    clearInterval(malphaInterval);
    clearTimeout(malphaTimeout);
    malpha.active = false;
    playerMoved = false;
    player.x = canvas.width / 2 - 10;
    player.y = canvas.height / 2 - 10;
    player.targetX = canvas.width / 2 - 10;
    player.targetY = canvas.height / 2 - 10;
    if (fullReset) {
        malpha.speed = 10;
        round = 1;
        updateRoundDisplay();
    }
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayerPosition();
    drawCharacter(player, playerImage); // 플레이어 이미지 그리기
    if (malpha.active) {
        drawCharacter(malpha, malphaImage); // 말파 이미지 그리기
    }
}

function showMessage(message, reset) {
    gamePaused = true;
    messageText.innerText = message;
    messageBox.style.display = 'block';
    if (reset) {
        nextButton.style.display = 'none';
        retryButton.style.display = 'block';
    } else {
        nextButton.style.display = 'block';
        retryButton.style.display = 'none';
    }
}

nextButton.addEventListener('click', () => {
    messageBox.style.display = 'none';
    gamePaused = false;
    resetGame();
    startMalphaAttack();
});

retryButton.addEventListener('click', () => {
    messageBox.style.display = 'none';
    gamePaused = false;
    resetGame(true);
    startMalphaAttack();
});

// 초기화 후 게임 시작
updateRoundDisplay();
render();
startMalphaAttack();
