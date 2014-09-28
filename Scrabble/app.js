var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var letterScores = [1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10];
var lettersByFrequency = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
var numberOfLetters = 10;
var filename = "words.txt";

function getRandomInt (min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomMax (max) {
	return Math.floor(Math.random() * max);
}

function Game () 
{
	this.currentHand = Object.create(null);
	
	this.letters = Object.create(null);
	for(var i=0;i<alphabet.length;i++)
	{
		this.letters[alphabet.charAt(i)] = letterScores[i];
	}
	
	this.DoCmd = function()
	{
		// todo when Display is done
	}
	
	this.LoadWords = function(filename) 
	{
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", filename, false);
		rawFile.onreadystatechange = function ()
		{
			if(rawFile.readyState === 4)
			{
				if(rawFile.status === 200 || rawFile.status == 0)
				{
					this.words = " " + rawFile.responseText.toUpperCase() + " ";
				}
			}
		}
		rawFile.send();
	}
	
	this.GetLetterScore = function(letter) 
	{
		return this.letters[letter.toUpperCase()];
	}
	
	this.GetWordScore = function(tmpWord)
	{
		var tmpScore = 0;
		
		for(var i = 0; i<tmpWord.length; i++)
		{
			tmpScore += this.GetLetterScore(tmpWord.charAt(i));
		}
		
		return tmpScore;
	}
	
	this.NewHand = function()
	{
		this.currentHand = new Hand(this.GetRandomLetters());
	}
	
	this.GetRandomLetters = function()
	{
		var randLetters = "";
		for( var i=0; i < numberOfLetters; i++ )
		{	
			randLetters += lettersByFrequency.charAt(getRandomMax(lettersByFrequency.length));
		}
		return randLetters;
	}
	
	this.ReplayHand = function()
	{
		this.currentHand.ResetHand();
	}
	
	this.CheckWord = function(word)
	{
		var wordFound = false;
		
		var pos = words.indexOf(" " + word.toLowerCase() + " ");
		if(pos >= 0)
		{
			wordFound = true;
		}
		return wordFound;
	}
	
	this.EndGame = function()
	{
		// really needed?
	}
}

function Hand(dealtLetters)
{
	this.dealtLetters = dealtLetters;
	this.remaining = dealtLetters;
	this.score = 0;
	
	this.ResetHand = function() 
	{
		this.score = 0;
		this.remaining = this.dealtLetters;
	}

	this.HasLetters = function(guess)
	{
		// probably not needed
	}
	
	this.ScoreWord = function(guess, wordScore)
	{

		var result = 1;

		var tmpRemaining = this.remaining;
		
		for(var i = 0; i<guess.length && result==1; i++)
		{
			var pos = tmpRemaining.indexOf(guess.charAt(i));
			if(pos >= 0)
			{
				if(pos < tmpRemaining.length-1) 
				{
					tmpRemaining = tmpRemaining.substr(0,pos) + tmpRemaining.substr(pos+1,tmpRemaining.length-1);
				}
				else
				{
					tmpRemaining = tmpRemaining.substr(0,pos);
				}
			}
			else
			{
				result = -1;
			}
		}
		
		if(result > -1)
		{
			this.score += wordScore;
			this.remaining = tmpRemaining;
			if(this.remaining.length == 0)
			{
				result = 0;
			}
		}
		
		return result;
		
	}
	
	this.GetScore = function() 
	{
		return this.score;
	}
	
	this.GetRemaining = function()
	{
		return this.remaining;
	}
	
	this.QuitHand = function()
	{
		// really needed?
	}
}


$(function() {
	
	var game = new Game();
	//game.LoadWords();
	game.NewHand();
	
	$('#hLetters').val(game.currentHand.GetRemaining().split("").join(" "));
	$('#chars').html($('#hLetters').val());
	
	$('#bReplay').on('click',function () {
		
		game.currentHand.ResetHand();
		$('#words').html("");
		$("#score").html(0);
		$('#mesgArea').html("");
		$('#bPlayWord').prop("disabled",false);
		$('#txtGuess').prop("disabled",false);
		$('#chars').html($('#hLetters').val());
	
	});
	
	function tryWord() {
		var guessWord = $('#txtGuess').val();
		if(guessWord != "")
		{
			if(game.CheckWord(guessWord))
			{
				var outcome = game.currentHand.ScoreWord(guessWord.toUpperCase(),game.GetWordScore(guessWord));
				if(outcome >= 0)
				{
					$('#words').html($('#words').html() + " " + guessWord);
					$("#score").html(game.currentHand.GetScore());
					$('#chars').html(game.currentHand.GetRemaining().split("").join(" "));
					
					if(outcome == 0)
					{
						$('#mesgArea').html("Hand is fully played.  Your score is " + $('#score').html());
						$('#bPlayWord').prop("disabled",true);
						$('#txtGuess').prop("disabled",true);
					}
				}
				else
				{
					$('#mesgArea').html("You don't have sufficient letters for this word");
				}
			}
			else
			{
				$('#mesgArea').html("Word not found in dictionary list");
			}
			$('#txtGuess').val("");
		}
	
	}
	
	$('#bPlayWord').on('click', tryWord);
	
	$('#txtGuess').on('keypress', function(e)
	{
		if(e.keyCode==13)
		{
			tryWord();
		}
	});
});
