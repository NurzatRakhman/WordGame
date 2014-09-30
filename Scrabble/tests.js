//helpers
function Display(){this.UpdateLetters=function(a){$("#chars").html(a.split("").join(" "))},this.UpdateScore=function(a){$("#score").html(a)},this.AddWordPlayed=function(a,b){$("#words").html($("#words").html()+" "+a+"("+b+")")},this.ClearGuess=function(){$("#txtGuess").val("")},this.SetMessage=function(a){$("#mesgArea").html(a)},this.DisableGuess=function(){$("#bPlayWord").prop("disabled",!0),$("#txtGuess").prop("disabled",!0)},this.SetGameScreen=function(){$("#words").html(""),$("#mesgArea").html(""),$("#bPlayWord").prop("disabled",!1),$("#txtGuess").prop("disabled",!1),this.UpdateScore(0)}}
var display = new Display();
var game = new Game(display);
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var rnd = game.GetRandomLetters();
var hand = new Hand(rnd);
//end of helpers

//TESTS
test( "GetRandomMax", function() {
	var a = GetRandomMax(10);
	ok(a >= 0 && a <= 10, "Returned: " + a);
});
test( "GetLetterScore", function() {
	var sum = 0;
	for (var i = 0; i < alphabet.length; i++) {
		sum += game.GetLetterScore(alphabet[i]);
	};
	ok( sum === 87, "OK!" );
});
test( "GetWordScore", function() {
	var a = game.GetWordScore("kraken");
	ok( a === 84, "OK!");
});
test( "GetRandomLetters", function() {
	var a = game.GetRandomLetters();
	ok( a.length === numberOfLetters, a);
});
test( "CheckWord", function() {
	var a = game.CheckWord("apple");
	ok( a === true, "OK!");
});
test( "GetScore", function() {
	var a = hand.GetScore();
	ok( a === 0, "Works!");
});
test( "GetRemaining", function() {
	var a = hand.GetRemaining();
	ok( a === rnd, a);
});
