var Q = require('q');
var Timer = module.exports;
var Stopwatch = require('timer-stopwatch');

var countdownCallbacks = [];
var currentTimer = null;
var timerState = 'pre_pomodoro';

Timer.getTimer = function(duration) {
	var deferred = Q.defer();
	setTimeout(function(){		
			deferred.resolve();
		}, duration);

	deferred.cancel = function() {
		deferred.reject();
	}
	return {
		promise : deferred.promise,
		cancel : function() {
			deferred.reject();
		}
	};
}

Timer.cancelCurrentTimer = function() {
	currentTimer.cancel();
}

var endTimer = function(newState, countDown) {
	timerState = newState;
	currentTimer = null;
	console.log('changing to :', timerState);
	countDown.stop();
}

Timer.startTimer = function(duration, duringState, completedState, cancelledState) {
	timerState = duringState;
	countDown = new Stopwatch(duration, {refreshRateMS : 1000});
	countDown.start();
	countDown.onTime(Timer.advanceTick);
	console.log('changing to :', timerState);
	if(currentTimer != null) {
		throw new Error("Can't have multiple timers at once");
	}
	currentTimer = Timer.getTimer(duration);
	currentTimer.promise.then(() => endTimer(completedState, countDown))
	.catch(() => endTimer(cancelledState, countDown))
	return currentTimer.promise;
}

Timer.startBreak = function(){
	return Timer.startTimer(1000 * 60 * 5, 'in_break', 'pre_pomodoro', 'pre_pomodoro');
}

Timer.startPomodoro = function() {
	return Timer.startTimer(1000 * 60 * 25, 'in_pomodoro', 'pre_break', 'pre_pomodoro');
}

Timer.onTick = function(callback) {
	countdownCallbacks.push(callback);
}

Timer.advanceTick = function(time) {
	var formattedTime = getTimeString(time.ms);
	countdownCallbacks.forEach((callback) => callback(time, formattedTime));
}

var stringPadLeft = function(string, pad, length) {
    return (new Array(length + 1).join(pad) +string).slice( - length);
}

var getTimeString = function(milliseconds){
	var seconds = Math.floor(milliseconds / 1000);
	var minutes = Math.floor(seconds / 60);
	var seconds = seconds - minutes * 60;
	return stringPadLeft(minutes,'0', 2)+':'+stringPadLeft(seconds,'0', 2);
}






// Timer.startTimer(1000).then(function(){
// 	Timer.cancelTimer(timer);
// });
