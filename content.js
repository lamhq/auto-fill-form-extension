var escapeRegExp = function (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var stringMatch = function (str, pattern) {
	if ( typeof str !== 'string' ) return false;

	// if rule is not a regex, escape regex characters
	var regex = new RegExp(escapeRegExp(pattern), 'i');

	// if rule is regex string, remove slash character
	var matches = pattern.match(/^\/(.*?)\/$/i);
	if ( matches !== null ) {
		regex = new RegExp(matches[1], 'i');
	}
	return str.match(regex) !== null;
};

var getSettingTemplate = function () {
	var setting = { rules: [] };

	$(fillFormSetting.supportedControls).each(function () {
		var rule = {
			siteRule: window.location.href,
			fieldRule: $(this).attr('name'),
			value: getInputValue($(this))
		}
		var ruleExists = setting.rules.some(function (element, index, array) {
			return element.siteRule==rule.siteRule && element.fieldRule==rule.fieldRule;
		});
		if (!ruleExists) {
			setting.rules.push(rule);
		}
	});	
	setting.rules.sort(function (a, b) {
		var cr = a.siteRule.localeCompare(b.siteRule)
		return cr!==0 ? cr : a.fieldRule.localeCompare(b.fieldRule);
	});
	return JSON.stringify(setting);
};

var getInputValue = function ($input) {
	if ($input.is('textarea')) {
		return $input.text();
	} else if ( $input.is(':checkbox') || $input.is(':radio') ) {
		return $input.prop('checked');
	}
	return $input.val();
};

var setInputValue = function ($input, value) {
	if ($input.is('textarea')) {
		return $input.text(value);
	} else if ( $input.is(':checkbox') || $input.is(':radio') ) {
		return $input.prop('checked', value);
	}
	return $input.val(value);
}

var inputMatchRule = function ($input, rule) {
	var matchSiteRule = stringMatch(location.href, rule.siteRule);
	var matchFieldRule = ['name','id'].some(function (attr) {
		return stringMatch($input.attr(attr), rule.fieldRule);
	});
	return matchSiteRule && matchFieldRule;
};

var fillForm = function() {
	$(fillFormSetting.supportedControls).each(function () {
		var $input = $(this);
		fillFormSetting.rules.forEach(function(rule) {
			if ( inputMatchRule($input, rule) ) {
				setInputValue($input, rule.value);
			}
		});
	});	
	console.log('form filled.');
};

$(document).on('keyup', function (e) {
	// alt+a
	if (e.altKey && e.which==65) {
		fillForm();
	}

	// alt+s
	if (e.altKey && e.which==83) {
		var $textarea = $('<textarea></textarea>').val(getSettingTemplate());
		$textarea.prependTo($('body'));
	}
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if( request.message === "fill_form" ) {
			fillForm();
		}
	}
);