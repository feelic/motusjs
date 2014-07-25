function Game () {

	var that = this;

	this.settings = { wordlength : 6, lang : 'fr', difficulty : 'medium', mode : 'vsai'};
	this.players = [];

	//bind le start game au bouton start
	$(document).on( 'click', '#start', function(){
		that.startGame();
		this.blur();
		$(document).keydown(function(e) {
		var element = e.target.nodeName.toLowerCase();
		if (element != 'input' && element != 'textarea') {
			if (e.keyCode === 8) return false;
		}
		});
		$(window).bind('keypress',function(e){if (e.which==8){e.preventDefault();}});
	});

	/*
	 * démarre la partie
	 */
	this.startGame = function () {
		dbl.log('starting game');

		that.end('reset');
		that.clearInfoBox();

		$('#board').html('');

		that.settings.lang = $('#langselect').val();
		that.settings.difficulty = $('#difficultyselect').val();
		that.settings.wordlength = $('#lengthselect').val();
		that.settings.mode = $('#modeselect').val();

		//nettoie le plateau de jeu
		$('#wins').html(this.score);

		this.turn = 0;

		this.players = [];

		//Selon le game mode, crée les Players necessaires
		this.players.push(new Player('human'));

		if(this.settings.mode == 'vsai') {
			this.players.push(new Player('AI'));
		}
		else if(this.settings.mode == 'pvpl') {
			this.players.push(new Player('human'));
		}

		this.startRound();
	}

	this.startRound = function () {
		for (var i = 1; i < 7; i++) {
		$('#board').append('<div id="row'+i+'" class="row"></div>');
			//crée une nouvelle ligne et met des cellules dedans
			for (var j = 0; j < this.settings.wordlength; j++) {
				$('#row'+i).append('<div class="cell"><div  class="cellcontent cell'+j+'"></div></div>');
			}
		}

		//récupère un mot dans la BDD
		async({ 'action' : 'getWord', 'length' : that.settings.wordlength, 'lang' : this.settings.lang },
		function(data){
			that.word = data.word;
			that.firstLetter = data.firstLetter;

			if(that.settings.mode == 'vsai') {
				//récupère le dictionnaire de l'IA
				that.players[1].ai.getDictionnary( that.firstLetter, function() {
					that.players[1].ai.clearNotes();
					//lance le premier tour de jeu
					that.loopindex = 0;
					that.loop();
				});
			}
			else {
				//lance le premier tour de jeu
				that.loopindex = 0;
				that.loop();
			}
		});
	}
	/*
	 * fait tourner le chrono et vérifie que le temps n'est pas écoulé
	 */
	this.tickTimer = function () {
		that.timeLeft--;
		var timedisplay = "";

		if (that.timeLeft<10&&that.timeLeft>0) timedisplay = "0"+that.timeLeft;
		else if (that.timeLeft<=0) timedisplay = "00";
		else timedisplay = ""+that.timeLeft;
		
		$('#chrono').html('00:'+timedisplay);
		if (that.timeLeft<0){
			that.end('lost');
		}
	}

	/*
	 * set le chrono à la valeur indiquée
	 */
	this.setTimeLeft = function (seconds) {
		this.timeLeft=seconds;
	}
	/*
	 * ARRETE LE CHRONO
	 */
	this.stopTimer = function () {
		window.clearTimeout(this.timer);
	}

	/*
	 * compte le nombre d'occurence de chaque caractère dans le mot donné
	 */
	this.countFrequencies = function (word){
		var letableau = new Array();
		for (var k in word) {
			if( typeof letableau [word[k]] != "undefined" ){
				letableau [word[k]]+=1;
			}
			else {
				letableau [word[k]]=1;
			}
		}
		return letableau;
	}

	/*
	 * boucle de jeu
	 */
	this.loop = function () {
		//lance le chrono
		that.timer = setInterval(that.tickTimer,1000);
		that.loopindex++;
		//crée une nouvelle ligne et met des cellules dedans
		for (letterindex in this.word) {
			if(!$('#row'+this.loopindex)) $('#row'+this.loopindex).append('<div class="cell"><div  class="cellcontent cell'+letterindex+'"></div></div>');
			if(letterindex==0){
				$('#row'+this.loopindex+' .cell0').html(this.firstLetter);
			}
		}
		//reset le chrono à 10 sec
		this.setTimeLeft(11);

		this.writeindex = 1;
		
		//Lance le tour du joueur

		dbl.log('turn '+that.loopindex+' : player '+this.turn%this.players.length+' ('+this.players[this.turn%this.players.length].type+')');
		this.players[this.turn%this.players.length].yourTurn();
	}

	/*
	 * envoie la proposition de mot au serveur
	 */
	this.submitWord = function (propword) {

		//stope le chrono
		this.stopTimer();

		//desactive la saisie clavier
		var tplayer = this.players[this.turn%this.players.length];
		tplayer.toggleInput('off');

		this.turn++;
		//verifie existence du mot
		var exists = "";

		async({ 'action' : 'checkWord', 'word' : propword, 'lang' : this.settings.lang },
		function(data){
			if (data.exists == "true") {
				that.getWordCorrection(propword, function(wintest){
					if(wintest) {
						that.end('win');
					}
					else if (that.loopindex > 5){
						that.end('lost');
					}
					else {
						that.loop();
					}
				});
			}
			else {
				if (that.loopindex > 5){
					that.end('lost');
				}
				else {
					$('#info').append('<div class="nexists">Ce mot n\'existe pas ou n\'est pas dans la base<div>');
					that.loop();
				}
			}
		});

	}
	
	this.getWordCorrection = function (propword, callback) {
		//comparaison du mot soumit au mot à trouver
		var c = ""
		var wintest = true;
		
		var decounter = this.countFrequencies(that.word);
		var line = that.loopindex;
		var ccmp = 0;
		this.corrector = setInterval( function () {

		    if (ccmp == that.settings.wordlength) {
		    	window.clearTimeout(that.corrector);
				if(that.settings.mode == 'vsai') that.players[1].ai.refineGuesses();
				if(callback) callback(wintest);
		    }
		    else {
				c = MD5(propword[ccmp]);
	
				if(that.word[ccmp] == c) {
					that.setCellCorrection('#row'+line+' .cell'+ccmp,'true');
					if(that.settings.mode == 'vsai') that.players[1].ai.word[ccmp] = propword[ccmp];
					wintest = wintest&&true;
					decounter[c] = decounter[that.word[ccmp]]-1;
				}
				else {
					wintest = wintest&&false; 
					if(that.settings.mode == 'vsai') that.players[1].ai.itWasNot(propword);
				}

				if(that.word[ccmp] == c) {}
				else if ( that.word.indexOf(c)>=0) {
					if(decounter[c]>0) {
						that.setCellCorrection('#row'+line+' .cell'+ccmp,'mis');
						decounter[c] = decounter[c]-1;
						if(that.settings.mode == 'vsai') that.players[1].ai.addMisplacedLetter(propword[ccmp]);
					}
					else {
						that.setCellCorrection('#row'+line+' .cell'+ccmp,'false');
						if(that.settings.mode == 'vsai') that.players[1].ai.addMissingLetter(propword[ccmp]);
					}
				}
				else {
					that.setCellCorrection('#row'+line+' .cell'+ccmp,'false');
					if(that.settings.mode == 'vsai') that.players[1].ai.addMissingLetter(propword[ccmp]);
				}
				ccmp++;
			}
		},200);
	}

	/*
	 * ARRETE LA PARTIE	
	 */
	this.end = function (status) {
		dbl.log('ending previous games');

		for (var i = 0; i < this.players.length;i++) {
			this.players[i].toggleInput('off');
		}

		//stope le chrono
		this.stopTimer();

		//verifie le statut de fin de jeu
		if (status=="win"){
			this.score ++;
		}
		else if (status == "reset"){

		}
		else if (status == "lost") {
			async({ 'action' : 'theWordWas', 'length' : that.wordlength},
			function(data){
				alert('perdu, c\'était '+data.word);
			});
			this.score = 0;		
		}

	}

	/*
	 * vide la boite de log de partie	
	 */
	this.clearInfoBox = function () {
		dbl.log('clearing info box');
		$('#info').html('');
	}

	this.setCellCorrection = function (cell, correction) {
		$(cell).addClass('c_'+correction);
		
	}

}
