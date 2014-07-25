function Player (type) {

	this.type = type;
	this.score = 0;

	if (this.type == 'AI') {
		this.ai = new AI();
	}

	/*
	 * Previent le jouer que c'est son tour 
	 */
	this.yourTurn = function () {

		if (this.type == 'AI') {
			this.guessAndSubmit();
		}
		else {
			this.toggleInput('on');
		}
	}

	/*
     * active ou desactive le keyboard handler
	 */
	this.toggleInput = function (p) {
		if (p == 'on') $(window).bind('keyup',this.keyboardHandler);
		else $(window).unbind('keyup',this.keyboardHandler);
	}

	/*
	 * function qui gère les inputs pendant la partie, activé desactivé par toggleUserInput
	 */
	this.keyboardHandler = function(e) {
		var key = e.which;
		if (key==8){
			if(game.writeindex>0) game.writeindex--;
			$('#row'+game.loopindex+' .cell'+game.writeindex).html('');
		}
		else if (key==13){
		//submit (entrée) le mot
			e.preventDefault();
			if(game.writeindex == game.settings.wordlength){
				var propword = new Array();
				for (var k =0; k < game.settings.wordlength; k++) {
					propword[k] = $('#row'+game.loopindex+' .cell'+k).html();
				}
				game.submitWord(propword.join(''));
			}
		}
		else if (key>=65&&key<=90){
		//majuscule : passage en bas de casse
			key += 32;
			if(game.writeindex<game.settings.wordlength) {
				$('#row'+game.loopindex+' .cell'+game.writeindex).html(String.fromCharCode(key));
				game.writeindex++;
			}
		}
		else if (key>=97&&key<=122){
		//normal
			if(game.writeindex<game.settings.wordlengthh) {
				$('#row'+game.loopindex+' .cell'+game.writeindex).html(String.fromCharCode(key));
				game.writeindex++;
			}
		}
		else {
			$('#info').append('Caractère non autorisé<br/>');
		}
	}

	/*
	 * Le joueur IA propose un mot, l'écrit sur le board et le soumet
	 */
	this.guessAndSubmit = function () {
		this.ai.writeGuess(game.loopindex,function(propword){
			game.submitWord(propword);		
		});
	}

	/*
	 * Augmente le score du joueur
	 */
	this.youGetAPoint = function () {
		this.score++;
	}
}
