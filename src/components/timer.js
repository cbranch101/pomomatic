var m = require("mithril");
const remote = require('electron').remote.require('./electron.js');
var Timer = remote.Timer;
var Gif = require('../models/gif.js');

var stateMap = {
	'pre_pomodoro' : {
		header : "Get Ready",
		startEvent : {
			'name' : 'Start Work Session',
			'event' : 'startPomodoro',
		},
	},
	'in_pomodoro' : {
		header : "In Session",
		cancelTitle : "Cancel Session", 
	},
	'pre_break' : {
		header : "Pomodoro Finished",
		startEvent : {
			'name' : 'Start Break',
			'event' : 'startBreak',
		},
	},
	'in_break' : {
		header : "On Break",
		cancelTitle : "Cancel Break",
	},
};

module.exports = {
	controller: function(){
		var ctrl = this;
		ctrl.timerState = 'pre_pomodoro';
		ctrl.inputValue = m.prop("")
		Timer.onChange(function(newState){
			ctrl.timerState = newState;
			if(stateMap[newState]['on_change']) stateMap[newState]['on_change']();
			m.redraw();
		});
		Timer.onTick(function(time, formattedTime){
			ctrl.currentTime = formattedTime;
			m.redraw();
		})
		ctrl.startPomodoro = Timer.startPomodoro;
		ctrl.cancelTimer = Timer.cancelCurrentTimer;
		ctrl.startBreak = Timer.startBreak;
	},

	view: function(ctrl){
		return subView(ctrl);
	}
}

var gifView = function(state) {
	var stateHasGif = state === 'pre_pomodoro' || state ==='pre_break';
	if(stateHasGif) {
		var gifPath = Gif.randomlySelectForState(state);
		return m("img.text-center", {src : "src/assets/" + gifPath})
	} else {
		return null;
	}
}

var startButton = function(ctrl, config) {
	return config.startEvent ? m("button.btn.btn-primary-btn-lg",
		{onclick : function(){
			ctrl[config.startEvent['event']]();
		}},
		config.startEvent.name
	) : null;
}

var cancelButton = function(ctrl, config) {
	return config.cancelTitle ? m("button.btn.btn-primary-btn-lg",
		{onclick : function(){
			ctrl.cancelTimer();
		}},
		config.cancelTitle
	) : null;
}

var subView = function(ctrl) {
	var state = ctrl.timerState;
	var config = stateMap[state];
	return m("div.window-container", [
		m("h1.popup-header.text-center", config.header),
		clockView(ctrl, state),
		m("div.text-center", gifView(state)),
		m("div.text-center.button-container", [
			
			startButton(ctrl, config),
			cancelButton(ctrl, config),
		])
	]);
}

var clockView = function(ctrl, state) {
	var stateHasClock = state === 'in_pomodoro' || state === 'in_break';
	return stateHasClock ? m('h3.text-center', ctrl.currentTime) : null;
}

