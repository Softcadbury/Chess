/********************************************/
/* Model MoveInfo */
/********************************************/
window.MoveInfo = Backbone.Model.extend({
	defaults: {
		fromX: null,
		fromY: null,
		toX: null,
		toY: null,
		pieceMoved: null
	}
});

/********************************************/
/* Collection History */
/********************************************/
window.History = Backbone.Collection.extend({
	model: MoveInfo,

	saveLastMove: function (fromX, fromY, toX, toY, pieceMoved) {
		this.add(new MoveInfo({ fromX: fromX, fromY: fromY, toX: toX, toY: toY, pieceMoved: pieceMoved }));
	},

	undoLastMove: function (game) {
		if (this.length < 1)
			return;

		var moveInfo = this.pop();
		
		game.makeRedipsMove(moveInfo.get('toX'), moveInfo.get('toY'), moveInfo.get('fromX'), moveInfo.get('fromY'));
		game.makeBoardMove(moveInfo.get('toX'), moveInfo.get('toY'), moveInfo.get('fromX'), moveInfo.get('fromY'), false);

		var pieceMoved = moveInfo.get('pieceMoved').toString(),
			indexPieceMoved = moveInfo.get('toX') + moveInfo.get('toY') * 8;

		if (pieceMoved != '') {
			game.get('board').setPiece(moveInfo.get('toX'), moveInfo.get('toY'), moveInfo.get('pieceMoved'));
			setTimeout(function() {
				$('#td' + indexPieceMoved).html('<div class="drag" id="div' + indexPieceMoved +
												'"><div class="piece ' + pieceMoved + '" /></div>');
				game.initRedips();
			}, 200);
		}
	},
});