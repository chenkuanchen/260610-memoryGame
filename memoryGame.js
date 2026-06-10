const CONFIG = {
    pairs: 8,                       // 8 對 = 16 張
    flipBackDelay: 800,             // 配對失敗時翻回的延遲(ms)
    backImage: './img/poker.png',
  };
  
const FACES = [
    { id: 1, img: './img/poker (1).png' },
    { id: 2, img: './img/poker (2).png' },
    { id: 3, img: './img/poker (3).png' },
    { id: 4, img: './img/poker (4).png' },
    { id: 5, img: './img/poker (5).png' },
    { id: 6, img: './img/poker (6).png' },
    { id: 7, img: './img/poker (7).png' },
    { id: 8, img: './img/poker (8).png' },
  ];
  
const state = {
    firstCard: null,
    secondCard: null,
    lockBoard: false,   // 鎖定機制：翻兩張比對時鎖住，防止連點
    moves: 0,           // 翻牌次數
    matches: 0,         // 已配對數
  };
  
  /* ---------- DOM  ---------- */
  const boardEl   = document.getElementById('board');
  const movesEl   = document.getElementById('moves');
  const matchesEl = document.getElementById('matches');
  const restartEl = document.getElementById('restart');
  const time = document.getElementById('timer')
  
  /* ---------- 洗牌（Fisher–Yates）---------- */
  // 從最後一張牌開始,每一張都跟「前面隨機一張」交換位置
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  /* ---------- 產生牌組：每種圖案複製成 2 張，再洗牌 ---------- */
  function buildDeck() {
    const deck = FACES.flatMap((face) => [{ ...face }, { ...face }]);
    return shuffle(deck);
    // return deck;
  }

  /* ---------- 渲染棋盤 ---------- */
  function renderBoard(deck) {
    boardEl.innerHTML = '';
    deck.forEach((card, index) => {
      boardEl.appendChild(createCardEl(card, index));
    });
  }
  renderBoard(buildDeck());

  /* 建立單張卡牌的 DOM（結構需對應 style.css 的 class） */
  function createCardEl(card, index) {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.faceId = card.id;   // 比對用：相同 faceId 即為一對
    el.dataset.index = index;
    el.innerHTML = `
      <div class="card__inner">
        <div class="card__face card__back">
          <img src="${CONFIG.backImage}" alt="card back" />
        </div>
        <div class="card__face card__front">
          <img src="${card.img}" alt="card ${card.id}" />
        </div>
      </div>`;
    el.addEventListener('click', () => onCardClick(el));
    return el;
  }
  
  /* ---------- 點擊卡牌---------- */
  function onCardClick(cardEl) {
    if(state.lockBoard || cardEl.classList.contains('is-flipped') ||  cardEl.classList.contains('is-matched')) {
      return;
    }
    
    cardEl.classList.add('is-flipped')

    if(state.firstCard === null) {
      state.firstCard = cardEl
      return;
    }

    state.secondCard = cardEl;

    state.moves++;
    updateStats();
    checkMatch();

  }
  
  /* ---------- 比對---------- */
  function checkMatch() {
    
    const isMatch = state.firstCard.dataset.faceId === state.secondCard.dataset.faceId;
   
    if(isMatch){
      state.firstCard.classList.add('is-matched');
      state.secondCard.classList.add('is-matched');
      state.matches++;
      CONFIG.pairs--;
      updateStats();
      resetTurn();  
      return;
    }

    state.lockBoard = true;

    setTimeout(() => { 
        state.firstCard.classList.remove('is-flipped');
        state.secondCard.classList.remove('is-flipped');
        resetTurn();}, CONFIG.flipBackDelay)
  }
  
  /* ---------- 回合重置 ---------- */
  function resetTurn() {
    state.firstCard = null;
    state.secondCard = null;
    state.lockBoard = false;
  }
  
  /* ---------- 更新統計顯示 ---------- */
  function updateStats() {
    movesEl.textContent = state.moves;
    matchesEl.textContent = state.matches;
    time.textContent = CONFIG.pairs;
  }
  
  /* ---------- 重新開始 ---------- */
  function restart() {
    state.firstCard = null;
    state.secondCard = null;
    state.lockBoard = false;
    state.moves = 0;
    state.matches = 0;
    CONFIG.pairs = 8;
    updateStats();
    renderBoard(buildDeck());
  }
  
  restartEl.addEventListener('click', restart);
  
  /* ---------- 初始化 ---------- */
  restart();