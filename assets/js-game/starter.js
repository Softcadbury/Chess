"use strict";

/********************************************/
/* Constants */
/********************************************/
var Black = 'black',
    White = 'white';

/********************************************/
/* Init */
/********************************************/
$(document).ready(function () {
	var game = new Game();
	$('#new-game').click(function() {
		// Select the type of game, one or two players
		if ($('input:radio[name=playerMode]:checked').val() == 'one')
			game.startOnePlayerGame();
		else if ($('input:radio[name=playerMode]:checked').val() == 'two')
			game.startTwoPlayersGame();

		// Allow or not undo functionality
		if ($('input:checkbox[name=history]:checked').val() == 'allow')			
			game.enableUndo();
		else			
			game.disableUndo();
	});
});