function AI () {
	
	var that = this;

	this.dictionnary = [];

	this.alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

	/*
	 * Envoie une requete au serveur, demandant le dictionnaire correspondant aux paramètres de l'IA
	 */
	this.getDictionnary = function( letter, callback ) {
		//récupère un dictionnaire dans la BDD
		async({ 'action' : 'getDictionnary', 'length' : game.settings.wordlength, 'lang' : game.settings.lang, 'letter' : letter },
		function(data){
			that.dictionnary = data.dictionnary;
			dbl.log('AI base guess dictionnary : '+that.dictionnary.length+' words');
			if (callback) callback();
		});
	}

	/*
	 * Crée les tableaux d'indices, ou vide ceux déjà existants
	 */
	this.clearNotes = function() {
		this.word = {};
		this.misp = [];
		this.miss = [];
	}

	/*
	 * Ajoute une lettre au tableau des lettres mal placées
	 */
	this.addMisplacedLetter = function (l) {
		if ($.inArray(l,this.misp)==-1) this.misp.push(l);	
	}
	
	/*
	 * Ajoute une lettre au tableau des lettres absentes du mot
	 */
	this.addMissingLetter = function (l) {
		if (!this.letterIsInTheWord(l) && ($.inArray(l,this.miss)==-1) && ($.inArray(l,this.misp)==-1) ) this.miss.push(l);
	}
	
	this.letterIsInTheWord = function ( l ) {
	  	for (k in this.word) {
		    if (this.word[k] == l) {
		        return true;
		    }
		}
	}
	
	/*
	 * Matche le dictionnaire de guesses avec les indices enregistrés pour raffiner la selection
	 */
	this.refineGuesses = function() {
		dbl.log('dictionnary before refining: '+this.dictionnary.length+' words');
		if (this.dictionnary.length<5) dbl.log(this.dictionnary);
		dbl.log(this.miss)
		dbl.log(this.misp)
		var guesses = [];
		if (game.settings.difficulty == 'easy') {
			var exp = '';

			var charlist = '[a-z]';
		
			for (var i = 0; i< game.settings.wordlength; i ++) {
				if (this.word[i]) exp+=this.word[i];
				else exp += charlist;
			}

			var guess = new RegExp (exp,'g')
		
			// for (var i = 0; i < 10; i ++) {
			for (var i = 0; i < this.dictionnary.length; i ++) {
				if(this.dictionnary[i].match(guess)) {
					guesses.push(this.dictionnary[i])
				}
			}
		}
		if (game.settings.difficulty == 'medium') {
			var exp = '';

			var charlist = '[';
			for (var i = 0; i < this.alphabet.length; i ++) {
				if ($.inArray(this.alphabet[i],this.miss)==-1) charlist += this.alphabet[i];
			}
			charlist += ']';
		
			for (var i = 0; i< game.settings.wordlength; i ++) {
				if (this.word[i]) exp+=this.word[i];
				else exp += charlist;
			}
			
			var guess = new RegExp (exp,'g')
		
			// for (var i = 0; i < 10; i ++) {
			for (var i = 0; i < this.dictionnary.length; i ++) {
				if(this.dictionnary[i].match(guess)) {
					guesses.push(this.dictionnary[i])
				}
			}
		}
		dbl.log('regexp : '+exp);
		this.dictionnary = guesses;

		dbl.log('Refined dictionnary : '+this.dictionnary.length+' words');
		if (this.dictionnary.length<5) dbl.log(this.dictionnary);

	}

	/*
	 * Récupère un mot au hasard parmi le tableau des guesses
	 */
	this.guessWord = function () {
		//dbl.log('guesssing from '+this.dictionnary.length+' words');
		return this.dictionnary[Math.floor(Math.random() * (this.dictionnary.length-1))];
	}

	/*
	 * Essaie de deviner un mot et l'écrit sur le gameboard
	 */
	this.writeGuess = function (loopindex, callback) {
		var guess = this.guessWord();
		if (guess) {
			this.typecmp = 0;
			this.typer = setInterval( function () {
		        if (that.typecmp == guess.length) {
		            window.clearTimeout(that.typer);
					if (callback) callback(guess);
		        }
		        else {
					$('#row'+loopindex+' .cell'+that.typecmp).html(guess.charAt(that.typecmp));
		            that.typecmp++;
		        }
			},200);
		}
		else if (callback) callback ('');
	}
	
	this.itWasNot = function (word) {
		
		if(that.dictionnary[that.dictionnary.indexOf(word)] == word) {
			dbl.log('splicing :'+that.dictionnary[that.dictionnary.indexOf(word)])
			that.dictionnary.splice(that.dictionnary.indexOf(word),1);
		}
	}
}
