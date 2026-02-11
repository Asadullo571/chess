// Shaxmat o'yinini boshlash
var board = null;
var game = new Chess();
var $status = $('#status');
var $moveHistory = $('#move-history');
var moveCount = 1;
var whiteSquareGrey = '#a9a9a9';
var blackSquareGrey = '#696969';

// Yurishni amalga oshirish funksiyasi
function onDragStart(source, piece, position, orientation) {
    // O'yin tugagan bo'lsa yoki qora donalarni harakatlantirmoqchi bo'lsa
    if (game.game_over()) return false;
    
    // Faqat oq donalar harakatlana oladi (AI qarshi o'ynaydi)
    if (piece.search(/^b/) !== -1) return false;
}

// Katakka tushganda
function onDrop(source, target) {
    removeGreySquares();
    
    // Yurishni amalga oshirishga harakat qilish
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Har doim qirolicha bilan almashtirish
    });
    
    // Noto'g'ri yurish
    if (move === null) return 'snapback';
    
    // Yurishni tarixga qo'shish
    updateMoveHistory(move);
    
    // AI yurishini amalga oshirish
    window.setTimeout(makeAIMove, 250);
}

// Dona joylashganda
function onSnapEnd() {
    board.position(game.fen());
}

// Katakni kulrang qilish
function removeGreySquares() {
    $('#board .square-55d63').css('background', '');
}

function greySquare(square) {
    var $square = $('#board .square-' + square);
    
    var background = whiteSquareGrey;
    if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey;
    }
    
    $square.css('background', background);
}

// Dona ustiga borganda mumkin bo'lgan yurishlarni ko'rsatish
function onMouseoverSquare(square, piece) {
    // Mumkin bo'lgan yurishlarni olish
    var moves = game.moves({
        square: square,
        verbose: true
    });
    
    // Agar yurishlar bo'lmasa chiqish
    if (moves.length === 0) return;
    
    // Katakni kulrang qilish
    greySquare(square);
    
    // Mumkin bo'lgan yurishlar katakchalarini kulrang qilish
    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
}

// Dona ustidan chiqqanda
function onMouseoutSquare(square, piece) {
    removeGreySquares();
}

// AI yurishini amalga oshirish
function makeAIMove() {
    var possibleMoves = game.moves();
    
    // O'yin tugaganini tekshirish
    if (possibleMoves.length === 0) return;
    
    // Tasodifiy yurish tanlash
    var randomIdx = Math.floor(Math.random() * possibleMoves.length);
    var move = game.move(possibleMoves[randomIdx]);
    
    // Yurishni tarixga qo'shish
    updateMoveHistory(move);
    
    board.position(game.fen());
}

// Yurishlar tarixini yangilash
function updateMoveHistory(move) {
    var moveText = '';
    
    if (move.color === 'w') {
        moveText = moveCount + '. ' + move.san;
        moveCount++;
    } else {
        moveText = move.san;
    }
    
    var $moveEntry = $('<span>').text(moveText + ' ').addClass('move-entry');
    $moveHistory.append($moveEntry);
    
    // Oxirigacha scroll qilish
    $moveHistory.scrollTop($moveHistory[0].scrollHeight);
}

// Taxtani sozlash
var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare
};

board = Chessboard('board', config);

// Qaytadan boshlash tugmasi
$('.play-again').on('click', function() {
    game.reset();
    board.start();
    moveCount = 1;
    $moveHistory.empty();
    removeGreySquares();
});

// Pozitsiyani o'rnatish tugmasi
$('.set-pos').on('click', function() {
    var fen = prompt('FEN formatida pozitsiyani kiriting:');
    if (fen !== null && fen !== '') {
        if (game.load(fen)) {
            board.position(fen);
            moveCount = 1;
            $moveHistory.empty();
        } else {
            alert('Noto\'g\'ri FEN formati!');
        }
    }
});

// Taxtani aylantirish tugmasi
$('.flip-board').on('click', function() {
    board.flip();
});