var Q = require('q');
var Timer = module.exports;
var Stopwatch = require('timer-stopwatch');
const ipcRenderer = require('electron').ipcRenderer;

var countdownCallbacks = [];
var changeCallbacks = [];
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

Timer.getState = function() {
	return timerState;
}

Timer.cancelCurrentTimer = function() {
	currentTimer.cancel();
}

var endTimer = function(newState, countDown) {
	currentTimer = null;
	console.log('changing to :', timerState);
	countDown.stop();
	Timer.changeState(newState);
}

Timer.changeState = function(newState) {
	timerState = newState;
	changeCallbacks.forEach(function(callback){
		callback(timerState);
	});
}

Timer.startTimer = function(duration, duringState, completedState, cancelledState) {
	Timer.changeState(duringState);
	countDown = new Stopwatch(duration, {refreshRateMS : 1000});
	countDown.start();
	countDown.onTime(Timer.advanceTick);
	console.log('changing to :', timerState);
	if(currentTimer != null) {
		throw new Error("Can't have multiple timers at once");
	}
	currentTimer = Timer.getTimer(duration);
	currentTimer.promise.then(function(){
		endTimer(completedState, countDown)
	})
	.catch(function(){
		endTimer(cancelledState, countDown);
	})
	return currentTimer.promise;
}

Timer.startBreak = function(){
	var duration = 1000 * 60 * 5;
	return Timer.startTimer(5000, 'in_break', 'pre_pomodoro', 'pre_pomodoro');
}

Timer.startPomodoro = function() {
	var duration = 1000 * 60 * 25;
	return Timer.startTimer(10000, 'in_pomodoro', 'pre_break', 'pre_pomodoro');
}

Timer.onTick = function(callback) {
	countdownCallbacks.push(callback);
}

Timer.advanceTick = function(time){
	var formattedTime = getTimeString(time.ms);
	countdownCallbacks.forEach(function(callback){
		callback(time, formattedTime);
	});
}

Timer.onChange = function(callback) {
	changeCallbacks.push(callback);
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



