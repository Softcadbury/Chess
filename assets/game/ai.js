"use strict";

/********************************************/
/* IA */
/********************************************/
window.AI = Backbone.Model.extend({
	// Return the best move
	returnBestMove: function (board, current_player_color) {
		var thisObj = this,
			min = -1000000000,
			bestMove;

		board.getPossibleMoves(current_player_color).each(function (move1) {
			var color2 = current_player_color == White ? Black : White,
				pieceTmp1 = board.makeMove(move1.get('fromX'), move1.get('fromY'), move1.get('toX'), move1.get('toY'));

			board.getPossibleMoves(color2).each(function (move2) {
				var pieceTmp2 = board.makeMove(move2.get('fromX'), move2.get('fromY'), move2.get('toX'), move2.get('toY')),
					score = thisObj.evalBoardScore(board, current_player_color);

				if (score > min) {
					min = score;
					bestMove = move1;
				}

				board.undoMove(move2.get('fromX'), move2.get('fromY'), move2.get('toX'), move2.get('toY'), pieceTmp2);
			});

			board.undoMove(move1.get('fromX'), move1.get('fromY'), move1.get('toX'), move1.get('toY'), pieceTmp1);
		});

		return bestMove;
	},

	// Eval the score of the board
	evalBoardScore: function (board, current_player_color) {
		var res = 0;
		var thisObj = this;

		board.each(function (piece, index) {
			if (piece.get('type') != 'empty') {
				var x = index % 8,
					y = Math.floor(index / 8),
					scoreType = 0,
					scorePosition = 0;

				scoreType = thisObj.getScoreType(piece);

				if (piece.get('type') == 'pawn') {
					scorePosition = thisObj.getScorePositionVertical(x);
					scorePosition += thisObj.getScorePositionHorizontal(y);
				}
				else {
					scorePosition = thisObj.getScorePawnPositionVertical(x);
					scorePosition += thisObj.getScorePawnPositionHorizontal(piece.get('color'), y);
				}

				if (piece.get('color') == current_player_color) res += scoreType + scorePosition;
				else res -= scoreType + scorePosition;
			}
		});

		return res;
	},

	// Return the score of the piece, thanks to its type
	getScoreType: function (piece) {
		switch (piece.get('type')) {
			case 'pawn':
				return 100;
			case 'knight':
				return 300;
			case 'bishop':
				return 300;
			case 'rook':
				return 300;
			case 'queen':
				return 900;
			case 'king':
				return 100000;
		}

		return 0;
	},

	// Return the score of the piece, thanks to its vertical position
	getScorePositionVertical: function (x) {
		if (x == 3 || x == 4) return 12;

		if (x == 2 || x == 5) return 8;

		if (x == 1 || x == 6) return 4;

		return 0;
	},

	// Return the score of the piece, thanks to its horizontal position
	getScorePositionHorizontal: function (y) {
		if (y == 3 || y == 4) return 12;

		if (y == 2 || y == 5) return 8;

		if (y == 1 || y == 6) return 4;

		return 0;
	},

	// Return the score of the pawn, thanks to its vertical position
	getScorePawnPositionVertical: function (x) {
		if (x == 0 || x == 7) return 5;

		return 0;
	},

	// Return the score of the pawn, thanks to its horizontal position
	getScorePawnPositionHorizontal: function (color, y) {
		if (color == White) {
			if (y == 2 || y == 3) return 1;

			return y - 2;
		}
		else {
			if (y == 6 || y == 5) return 1;

			return 5 - y;
		}
	}
});