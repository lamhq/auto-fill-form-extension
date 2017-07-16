var escapeRegExp = function (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

var stringMatch = function (str, pattern) {
	if ( typeof str !== 'string' ) return false;

	// if rule is not a regex, escape regex characters
	var regex = new RegExp(escapeRegExp(pattern), 'i');

	// if rule is regex string, remove slash character
	var matches = pattern.match(/^regex:(.*?)$/i);
	if ( matches !== null ) {
		regex = new RegExp(matches[1], 'i');
	}
	return str.match(regex) !== null;
};

var getFormRules = function () {
	var rules = [];

	$(fillFormSetting.supportedControls).each(function () {
		var rule = {
			siteRule: window.location.href,
			fieldRule: $(this).attr('name'),
			value: getInputValue($(this))
		}
		var ruleExists = rules.some(function (element, index, array) {
			return element.siteRule==rule.siteRule && element.fieldRule==rule.fieldRule;
		});
		if (!ruleExists) {
			rules.push(rule);
		}
	});	
	
	rules.sort(function (a, b) {
		var cr = a.siteRule.localeCompare(b.siteRule)
		return cr!==0 ? cr : a.fieldRule.localeCompare(b.fieldRule);
	});
	return rules;
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
	var setting = window.fillFormSetting;
	$(setting.supportedControls).each(function () {
		var $input = $(this);
		setting.rules.forEach(function(rule) {
			if ( inputMatchRule($input, rule) ) {
				setInputValue($input, rule.value);
			}
		});
	});	
	console.log('form filled.');
};

var loadSetting = function() {
	chrome.storage.sync.get('setting', function(data) {
		window.fillFormSetting = JSON.parse(data.setting);
	});
};

var saveSetting = function () {
	var data = JSON.stringify(window.fillFormSetting);
	chrome.storage.sync.set({'setting': data });
};

var init = function() {
	$(document).on('keyup', function (e) {
		// alt+a
		if (e.altKey && e.which==65) {
			fillForm();
		}

		// alt+s
		if (e.altKey && e.which==83) {
			getFormRules().forEach(function (rule) {
				window.fillFormSetting.rules.unshift(rule);
				saveSetting();
				console.log('form rules added.');
			});
		}
	});

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			switch (request.message) {
				case 'fill_form':
					fillForm();
					break;
				case 'refresh_setting':
					loadSetting();
					break;
			}
		}
	);

	loadSetting();
};

init();