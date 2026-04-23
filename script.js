// --- GLOBAL STATE ---
let balance = 1000;
let deck = [], playerHand = [], dealerHand = [], currentBet = 0;

// --- UTILITIES ---
function updateHistory(game, result, amount) {
    const log = document.getElementById('history-log');
    const entry = document.createElement('li');
    entry.innerText = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${game}: ${result} ($${amount})`;
    log.prepend(entry);
}

function updateBalance(amount) {
    balance += amount;
    document.getElementById('balance').innerText = balance;
}

// --- GAME ROUTER ---
function switchGame(game) {
    const area = document.getElementById('main-game-area');
    if (game === 'blackjack') {
        area.innerHTML = `<h3>Blackjack</h3>
            <input type="number" id="bet-amount" value="10" style="font-size: 1.2em; padding: 10px;">
            <button onclick="placeBet()" style="font-size: 1.2em; padding: 10px 20px;">Deal</button>
            <div id="game-table" style="display:none;">
                <div id="dealer-hand" class="hand-container"></div>
                <div id="player-hand" class="hand-container"></div>
                <button onclick="hit()" style="font-size: 1.2em; padding: 10px 20px;">Hit</button>
                <button onclick="stand()" style="font-size: 1.2em; padding: 10px 20px;">Stand</button>
            </div>`;
    } else if (game === 'roulette') {
        let numbersHTML = '';
        for (let i = 0; i < 37; i++) {
            let angle = (360 / 37) * i;
            numbersHTML += `<div class="roulette-number" style="transform: rotate(${angle}deg) translateY(-170px) rotate(-${angle}deg);">${i}</div>`;
        }
        area.innerHTML = `<h3>Roulette</h3>
            <div id="roulette-container">
                <div id="roulette-ball"></div>
                <div id="roulette-wheel">${numbersHTML}</div>
            </div>
            <input type="number" id="roulette-bet" style="font-size: 1.2em; padding: 10px;" placeholder="Bet $">
            <input type="number" id="roulette-num" style="font-size: 1.2em; padding: 10px;" placeholder="Num 0-36">
            <button onclick="spinRoulette()" style="font-size: 1.2em; padding: 10px 20px;">Spin</button>`;
    } else if (game === 'slots') {
        let grid = '';
        for (let col = 0; col < 3; col++) {
            grid += `<div class="reel" id="reel-${col}">
                <div class="slot" id="slot-${col}-0">?</div>
                <div class="slot" id="slot-${col}-1">?</div>
                <div class="slot" id="slot-${col}-2">?</div>
            </div>`;
        }
        area.innerHTML = `<h3>Slots</h3>
            <div id="slot-machine">${grid}</div>
            <input type="number" id="slot-bet" style="font-size: 1.2em; padding: 10px;" placeholder="Bet $">
            <button onclick="spinSlots()" style="font-size: 1.2em; padding: 10px 20px;">Spin</button>`;
    }
}

// --- BLACKJACK LOGIC ---
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'], values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];
    for (let s of suits) for (let v of values) deck.push({ v, s });
    deck.sort(() => Math.random() - 0.5);
}

function calcScore(hand) {
    let score = hand.reduce((a, c) => a + (['J','Q','K'].includes(c.v) ? 10 : c.v === 'A' ? 11 : parseInt(c.v)), 0);
    let aces = hand.filter(c => c.v === 'A').length;
    while (score > 21 && aces > 0) { score -= 10; aces--; }
    return score;
}

function addCardToUI(card, containerId, faceUp = true) {
    const el = document.createElement('div');
    el.className = 'card' + (faceUp ? ' flipped' : '');
    el.innerHTML = `<div class="card-face card-back">?</div><div class="card-face card-front">${card.v}${card.s}</div>`;
    document.getElementById(containerId).appendChild(el);
    setTimeout(() => el.classList.add('dealt'), 50);
}

function placeBet() {
    currentBet = parseInt(document.getElementById('bet-amount').value);
    if (currentBet > balance) return alert("Insufficient funds!");
    updateBalance(-currentBet);
    document.getElementById('game-table').style.display = 'block';
    document.getElementById('dealer-hand').innerHTML = '';
    document.getElementById('player-hand').innerHTML = '';
    createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    playerHand.forEach(c => addCardToUI(c, 'player-hand'));
    addCardToUI(dealerHand[0], 'dealer-hand');
    addCardToUI(dealerHand[1], 'dealer-hand', false);
}

function hit() {
    playerHand.push(deck.pop());
    addCardToUI(playerHand[playerHand.length - 1], 'player-hand');
    if (calcScore(playerHand) > 21) endGame('loss');
}

function stand() {
    document.getElementById('dealer-hand').children[1].classList.add('flipped');
    while (calcScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
        addCardToUI(dealerHand[dealerHand.length - 1], 'dealer-hand');
    }
    let p = calcScore(playerHand), d = calcScore(dealerHand);
    if (d > 21 || p > d) endGame('win');
    else if (p === d) endGame('tie');
    else endGame('loss');
}

function endGame(res) {
    if (res === 'win') updateBalance(currentBet * 2);
    else if (res === 'tie') updateBalance(currentBet);
    updateHistory('Blackjack', res.toUpperCase(), res === 'loss' ? currentBet : currentBet * (res === 'win' ? 2 : 1));
    alert(res.toUpperCase() + "!");
}

// --- ROULETTE LOGIC ---
function spinRoulette() {
    const bet = parseInt(document.getElementById('roulette-bet').value);
    const pick = parseInt(document.getElementById('roulette-num').value);
    if (bet > balance || isNaN(bet)) return alert("Invalid bet!");
    
    updateBalance(-bet);
    const win = Math.floor(Math.random() * 37);
    
    const wheel = document.getElementById('roulette-wheel');
    const ball = document.getElementById('roulette-ball');
    
    const sliceAngle = 360 / 37;
    const targetAngle = win * sliceAngle;
    const finalRotation = 1440 - targetAngle;
    
    wheel.style.transform = `rotate(${finalRotation}deg)`;
    ball.style.transform = `rotate(${finalRotation}deg)`;
    
    setTimeout(() => {
        alert("The ball landed on: " + win);
        if (pick === win) {
            updateBalance(bet * 36);
            updateHistory('Roulette', 'WIN', bet * 36);
        } else {
            updateHistory('Roulette', 'LOSS', bet);
        }
    }, 4000);
}

// --- SLOTS LOGIC ---
function spinSlots() {
    const bet = parseInt(document.getElementById('slot-bet').value);
    if (bet > balance || isNaN(bet)) return alert("Invalid bet!");
    updateBalance(-bet);
    
    const symbols = ['🍒', '🍋', '🔔', '💎', '⭐', '7️⃣'];
    let iterations = 0;
    let delay = 100;

    function animate() {
        for (let col = 0; col < 3; col++) {
            const s2 = document.getElementById(`slot-${col}-2`);
            const s1 = document.getElementById(`slot-${col}-1`);
            const s0 = document.getElementById(`slot-${col}-0`);
            
            s2.innerText = s1.innerText;
            s1.innerText = s0.innerText;
            s0.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        }

        iterations++;
        
        if (iterations < 25) {
            if (iterations > 15) delay += 30; 
            setTimeout(animate, delay);
        } else {
            const m0 = document.getElementById('slot-0-1').innerText;
            const m1 = document.getElementById('slot-1-1').innerText;
            const m2 = document.getElementById('slot-2-1').innerText;
            
            if (m0 === m1 && m1 === m2) {
                updateBalance(bet * 15);
                updateHistory('Slots', 'WIN', bet * 15);
            } else {
                updateHistory('Slots', 'LOSS', bet);
            }
        }
    }

    animate();
}
