let deck = [], playerHand = [], dealerHand = [], balance = 1000, currentBet = 0;

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
    let bet = parseInt(document.getElementById('bet-amount').value);
    if (bet > balance) return alert("Insufficient funds!");
    currentBet = bet; balance -= currentBet;
    document.getElementById('balance').innerText = balance;
    document.getElementById('betting-area').style.display = 'none';
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
    if (res === 'win') balance += (currentBet * 2);
    else if (res === 'tie') balance += currentBet;
    document.getElementById('message').innerText = res.toUpperCase() + "!";
    document.getElementById('balance').innerText = balance;
    setTimeout(() => {
        document.getElementById('betting-area').style.display = 'block';
        document.getElementById('game-table').style.display = 'none';
    }, 2000);
}