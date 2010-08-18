/**
 * @namespace
 * @name validity
 */
var validity = (function(validity) {
	var core = {};

	//	Public methods

	/**
	 * @method
	 * @public
	 * @name dispatch
	 */
	core.dispatch = function(request, sender, sendResponse) {
		switch(request['action']) {
			case 'validate':
				core.validate(sender);
				break;
			default:
				throw 'Empty or invalid request: ' + request['action'];
		}
	};

	//	Private Functions

	/**
	* @function
	* @private
	*/
	core.validate = function(tab) {
		//	Fetch source
		validity.net.getSource(tab, function(source) {
			//	Submit source to validator
			validity.net.submitValidation(tab, source, function(tab, messages) {
				chrome.tabs.sendRequest(tab.id, messages);
			});
		});
	}

	core._init = function() {
		//	Listen for requests from content script
		chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
			/*!debug*/
			console.info(request);
			console.info(sender);
			/*gubed!*/
			//	Pass request to the dispatch method
			core.dispatch(request, sender, sendResponse);
		});

		//	Set up page action events
		chrome.pageAction.onClicked.addListener(function(tab) {
			core.validate(tab);
		});

		//	Set up new tab event
		chrome.tabs.onCreated.addListener(function(tab) {
			var hosts = [],
				tabHost;

			/*!debug*/
			console.info(tab.url);
			/*gubed!*/

			if (localStorage['validateHosts'] !== undefined) {
				hosts = localStorage['validateHosts'].split('');
			}

			tabHost = validity.util.getHost(tab.url);

			//	Auto validate if
			if (hosts.indexOf(tabHost)) {
				core.validate(tab);
			}
		});
	}

	validity.core = core;
	return validity;
})(validity || {});