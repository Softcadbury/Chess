"use strict";

/********************************************/
/* Model Game */
/********************************************/
window.Game = Backbone.Model.extend({
	defaults: {
		board: null,
		current_player_color: null,
		ai: null,
		history: null,
		game_over: false
	},

	// Constructor which prints the board & initializes the history for undo actions
	initialize: function Game() {
		this.print();

		var self = this;
		$('#undo').click(function() {
			if(!$('#undo').hasClass('disabled') && self.get('history') != null)
				self.undoLastMove();
		});

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
		this.initRedips();
		this.preventBadDrags();
		alertify.success('New game started');
	},

	// Reset the game
	resetGame: function () {
		this.set({ 'board': new Board() });
		this.set({ 'current_player_color': White });
		this.set({ 'ai': null });
		this.set({ 'game_over': false });
		this.initBoard();
		this.print();
	},

	// Print the board
	print: function () {
		var content = "";

		for (var index = 0; index < 64; index++) {
			// <tr>
			if (index % 8 == 0) content += '<tr>';

			// <td>
			var td_class = (((Math.floor(index / 8)) + index) % 2 == 0) ? 'one' : 'two';
			content += '<td class="' + td_class + '" id="td' + index + '">';

			// <td> content
			if (this.get('board') != null)
			{
				var piece = this.get('board').getPiece(index % 8, Math.floor(index / 8));
				if (piece.get('type') != 'empty')
					content += '<div class="drag" id="div' + index + '"><div class="piece ' + piece.toString() + '" /></div>';
			}

			// </td>
			content += '</td>';

			// </tr>
			if ((index + 1) % 8 == 0) content += '</tr>';
		};

		$('#board').html(content);
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
		//for (var i = 0; i < 8; ++i) this.get('board').add(new Pawn({ color : Black}));
		for (var i = 0; i < 8 * 6; ++i) this.get('board').add(new Empty());
		//for (var i = 0; i < 8; ++i) this.get('board').add(new Pawn({ color : White}));
		this.get('board').add(new Rook({ color : White}));
		this.get('board').add(new Knight({ color : White}));
		this.get('board').add(new Bishop({ color : White}));
		this.get('board').add(new Queen({ color : White}));
		this.get('board').add(new King({ color : White}));		
		this.get('board').add(new Bishop({ color : White}));
		this.get('board').add(new Knight({ color : White}));
		this.get('board').add(new Rook({ color : White}));
	},

	// Enable undo actions
	enableUndo: function () {
		this.set({ 'history': new History() });
		$('#history').css('display', 'inline-block');
	},

	// Disable undo actions
	disableUndo: function () {
		this.set({ 'history': null });
		$('#history').hide();
	},

	// Undo the last movement of the player. If there is an ia, its last move is undo too
	undoLastMove: function () {
		$('#undo').addClass('disabled');
		this.get('history').undoLastMove(this);

		if (this.get('ai') != null) {
			var self = this;

			setTimeout(function() {
				self.get('history').undoLastMove(self);
			}, 600);

			setTimeout(function() {
				$('#undo').removeClass('disabled');
			}, 1200);
		}
		else {
			this.changePlayer();

			setTimeout(function() {
				$('#undo').removeClass('disabled');
			}, 600);
		}
	},

	// Init options of redips
	initRedips: function () {
		var self = this,
			rd = REDIPS.drag;

		rd.init();
		rd.dropMode = 'overwrite';
		rd.hover.colorTd = '#248F40';

		// Prevent bad drops when a piece is clicked
		rd.event.clicked = function () {
			var pos = rd.getPosition();
			self.preventBadDrops(pos[2], pos[1]);
		};

		// Remove the mark class when the mouse is up
		$('#board').mouseup(function () {
			$('#board td').removeClass('mark');
			$('#board td').removeClass('allow_drop');
		});

		// Init the next turn when a piece is dropped
		rd.event.dropped = function () {
			var pos = rd.getPosition();

			// Check if the start position is different from the final position
			if (pos[1] != pos[4] || pos[2] != pos[5]) {
				if (self.get('ai') != null)
					self.nextTurnOnePlayer(pos[5], pos[4], pos[2], pos[1]);
				else
					self.nextTurnTwoPlayers(pos[5], pos[4], pos[2], pos[1]);
			}
		};
	},

	// Prevent drags of all pieces
	preventAllDrags: function () {
		$('#board div').addClass('prevent_drag');
		REDIPS.drag.enableDrag(false, '.prevent_drag');
	},

	// Prevent drags of pieces not belonging to the current player
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

	// Prevent drops of pieces on incorrect places
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
	makeBoardMove: function (fromX, fromY, toX, toY, saveInHistory) {
		var pieceMoved = this.get('board').makeMove(fromX, fromY, toX, toY);
		$('#div' + (fromX + fromY * 8)).attr('id', 'div' + (toX + toY * 8));

		if(this.get('history') != null && saveInHistory)
			this.get('history').saveLastMove(fromX, fromY, toX, toY, pieceMoved);

		return pieceMoved;
	},

	// Move the piece on the board with an animation
	makeRedipsMove: function (fromX, fromY, toX, toY) {
		$('#div' + (toX + toY * 8)).remove();
		REDIPS.drag.moveObject({
			id: 'div' + (fromX + fromY * 8),
			target: [0, toY, toX]
		});
	},

	// Init the next turn of the game when there are two players
	nextTurnTwoPlayers: function (fromX, fromY, toX, toY) {
		this.changePlayer();
		this.preventBadDrags();

		var piece = this.makeBoardMove(fromX, fromY, toX, toY, true);
		this.checkGameOver(piece);
	},

	// Init the next turn of the game when there is one player
	nextTurnOnePlayer: function (fromX, fromY, toX, toY) {
		this.changePlayer();
		this.preventAllDrags();
		
		var piece = this.makeBoardMove(fromX, fromY, toX, toY, true);
		this.checkGameOver(piece);

		var bestMove = this.get('ai').returnBestMove(this.get('board'), this.get('current_player_color'));
		this.nextTurnAI(bestMove.get('fromX'), bestMove.get('fromY'), bestMove.get('toX'), bestMove.get('toY'));
	},

	// Init the next turn of the game for the ai
	nextTurnAI: function (fromX, fromY, toX, toY) {
		if (this.get('game_over') == true)
			return;

		this.changePlayer();
		this.preventBadDrags();
		this.makeRedipsMove(fromX, fromY, toX, toY);
		
		var piece = this.makeBoardMove(fromX, fromY, toX, toY, true);
		this.checkGameOver(piece);
	},

	// Check if the game is over
	checkGameOver: function (takenPiece) {
		if (takenPiece.toString() == 'black_king' || takenPiece.toString() == 'white_king')
		{
			var color = this.get('current_player_color') == White ? Black : White;
			alertify.success('The ' + color + ' player won the game');
			this.set({ 'game_over': true });
			this.preventAllDrags();
		}
	}
});