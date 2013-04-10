"use strict";

/********************************************/
/* Model Game */
/********************************************/
window.Game = Backbone.Model.extend({
	defaults: {
		board: null,
		current_player_color: null,
		ai: null,
		history: null
	},

	// Constructor which initializes the board and print it
	initialize: function Game() {
		this.print();
		this.initHistory();
		document.onselectstart = function(){ return false; };
	},

	// Start the game with one player and an AI
	startOnePlayerGame: function () {
		this.startTwoPlayersGame();
		this.set({ 'ai': new AI() });
	},

	// Start the game with two players
	startTwoPlayersGame: function () {
		this.resetGame();
		this.set({ 'current_player_color': White });
		this.initRedips();
		this.preventBadDrags();
		alertify.success('New game started');
	},

	// Reset the game
	resetGame: function () {
		this.set({ 'board': new Board() });
		this.set({ 'current_player_color': null });
		this.set({ 'ai': null });
		this.initBoard();
		this.print();
	},

	// Print the board
	print: function () {
		var content = "";

		for (var index = 0; index < 64; index++) {
			if (this.get('board') != null)
				var piece = this.get('board').getPiece(index % 8, Math.floor(index / 8));

			if (index % 8 == 0) content += '<tr>';

			if (((Math.floor(index / 8)) * 1 + index) % 2 == 0) content += '<td class="one" id="td' + index + '">';
			else content += '<td class="two" id="td' + index + '">';

			if (this.get('board') != null && piece.get('type') != 'empty')
				content += '<div class="drag" id="div' + index + '"><div class="piece ' + piece.toString() + '" /></div>';

			content += '</td>';

			if ((index + 1) % 8 == 0) content += '</tr>';
		};

		$('#board').html(content);
		this.preventAllDrags();
	},

	// Init the board
	initBoard: function () {
		this.get('board').add(new Rook({ color : Black}));
		this.get('board').add(new Knight({ color : Black}));
		this.get('board').add(new Bishop({ color : Black}));
		this.get('board').add(new Queen({ color : Black}));
		this.get('board').add(new King({ color : Black}));
		this.get('board').add(new Bishop({ color : Black}));
		this.get('board').add(new Knight({ color : Black}));
		this.get('board').add(new Rook({ color : Black}));
		for (var i = 0; i < 8; ++i) this.get('board').add(new Pawn({ color : Black}));
		for (var i = 0; i < 8 * 4; ++i) this.get('board').add(new Empty());
		for (var i = 0; i < 8; ++i) this.get('board').add(new Pawn({ color : White}));
		this.get('board').add(new Rook({ color : White}));
		this.get('board').add(new Knight({ color : White}));
		this.get('board').add(new Bishop({ color : White}));
		this.get('board').add(new Queen({ color : White}));
		this.get('board').add(new King({ color : White}));		
		this.get('board').add(new Bishop({ color : White}));
		this.get('board').add(new Knight({ color : White}));
		this.get('board').add(new Rook({ color : White}));
	},

	// Init history
	initHistory: function () {
		var thisObj = this;
		$('#undo').click(function() {
			if(thisObj.get('history') != null)
				thisObj.undoLastMove();
		});
	},

	// Enable undo action
	enableUndo: function () {
		this.set({ 'history': new History() });
		$('#history').css('display', 'inline-block');
	},

	// Disable undo action
	disableUndo: function () {
		this.set({ 'history': null });
		$('#history').hide();
	},

	// Undo the last movement of the player. The ia doesn't count as a player
	undoLastMove: function () {
		this.get('history').undoLastMove(this);

		if (this.get('ai') != null) {
			var thisObj = this;
			setTimeout(function() {
				thisObj.get('history').undoLastMove(thisObj);
			}, 600);
		}
		else {
			this.changePlayer();
		}
	},

	// Init options if redips
	initRedips: function () {
		var thisObj = this,
			rd = REDIPS.drag;

		rd.init();
		rd.dropMode = 'overwrite';
		rd.hover.colorTd = '#248F40';

		// Prevent bad drops when a piece is clicked
		rd.event.clicked = function () {
			var pos = rd.getPosition();
			thisObj.preventBadDrops(pos[2], pos[1]);
		};

		// Remove the mark class when the mouse is up
		$('#board').mouseup(function () {
			$('#board td').removeClass('mark');
			$('#board td').removeClass('allow_drop');
		});

		// Init the next turn when a piece is dropped
		rd.event.dropped = function () {
			var pos = rd.getPosition();
			if (pos[1] != pos[4] || pos[2] != pos[5]) {
				if (thisObj.get('ai') != null) thisObj.nextTurnOnePlayer(pos[5], pos[4], pos[2], pos[1]);
				else thisObj.nextTurnTwoPlayers(pos[5], pos[4], pos[2], pos[1]);
			}
		};
	},

	// Allow to drag only pieces of the current player
	preventBadDrags: function () {
		REDIPS.drag.enableDrag(true, '.prevent_drag');
		$('#board div').removeClass('prevent_drag');

		var current_player_color = this.get('current_player_color');
		this.get('board').each(function (piece, index) {
			if (piece.get('color') != current_player_color)
				$('#div' + index).addClass('prevent_drag');
		});
		REDIPS.drag.enableDrag(false, '.prevent_drag');
	},

	// Prevent all drags of pieces
	preventAllDrags: function () {
		$('#board div').addClass('prevent_drag');
		REDIPS.drag.enableDrag(false, '.prevent_drag');
	},

	// Allow to drop pieces only in correct places
	preventBadDrops: function (fromX, fromY) {
		var piece = this.get('board').getPiece(fromX, fromY);
		for (var toPos = 0; toPos < 64; toPos++) {
			if (!piece.moveIsCorrect(this.get('board'), this.get('current_player_color'),
									 fromX, fromY, toPos % 8, Math.floor(toPos / 8)))
				$('#td' + toPos).addClass('mark');
			else
				$('#td' + toPos).addClass('allow_drop');
		};
	},

	// Invert the color of the current player
	changePlayer: function () {
		var new_player_color = this.get('current_player_color') == White ? Black : White;
		this.set({ 'current_player_color': new_player_color });
	},

	// Move the piece on the board array and change its id
	makeBoardMove: function (fromX, fromY, toX, toY, save) {
		var pieceMoved = this.get('board').makeMove(fromX, fromY, toX, toY);
		$('#div' + (fromX + fromY * 8)).attr('id', 'div' + (toX + toY * 8));

		if(this.get('history') != null && save)
			this.get('history').saveLastMove(fromX, fromY, toX, toY, pieceMoved);
	},

	// Move the piece on the board with an animation
	makeRedipsMove: function (fromX, fromY, toX, toY) {
		$('#div' + (toX + toY * 8)).remove();
		REDIPS.drag.moveObject({
			id: 'div' + (fromX + fromY * 8),
			target: [0, toY, toX]
		});
	},

	// Init the next turn of the game when there is two players
	nextTurnTwoPlayers: function (fromX, fromY, toX, toY) {
		this.changePlayer();
		this.preventBadDrags();
		this.makeBoardMove(fromX, fromY, toX, toY, true);
	},

	// Init the next turn of the game for the alone player
	nextTurnOnePlayer: function (fromX, fromY, toX, toY) {
		this.preventAllDrags();
		this.changePlayer();
		this.makeBoardMove(fromX, fromY, toX, toY, true);	
		var bestMove = this.get('ai').returnBestMove(this.get('board'), this.get('current_player_color'));
		this.nextTurnAI(bestMove.get('fromX'), bestMove.get('fromY'), bestMove.get('toX'), bestMove.get('toY'));
	},

	// Init the next turn of the game for the ai
	nextTurnAI: function (fromX, fromY, toX, toY) {
		this.changePlayer();
		this.preventBadDrags();
		this.makeRedipsMove(fromX, fromY, toX, toY);
		this.makeBoardMove(fromX, fromY, toX, toY, true);
	},

	// Check if the game is check
	isGameCkeck: function () {
		//if ()
		{
			alertify.success('Black player\'s king is in check');
		}
	},

	// Check if the game is checkmate (Game over)
	isGameCheckmate: function () {
		//if ()
		{
			this.preventAllDrags();
			alertify.success('Black player\'s king is in checkmate');
		}
	}
});