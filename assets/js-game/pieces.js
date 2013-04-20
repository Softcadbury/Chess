"use strict";

/********************************************/
/* Model Piece */
/********************************************/
window.Piece = Backbone.Model.extend({
	defaults: {
		color: null
	},

	// First check before a move
	firstCheck: function (board, color, fromX, fromY, toX, toY) {
		// Error if move out of board
		if (fromX < 0 || fromX > 8 || fromY < 0 && fromY > 8 ||
			toX < 0 && toX > 8 || toY < 0 && toY > 8) return false;

		// Error if start piece not the color of the current player
		if (board.getPiece(fromX, fromY).get('color') != color) return false;

		// Error if end piece of the same color of the current player
		if (board.getPiece(toX, toY).get('color') == color) return false;

		return true;
	},

	// Return true if the move is horizontal
	moveIsVerticalOrHorizontal: function (board, fromX, fromY, toX, toY) {
		var is_move_on_x = (fromX - toX) != 0,
			is_move_on_y = (fromY - toY) != 0;

		return (is_move_on_x != is_move_on_y);
	},

	// Return true if the move is diagonal
	moveIsDiagonal: function (board, fromX, fromY, toX, toY) {
		var val_move_on_x = Math.abs(fromX - toX),
			val_move_on_y = Math.abs(fromY - toY);

		return (val_move_on_x == val_move_on_y);
	},

	// Return true if there is a collision
	checkCollision: function (board, fromX, fromY, toX, toY) {
		// Compute the direction of the move of the piece
		var is_move_on_x = 0;
		if (fromX < toX) is_move_on_x = 1;
		if (fromX > toX) is_move_on_x = -1;

		var is_move_on_y = 0;
		if (fromY < toY) is_move_on_y = 1;
		if (fromY > toY) is_move_on_y = -1;

		// According to the move direction, call the required method
		if (is_move_on_y == 0)
			return this.checkCollisionHorizontal(board, is_move_on_x, fromX, fromY, toX);
		else if (is_move_on_x == 0)
			return this.checkCollisionVertical(board, is_move_on_y, fromX, fromY, toY);
		else
			return this.checkCollisionDiagonal(board, is_move_on_x, is_move_on_y, fromX, fromY, toX, toY);
	},

	// Return true if there is a horizontal collision
	checkCollisionHorizontal: function (board, is_move_on_x, fromX, fromY, toX) {
		if (is_move_on_x < 0) {
			for (var i = fromX + is_move_on_x; i > toX; i += is_move_on_x)
				if (board.getPiece(i, fromY).get('type') != 'empty') return true;
		}
		else {
			for (var i = fromX + is_move_on_x; i < toX; i += is_move_on_x)
				if (board.getPiece(i, fromY).get('type') != 'empty') return true;
		}

		return false;
	},

	// Return true if there is a vertical collision
	checkCollisionVertical: function (board, is_move_on_y, fromX, fromY, toY) {
		if (is_move_on_y < 0) {
			for (var i = fromY + is_move_on_y; i > toY; i += is_move_on_y)
				if (board.getPiece(fromX, i).get('type') != 'empty') return true;
		}
		else {
			for (var i = fromY + is_move_on_y; i < toY; i += is_move_on_y)
				if (board.getPiece(fromX, i).get('type') != 'empty') return true;
		}

		return false;
	},

	// Return true if there is a diagonal collision
	checkCollisionDiagonal: function (board, is_move_on_x, is_move_on_y, fromX, fromY, toX, toY) {
		var j = fromY + is_move_on_y,
			i = fromX + is_move_on_x;

		if (is_move_on_x < 0 && is_move_on_y < 0) {
			for (; i > toX && j > toY; i += is_move_on_x, j += is_move_on_y)
				if (board.getPiece(i, j).get('type') != 'empty') return true;
		}
		else if (is_move_on_x < 0 && is_move_on_y > 0) {
			for (; i > toX && j < toY; i += is_move_on_x, j += is_move_on_y)
				if (board.getPiece(i, j).get('type') != 'empty') return true;
		}
		else if (is_move_on_x > 0 && is_move_on_y < 0) {
			for (; i < toX && j > toY; i += is_move_on_x, j += is_move_on_y)
				if (board.getPiece(i, j).get('type') != 'empty') return true;
		}
		else if (is_move_on_x > 0 && is_move_on_y > 0) {
			for (; i < toX && j < toY; i += is_move_on_x, j += is_move_on_y)
				if (board.getPiece(i, j).get('type') != 'empty') return true;
		}

		return false;
	}
});

/********************************************/
/* Model King */
/********************************************/
window.King = Piece.extend({
	defaults: {
		type: 'king'
	},

	toString: function () {
		return this.get('color') + '_' + this.get('type');
	},

	moveIsCorrect: function (board, color, fromX, fromY, toX, toY) {
		// Nothing happens if the start position equal the end position
		if (fromX == toX && fromY == toY) return true;

		// Error if the first check failed
		if (!this.firstCheck(board, color, fromX, fromY, toX, toY)) return false;

		// Error if the move is more than 1 case
		var val_move_on_x = Math.abs(fromX - toX),
			val_move_on_y = Math.abs(fromY - toY);
		if (val_move_on_x > 1 || val_move_on_y > 1) return false;

		return true;
	}
});

/********************************************/
/* Model Queen */
/********************************************/
window.Queen = Piece.extend({
	defaults: {
		type: 'queen'
	},

	toString: function () {
		return this.get('color') + '_' + this.get('type');
	},

	moveIsCorrect: function (board, color, fromX, fromY, toX, toY) {
		// Nothing happens if the start position equal the end position
		if (fromX == toX && fromY == toY) return true;

		// Error if the first check failed
		if (!this.firstCheck(board, color, fromX, fromY, toX, toY)) return false;

		// Error if the move is not vertical, horizontal or diagonal
		if (!this.moveIsVerticalOrHorizontal(board, fromX, fromY, toX, toY) &&
			!this.moveIsDiagonal(board, fromX, fromY, toX, toY)) return false;

		// Error if there is a collision
		if (this.checkCollision(board, fromX, fromY, toX, toY)) return false;

		return true;
	}
});

/********************************************/
/* Model Bishop */
/********************************************/
window.Bishop = Piece.extend({
	defaults: {
		type: 'bishop'
	},

	toString: function () {
		return this.get('color') + '_' + this.get('type');
	},

	moveIsCorrect: function (board, color, fromX, fromY, toX, toY) {
		// Nothing happens if the start position equal the end position
		if (fromX == toX && fromY == toY) return true;

		// Error if the first check failed
		if (!this.firstCheck(board, color, fromX, fromY, toX, toY)) return false;

		// Error if the move is not diagonal
		if (!this.moveIsDiagonal(board, fromX, fromY, toX, toY)) return false;

		// Error if there is a collision
		if (this.checkCollision(board, fromX, fromY, toX, toY)) return false;

		return true;
	}
});

/********************************************/
/* Model Knight */
/********************************************/
window.Knight = Piece.extend({
	defaults: {
		type: 'knight'
	},

	toString: function () {
		return this.get('color') + '_' + this.get('type');
	},

	moveIsCorrect: function (board, color, fromX, fromY, toX, toY) {
		// Nothing happens if the start position equal the end position
		if (fromX == toX && fromY == toY) return true;

		// Error if the first check failed
		if (!this.firstCheck(board, color, fromX, fromY, toX, toY)) return false;

		// Error if the move is not 1-2 or 2-1
		var val_move_on_x = Math.abs(fromX - toX),
			val_move_on_y = Math.abs(fromY - toY);
		if ((val_move_on_x != 2 || val_move_on_y != 1) &&
			(val_move_on_x != 1 || val_move_on_y != 2)) return false;

		return true;
	}
});

/********************************************/
/* Model Rook */
/********************************************/
window.Rook = Piece.extend({
	defaults: {
		type: 'rook'
	},

	toString: function () {
		return this.get('color') + '_' + this.get('type');
	},

	moveIsCorrect: function (board, color, fromX, fromY, toX, toY) {
		// Nothing happens if the start position equal the end position
		if (fromX == toX && fromY == toY) return true;

		// Error if the first check failed
		if (!this.firstCheck(board, color, fromX, fromY, toX, toY)) return false;

		// Error if the move is not vertical or horizontal
		if (!this.moveIsVerticalOrHorizontal(board, fromX, fromY, toX, toY)) return false;

		// Error if there is a collision
		if (this.checkCollision(board, fromX, fromY, toX, toY)) return false;

		return true;
	}
});

/********************************************/
/* Model Pawn */
/********************************************/
window.Pawn = Piece.extend({
	defaults: {
		type: 'pawn'
	},

	toString: function () {
		return this.get('color') + '_' + this.get('type');
	},

	moveIsCorrect: function (board, color, fromX, fromY, toX, toY) {
		// Nothing happens if the start position equal the end position
		if (fromX == toX && fromY == toY) return true;

		// Error if the first check failed
		if (!this.firstCheck(board, color, fromX, fromY, toX, toY)) return false;

		// Error if move is in bad direction
		var val_move_on_y = fromY - toY;
		if (((color == Black) && val_move_on_y > 0) ||
			((color == White) && val_move_on_y < 0)) return false;

		// Error if the move is > to 1
		if (Math.abs(val_move_on_y) < 1) return false;

		// Error if the move is > to 1 when the pawn is not in the start position
		if (Math.abs(val_move_on_y) > 1) {
			if ((color == Black && fromY != 1) ||
				(color == White && fromY != 6)) return false;

			// Error if the move is > to 2 
			if (Math.abs(val_move_on_y) > 2) return false;
		}

		// Manage capter pawn when the move is on x
		if (fromX - toX != 0) return this.managePawnCapter(board, color, fromX, fromY, toX, toY);

		// Error if the end position is not empty.
		if (board.getPiece(toX, toY).get('type') != 'empty') return false;

		return true;
	},

	managePawnCapter: function (board, color, fromX, fromY, toX, toY) {
		// Error if the move in horizontal is more than 1 case
		if (Math.abs(fromX - toX) != 1) return false;

		// Error if the move in vertical is more than 1 case
		if (Math.abs(fromY - toY) != 1) return false;

		// Error if the end position is empty.
		if (board.getPiece(toX, toY).get('type') == 'empty') return false;

		return true;
	}
});

/********************************************/
/* Model Empty */
/********************************************/
window.Empty = Piece.extend({
	defaults: {
		type: 'empty'
	},

	toString: function () {
		return "";
	},

	moveIsCorrect: function (board, color, fromX, fromY, toX, toY) {
		return false;
	}
});

/********************************************/
/* Collection Board */
/********************************************/
window.Board = Backbone.Collection.extend({
	model: Piece,

	// Get the specific piece
	getPiece: function (x, y) {
		return this.models[y * 8 + x];
	},

	// Set the specific piece
	setPiece: function (x, y, model) {
		this.models[y * 8 + x] = model;
	},

    // Move the specific piece
	makeMove: function (fromX, fromY, toX, toY) {
		var tmp = this.models[toY * 8 + toX];
		this.models[toY * 8 + toX] = this.models[fromY * 8 + fromX];
		this.models[fromY * 8 + fromX] = new Empty();
		return tmp;
	},

	// Undo a move
	undoMove : function(fromX, fromY, toX, toY, model) {
		this.models[fromY * 8 + fromX] = this.models[toY * 8 + toX];
		this.models[toY * 8 + toX] = model;
    },

	// Return a list of possible move
	getPossibleMoves: function (current_player_color) {
		var self = this,
			possibleMoves = new Moves();

		this.each(function (piece, index) {
			if (piece.get('color') == current_player_color) {
				for (var toPos = 0; toPos < 64; toPos++) {
					if (index != toPos && piece.moveIsCorrect(self, current_player_color,
						index % 8, Math.floor(index / 8), toPos % 8, Math.floor(toPos / 8))) {
						possibleMoves.add(new Move({
							fromX: index % 8,
							fromY: Math.floor(index / 8),
							toX: toPos % 8,
							toY: Math.floor(toPos / 8)
						}));
					}
				}
			}
		});

		return possibleMoves;
	}
});

/********************************************/
/* Model Move */
/********************************************/
window.Move = Backbone.Model.extend({
	defaults: {
		fromX: null,
		fromY: null,
		toX: null,
		toY: null
	}
});

/********************************************/
/* Collection Moves */
/********************************************/
window.Moves = Backbone.Collection.extend({
	model: Move
});