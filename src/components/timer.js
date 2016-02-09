var m = require("mithril");
var Timer = require('../models/timer.js');
const remote = require('electron').remote.require('./electron.js');

var stateMap = {
	'pre_pomodoro' : {
		header : "Pre-Session",
		startEvent : {
			'name' : 'Start Work Session',
			'event' : 'startPomodoro',
		},
		on_change : function() {
			remote.appIcon.setTitle('');
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
		on_change : function() {
			remote.appIcon.setTitle('');
		}
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
		Timer.onTick(function(time, formattedTime){
			console.log("ticking", formattedTime);
			remote.appIcon.setTitle(formattedTime);
		});
		Timer.onChange(function(newState){
			remote.mainWindow.show();
			remote.mainWindow.focus();
			ctrl.timerState = newState;
			if(stateMap[newState]['on_change']) stateMap[newState]['on_change']();
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