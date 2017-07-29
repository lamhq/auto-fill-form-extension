'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',[])
.controller('DefaultController', function($scope, $timeout) {
	var createRule = function () {
		return {
			"siteRule":"",
			"fieldRule":"",
			"value":""
		};
	};

	$scope.addRule = function () {
		$scope.rules.unshift(createRule());
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
		$scope.rules.forEach(function (rule) {
			delete rule['$$hashKey'];
		});
		var data = JSON.stringify($scope.setting);
		chrome.storage.sync.set({'setting': data }, function() {
			// Send a message to the active tab
			chrome.tabs.query({}, function(tabs) {
				tabs.forEach(function(tab) {
					chrome.tabs.sendMessage(tab.id, {"message": "refresh_setting"});
				});
			});
			$scope.showAlert('Setting saved.');
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

	$scope.doSort = function (attribute) {
		$scope.sortAttr = attribute;
		$scope.reverseSort = !$scope.reverseSort;
	};

	$scope.showAlert = function (message) {
		$scope.alert = message;
		$timeout(function () {
	        $scope.alert = '';
	    },3000);
		$scope.$apply();
	};

	$scope.loadSetting();
	$scope.reverseSort = false;
	$scope.sortAttr = '';
});
