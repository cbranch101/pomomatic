var m = require("mithril")

module.exports = {
	controller: function(){
		this.inputValue = m.prop("")
	},

	view: function(ctrl){
		return m("div",

			m("h1", "New"),
			m("div.input-group",

					m("span.input-group-addon#addon","Label: "),
					m("input[type=text].form-control",{
						inputValue: ctrl.inputValue(),
						oninput: m.withAttr("value", ctrl.inputValue),
						placeholder: "Edit src/components/example live!"
					}, "")

			)
		)
	}
}