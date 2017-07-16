'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp',[])
.controller('DefaultController', function($scope) {
	$scope.fillForm = function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, {"message": "fill_form"});
		});
	};

	$scope.manage = function() {
		chrome.runtime.openOptionsPage();
	};
});
