function getRandomInt(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomMax (max) {
	return Math.floor(Math.random() * max);
}
function getRandomChar()
{
	var text = [];
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var len = getRandomInt(5,10);
	for( var i=0; i < len; i++ ){	
		text.push(possible.charAt(getRandomMax(possible.length)));
	}
	return text;
}
function replay () {
	$('#words').html("");
	$("#score").html(0)
}
$(function() {
	var chars = getRandomChar();
	$('#chars').html(chars.join(" "))
	$('#inp').bind('keypress', function(e) 
	{
		if(e.keyCode==13)
		{
			if (words.indexOf($('#inp').val()) != -1) {
				check = $('#inp').val().split(''); check_c = 0;
				for (var i = 0; i < check.length; i++) {
					if (chars.indexOf(check[i].toUpperCase()) != -1){
						check_c += 1;
					}
				};
				if (check_c == check.length) {
					$('#words').append("<li>"+$('#inp').val()+"</li>")
					$("#score").html(Math.floor($("#score").html())+1)
				};
			};          
		}
	});
});
