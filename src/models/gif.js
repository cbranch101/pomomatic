var Gif = module.exports;

var gifCounts = {
	pre_pomodoro : 4,
	pre_break : 3,
};

var randomlySelectIntInRange = function(min, max) {
// subtract one from the min to include the min in range
	var rangeSize = max - (min - 1);

	// generate a random number within the range
	var randomNumber = (Math.random() * rangeSize) + min;

	// convert to an int
	return Math.floor(randomNumber);

}

Gif.randomlySelectForState = function(state) {
	var index = randomlySelectIntInRange(0, gifCounts[state]);
	return state + '/' +  index + '.gif';
}