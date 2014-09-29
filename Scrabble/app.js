// global variables
// each letter of the alphabet listed once
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// scrabble letter scores for each letter in order
var letterScores = [1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10];
// letters weighted by scrabble frequency - this is so we get vowels more often and Z and Q, not so much
var lettersByFrequency = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
// number of letters to play
var numberOfLetters = 7;
// number of points to give if one gets all original dealt letters in one word
var bonusScore = 50;

// helper function to get a random integer in the range - not currently used
function GetRandomInt (min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// helper function to get random number between 0 and "max"
function GetRandomMax (max) {
	return Math.floor(Math.random() * max);
}

// class Game - class diagram provided in diagram PDF - main class that controls game play
function Game (display) 
{
	// instance of jQuery enabled display class
	this.display = display;
	
	// the current hand of dealt letters
	this.currentHand = Object.create(null);
	
	// associative array of letter scores by letter
	this.letters = Object.create(null);
	for(var i=0;i<alphabet.length;i++)
	{
		this.letters[alphabet.charAt(i)] = letterScores[i];
	}
	
	// function to handle user actions
	this.DoCmd = function(strCmd, strParam)
	{
		// triggered by replay button - restart the current hand 
		if(strCmd == "replay")
		{
			// resets without changing dealt letters
			this.currentHand.ResetHand();
			// clears display elements back to game start
			this.display.SetGameScreen();
			// display the dealt letters
			this.display.UpdateLetters(this.currentHand.GetRemaining());
		}
		
		// triggered by clicking the new button - restart a new game
		else if(strCmd == "new")
		{
			// just reload the page
			location.reload();
		}
		
		// try to play the word entered in the guess box
		else if(strCmd == "play-word")
		{
			// clear any old messages
			this.display.SetMessage("");
			// change guess name for clarity
			var guessWord = strParam;
			// ignore everything if no word was passed
			if(guessWord != "")
			{
				// make sure the word exists in the dictionary list (words.js)
				if(this.CheckWord(guessWord))
				{
					// try to score the word with the current hand - returns 1=remaining letters, 
					// 0=no more letters, -1=not enough letters for this word
					var outcome = this.currentHand.ScoreWord(guessWord.toUpperCase(),this.GetWordScore(guessWord));
					if(outcome >= 0)
					{
						// the word is good so add it to the display and update score and remaining letters
						this.display.AddWordPlayed(guessWord,this.GetWordScore(guessWord));
						this.display.UpdateScore(this.currentHand.GetScore());
						this.display.UpdateLetters(this.currentHand.GetRemaining());
					
						// if no remaining letters then this hand is done
						if(outcome == 0)
						{
							this.display.SetMessage("Hand is fully played.  Your score is " + this.currentHand.GetScore());
							this.display.DisableGuess();
						}
					}
					// not sufficient letters in hand to make this word
					else
					{
						this.display.SetMessage("You don't have sufficient letters for this word");
					}
				}
				// guessed word is not a valid word (based on the dictionary list)
				else
				{
					this.display.SetMessage("Word not found in dictionary list");
				}
				// no matter what happened clear the guess box
				this.display.ClearGuess();
			}	
		}
	}
	
	// get the score for a specific letter
	this.GetLetterScore = function(letter) 
	{
		return this.letters[letter.toUpperCase()];
	}
	
	// get the word score for a full word
	this.GetWordScore = function(tmpWord)
	{
		var tmpScore = 0;
		
		// add the letter scores for each letter in this word
		for(var i = 0; i<tmpWord.length; i++)
		{
			tmpScore += this.GetLetterScore(tmpWord.charAt(i));
		}
		
		// multiple the letter score sum by the word length
		tmpScore *= tmpWord.length;
		// if all original letters were used then add the bonus score
		if(tmpWord.length == numberOfLetters)
		{
			tmpScore += bonusScore;
		}
		return tmpScore;
	}
	
	// deal a new hand
	this.NewHand = function()
	{
		// generate random set of letters and instantiate the new hand
		this.currentHand = new Hand(this.GetRandomLetters());
		// set all the display elements to their start values/configurations
		this.display.SetGameScreen();
		// show the random letters that were dealt
		this.display.UpdateLetters(this.currentHand.GetRemaining());
	}
	
	// deal out random letters
	this.GetRandomLetters = function()
	{
		var randLetters = "";
		// deal out a number of random letters determined by the global numberOfLetters 
		//  and using the scrabble letter frequency
		for( var i=0; i < numberOfLetters; i++ )
		{	
			randLetters += lettersByFrequency.charAt(GetRandomMax(lettersByFrequency.length));
		}
		return randLetters;
	}
	
	// see if a word is in the dictionary list
	this.CheckWord = function(word)
	{
		var wordFound = false;
		
		// search through the list which is just a giant string with words separated by spaces
		var pos = words.indexOf(" " + word.toLowerCase() + " ");
		if(pos >= 0)
		{
			wordFound = true;
		}
		return wordFound;
	}
	
}

// class Hand - represents a specific instance of the game with a specific set of dealt letters
function Hand(dealtLetters)
{
	// the original dealt letters
	this.dealtLetters = dealtLetters;
	// the remaining letters (starts out the same as the original dealt ones)
	this.remaining = dealtLetters;
	this.score = 0;
	
	// resets the hand with the original letters
	this.ResetHand = function() 
	{
		this.score = 0;
		this.remaining = this.dealtLetters;
	}

	// tries to use the word (with score) that has been guessed and validated in the dictionary list
	this.ScoreWord = function(guess, wordScore)
	{
		// assume sufficient letters in hand
		var result = 1;

		// temporary hand of letters representing the hand as each letter of the word is removed 
		//  necessary to solve problem with multiples of the same letter in the word
		var tmpRemaining = this.remaining;
		
		// for each letter in the guess
		for(var i = 0; i<guess.length && result==1; i++)
		{
			// find if the letter remains in the temporary hand
			var pos = tmpRemaining.indexOf(guess.charAt(i));
			if(pos >= 0)
			{
				// if it remains remove it
				if(pos < tmpRemaining.length-1) 
				{
					tmpRemaining = tmpRemaining.substr(0,pos) + tmpRemaining.substr(pos+1,tmpRemaining.length-1);
				}
				else
				{
					tmpRemaining = tmpRemaining.substr(0,pos);
				}
			}
			// if the letter doesn't remain in the temporary hand
			//  then the guess is no good
			else
			{
				result = -1;
			}
		}
		
		// if the guess was good then update the actual hand and the score
		if(result > -1)
		{
			this.score += wordScore;
			this.remaining = tmpRemaining;
			if(this.remaining.length == 0)
			{
				result = 0;
			}
		}
		
		// return an integer code indicating the outcome:
		// -1 = no good
		// 0 = good and no letters remain in hand
		// 1 = good and letters remain
		return result;
		
	}
	
	// return the current score
	this.GetScore = function() 
	{
		return this.score;
	}
	
	// return the current remaining letters
	this.GetRemaining = function()
	{
		return this.remaining;
	}
	
}

// the jQuery base object
$(function() {
	
	// define the display class here so there are no issues accessing the jQuery objects
	function Display() 
	{
		// update the letters in hand display element
		this.UpdateLetters = function(strRemaining)
		{
			$('#chars').html(strRemaining.split("").join(" "));
		}
		
		// update the sore display element
		this.UpdateScore = function(intScore)
		{
			$('#score').html(intScore);
		}
		
		// update the played words display element
		this.AddWordPlayed = function(strGuessWord,intWordScore)
		{
			$('#words').html($('#words').html() + " " + strGuessWord + "(" + intWordScore + ")");
		}
		
		// clear the guess box
		this.ClearGuess = function()
		{
			$('#txtGuess').val("");
		}
		
		// set a message in the message display element
		this.SetMessage = function(strMesg)
		{
			$('#mesgArea').html(strMesg);
		}
		
		// disable the guess box and play word button - used when all letters have been played
		this.DisableGuess = function()
		{
			$('#bPlayWord').prop("disabled",true);
			$('#txtGuess').prop("disabled",true);			
		}

		// resets all the display elements to their original states
		this.SetGameScreen = function() 
		{
			$('#words').html("");
			$('#mesgArea').html("");
			$('#bPlayWord').prop("disabled",false);
			$('#txtGuess').prop("disabled",false);
			this.UpdateScore(0);
		}
				
	}
	
	// the actual instance of the display class
	var display = new Display();

	// the actual instance of the game class
	var game = new Game(display);
	// generate a new hand to start the game
	game.NewHand();
	
	// set the replay button to the appropriate game command
	$('#bReplay').on('click',function() 
	{
		game.DoCmd("replay","");
	});
	
	// set the new button to the appropriate game command
	$('#bNew').on('click',function()
	{
		game.DoCmd("new","");
	});
		
	// set the play button to the appropriate game command
	$('#bPlayWord').on('click', function() 
	{
		game.DoCmd("play-word",$('#txtGuess').val());
	});
	
	// set the enter key within the guess box to the appropriate game command
	$('#txtGuess').on('keypress', function(e)
	{
		if(e.keyCode==13)
		{
			game.DoCmd("play-word",$('#txtGuess').val());
		}
	});
	
});
