'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',[])
.controller('DefaultController', function($scope) {
	var createRule = function () {
		return {
			"siteRule":"",
			"fieldRule":"",
			"value":""
		};
	};


	$scope.addRule = function () {
		$scope.rules.push(createRule());
	};

	$scope.deleteRule = function (rule) {
		var index = $scope.rules.indexOf(rule);
		if (index > -1) {
		    $scope.rules.splice(index, 1);
		};
	};

	$scope.toggleSelect = function ($event) {
		var checked = $event.currentTarget.checked;
		$scope.rules.forEach(function (rule) {
			rule.selected = checked;
		});
	};

	$scope.saveSetting = function () {
		var data = JSON.stringify($scope.setting);
		chrome.storage.sync.set({'setting': data }, function() {
			// Send a message to the active tab
			chrome.tabs.query({}, function(tabs) {
				tabs.forEach(function(tab) {
					chrome.tabs.sendMessage(tab.id, {"message": "refresh_setting"});
				});
			});
			console.log('setting saved');
		});
	};

	$scope.loadSetting = function () {
		$scope.rules = [];
		chrome.storage.sync.get('setting', function(data) {
			$scope.setting = JSON.parse(data.setting);
			$scope.rules = $scope.setting.rules;
			$scope.$apply();
		});
	};

	$scope.loadSetting();
});
