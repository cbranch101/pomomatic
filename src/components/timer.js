var m = require("mithril");
var Timer = require('../models/timer.js');
const remote = require('electron').remote.require('./electron.js');

module.exports = {
	controller: function(){
		var ctrl = this;
		ctrl.timerState = 'pre_pomodoro';
		ctrl.inputValue = m.prop("")
		Timer.onTick(function(time, formattedTime){
			remote.appIcon.setTitle(formattedTime);
		});
		Timer.onChange(function(newState){
			ctrl.timerState = newState;
			if(newState === 'pre_pomodoro' || newState === 'pre_break') {
				remote.appIcon.setTitle('');
			}
			m.redraw();
		});
		ctrl.startPomodoro = Timer.startPomodoro;
		ctrl.cancelTimer = Timer.cancelCurrentTimer;
		ctrl.startBreak = Timer.startBreak;
	},

	view: function(ctrl){
		console.log(ctrl);
		return subView(ctrl);
	}
}

var stateMap = {
	'pre_pomodoro' : {
		header : "Pre-Session",
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

var subView = function(ctrl) {
	var state = ctrl.timerState;
	var config = stateMap[state];
	return m("div",
		m("h1", config.header),
		config.startEvent ? m("button.btn.btn-primary-btn-lg.btn-block",
			{onclick : function(){
				ctrl[config.startEvent['event']]();
			}},
			config.startEvent.name
		) : null,
		config.cancelTitle ? m("button.btn.btn-primary-btn-lg.btn-block",
			{onclick : function(){
				ctrl.cancelTimer();
			}},
			config.cancelTitle
		) : null
	)
}