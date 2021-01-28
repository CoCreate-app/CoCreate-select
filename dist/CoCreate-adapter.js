(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CoCreateAdapter"] = factory();
	else
		root["CoCreateAdapter"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./CoCreate-components/CoCreate-select/src/CoCreate-adapter.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./CoCreate-components/CoCreate-select/src/CoCreate-adapter.js":
/*!*********************************************************************!*\
  !*** ./CoCreate-components/CoCreate-select/src/CoCreate-adapter.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nvar CoCreateSelectAdapter = {\n  init: function init() {\n    this.initElement();\n\n    this.__initEvents();\n  },\n  initElement: function initElement(container) {\n    var mainContainer = container || document;\n\n    if (!mainContainer.querySelectorAll) {\n      return;\n    }\n\n    var containerList = mainContainer.querySelectorAll('cocreate-select, div.select--field');\n\n    for (var i = 0; i < containerList.length; i++) {\n      CoCreateSelect.__initSelect(containerList[i]);\n\n      this.__initElementEvent(containerList[i]);\n    }\n  },\n  __initEvents: function __initEvents() {\n    var self = this;\n    document.addEventListener('dndsuccess', function (e) {\n      var _e$detail = e.detail,\n          dropedEl = _e$detail.dropedEl,\n          dragedEl = _e$detail.dragedEl;\n\n      if (typeof dropedEl.tagName != 'undefined' && dropedEl.tagName.toLowerCase() == 'cocreate-select' || dropedEl.classList.contains('select--field')) {\n        self.save(dropedEl);\n        dropedEl.dispatchEvent(new CustomEvent('selectedValue'));\n      }\n    });\n    document.addEventListener('CoCreateSelect-save', function (e) {\n      var element = e.detail.element;\n\n      if (!element) {\n        return;\n      }\n\n      self.save(element);\n    });\n    CoCreateSocket.listen('readDocument', function (data) {\n      if (data.metadata == 'cocreate-select') {\n        CoCreateSelect.setValue(data);\n      }\n    });\n    CoCreateSocket.listen('updateDocument', function (data) {\n      if (data.metadata == 'cocreate-select') {\n        CoCreateSelect.setValue(data);\n      }\n    });\n    document.addEventListener('CoCreate-selected', function (e) {\n      var _e$detail2 = e.detail,\n          element = _e$detail2.element,\n          value = _e$detail2.value;\n      console.log(e.detail);\n    });\n  },\n  __initElementEvent: function __initElementEvent(selectContainer) {\n    var self = this;\n    selectContainer.addEventListener('clicked-submitBtn', function () {\n      self.save(this);\n    });\n    selectContainer.addEventListener('set-document_id', function () {\n      self.save(this);\n    }); //. fetch logic\n\n    var collection = selectContainer.getAttribute('data-collection') || 'module_activity';\n    var id = selectContainer.getAttribute('data-document_id');\n\n    if (collection && id) {\n      CoCreate.readDocument({\n        'collection': collection,\n        'document_id': id,\n        'metadata': 'cocreate-select'\n      });\n    }\n  },\n  __sendRequest: function __sendRequest(selectContainer) {\n    var collection = selectContainer.getAttribute('data-collection') || 'module_activity';\n    var id = selectContainer.getAttribute('data-document_id');\n\n    if (collection && id) {\n      CoCreate.readDocument({\n        'collection': collection,\n        'document_id': id,\n        'metadata': 'cocreate-select'\n      });\n    }\n  },\n  save: function save(element) {\n    var isStore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;\n    var value = CoCreateSelect.getValue(element);\n    var collection = element.getAttribute('data-collection') || 'module_activity';\n    var id = element.getAttribute('data-document_id');\n    var name = element.getAttribute('name');\n    var realtime = element.getAttribute('data-realtime') || \"true\";\n    if (!name) return;\n    if (realtime != \"true\" && !isStore) return;\n\n    if (element.getAttribute('data-save_value') == 'false') {\n      return;\n    }\n\n    if (!CoCreateDocument.checkID(element)) {\n      CoCreateDocument.requestDocumentId(element, \"name\", value);\n      element.setAttribute('data-document_id', 'pending');\n    } else if (id) {\n      CoCreate.updateDocument({\n        'collection': collection,\n        'document_id': id,\n        'data': _defineProperty({}, name, value),\n        'upsert': true,\n        'metadata': 'cocreate-select'\n      });\n    }\n  }\n};\nCoCreateSelectAdapter.init();\nCoCreateObserver.add({\n  name: 'CoCreateSelectAttributes',\n  observe: ['attributes'],\n  attributes: ['data-document_id'],\n  include: 'cocreate-select',\n  task: function task(mutation) {\n    CoCreateSelectAdapter.__sendRequest(mutation.target);\n  }\n});\nCoCreateObserver.add({\n  name: 'CoCreateSelect',\n  observe: ['subtree', 'childList'],\n  include: 'cocreate-select',\n  task: function task(mutation) {\n    CoCreateSelectAdapter.initElement(mutation.target);\n  }\n});//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Db0NyZWF0ZUFkYXB0ZXIvLi9Db0NyZWF0ZS1jb21wb25lbnRzL0NvQ3JlYXRlLXNlbGVjdC9zcmMvQ29DcmVhdGUtYWRhcHRlci5qcz8wZTljIl0sIm5hbWVzIjpbIkNvQ3JlYXRlU2VsZWN0QWRhcHRlciIsImluaXQiLCJpbml0RWxlbWVudCIsIl9faW5pdEV2ZW50cyIsImNvbnRhaW5lciIsIm1haW5Db250YWluZXIiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJjb250YWluZXJMaXN0IiwiaSIsImxlbmd0aCIsIkNvQ3JlYXRlU2VsZWN0IiwiX19pbml0U2VsZWN0IiwiX19pbml0RWxlbWVudEV2ZW50Iiwic2VsZiIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiZGV0YWlsIiwiZHJvcGVkRWwiLCJkcmFnZWRFbCIsInRhZ05hbWUiLCJ0b0xvd2VyQ2FzZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwic2F2ZSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImVsZW1lbnQiLCJDb0NyZWF0ZVNvY2tldCIsImxpc3RlbiIsImRhdGEiLCJtZXRhZGF0YSIsInNldFZhbHVlIiwidmFsdWUiLCJjb25zb2xlIiwibG9nIiwic2VsZWN0Q29udGFpbmVyIiwiY29sbGVjdGlvbiIsImdldEF0dHJpYnV0ZSIsImlkIiwiQ29DcmVhdGUiLCJyZWFkRG9jdW1lbnQiLCJfX3NlbmRSZXF1ZXN0IiwiaXNTdG9yZSIsImdldFZhbHVlIiwibmFtZSIsInJlYWx0aW1lIiwiQ29DcmVhdGVEb2N1bWVudCIsImNoZWNrSUQiLCJyZXF1ZXN0RG9jdW1lbnRJZCIsInNldEF0dHJpYnV0ZSIsInVwZGF0ZURvY3VtZW50IiwiQ29DcmVhdGVPYnNlcnZlciIsImFkZCIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwiaW5jbHVkZSIsInRhc2siLCJtdXRhdGlvbiIsInRhcmdldCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNQSxxQkFBcUIsR0FBRztB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Q2dCLFFBQVEsQ0FBQ0MsTUFBN0M7QUFDQTtBQVBtQixDQUFyQjtBQVVBUCxnQkFBZ0IsQ0FBQ0MsR0FBakIsQ0FBcUI7QUFDcEJSLE1BQUksRUFBRSxnQkFEYztBQUVwQlMsU0FBTyxFQUFFLENBQUMsU0FBRCxFQUFZLFdBQVosQ0FGVztBQUdwQkUsU0FBTyxFQUFFLGlCQUhXO0FBSXBCQyxNQUFJLEVBQUUsY0FBU0MsUUFBVCxFQUFtQjtBQUN4QjFELHlCQUFxQixDQUFDRSxXQUF0QixDQUFrQ3dELFFBQVEsQ0FBQ0MsTUFBM0M7QUFDQTtBQU5tQixDQUFyQiIsImZpbGUiOiIuL0NvQ3JlYXRlLWNvbXBvbmVudHMvQ29DcmVhdGUtc2VsZWN0L3NyYy9Db0NyZWF0ZS1hZGFwdGVyLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ29DcmVhdGVTZWxlY3RBZGFwdGVyID0ge1xuICBcbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbml0RWxlbWVudCgpO1xuICAgIHRoaXMuX19pbml0RXZlbnRzKClcbiAgfSxcbiAgXG4gIGluaXRFbGVtZW50OiBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICBjb25zdCBtYWluQ29udGFpbmVyID0gY29udGFpbmVyIHx8IGRvY3VtZW50O1xuICAgIGlmICghbWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICBcbiAgICBsZXQgY29udGFpbmVyTGlzdCA9IG1haW5Db250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnY29jcmVhdGUtc2VsZWN0LCBkaXYuc2VsZWN0LS1maWVsZCcpO1xuICAgIGZvcihsZXQgaSA9IDAgOyBpIDwgY29udGFpbmVyTGlzdC5sZW5ndGggOyBpKyspe1xuICAgICAgQ29DcmVhdGVTZWxlY3QuX19pbml0U2VsZWN0KGNvbnRhaW5lckxpc3RbaV0pO1xuICAgICAgdGhpcy5fX2luaXRFbGVtZW50RXZlbnQoY29udGFpbmVyTGlzdFtpXSk7XG4gICAgfVxuICB9LFxuICBcbiAgX19pbml0RXZlbnRzOiBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdkbmRzdWNjZXNzJywgZnVuY3Rpb24oZSkge1xuXHRcdFx0Y29uc3Qge2Ryb3BlZEVsLCBkcmFnZWRFbH0gPSBlLmRldGFpbDtcbiAgICAgIGlmICgodHlwZW9mIGRyb3BlZEVsLnRhZ05hbWUgIT0gJ3VuZGVmaW5lZCcgJiYgZHJvcGVkRWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09ICdjb2NyZWF0ZS1zZWxlY3QnKSBcbiAgICAgICAgICB8fCBkcm9wZWRFbC5jbGFzc0xpc3QuY29udGFpbnMoJ3NlbGVjdC0tZmllbGQnKSkgXG4gICAgICB7XG4gICAgICAgIHNlbGYuc2F2ZShkcm9wZWRFbClcbiAgICAgICAgZHJvcGVkRWwuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ3NlbGVjdGVkVmFsdWUnKSk7XG4gICAgICB9XG5cdFx0fSlcblx0XHRcblx0XHRcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdDb0NyZWF0ZVNlbGVjdC1zYXZlJywgZnVuY3Rpb24oZSkge1xuXHRcdCAgY29uc3Qge2RldGFpbDoge2VsZW1lbnR9fSA9IGU7XG5cdFx0ICBpZiAoIWVsZW1lbnQpIHtcblx0XHQgICAgcmV0dXJuO1xuXHRcdCAgfVxuXHRcdCAgXG5cdFx0ICBzZWxmLnNhdmUoZWxlbWVudCk7XG5cdFx0fSlcblx0XHRcblx0XHRDb0NyZWF0ZVNvY2tldC5saXN0ZW4oJ3JlYWREb2N1bWVudCcsIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHQgIGlmIChkYXRhLm1ldGFkYXRhID09ICdjb2NyZWF0ZS1zZWxlY3QnKSB7XG4gIFx0XHQgIENvQ3JlYXRlU2VsZWN0LnNldFZhbHVlKGRhdGEpO1xuXHRcdCAgfVxuXHRcdH0pXG5cdFx0XG5cdFx0Q29DcmVhdGVTb2NrZXQubGlzdGVuKCd1cGRhdGVEb2N1bWVudCcsIGZ1bmN0aW9uKGRhdGEpIHtcblx0XHQgIGlmIChkYXRhLm1ldGFkYXRhID09ICdjb2NyZWF0ZS1zZWxlY3QnKSB7XG4gIFx0XHQgIENvQ3JlYXRlU2VsZWN0LnNldFZhbHVlKGRhdGEpO1xuXHRcdCAgfVxuXHRcdH0pXG5cdFx0XG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignQ29DcmVhdGUtc2VsZWN0ZWQnLCBmdW5jdGlvbihlKXtcblx0XHQgIGNvbnN0IHtkZXRhaWw6IHtlbGVtZW50LCB2YWx1ZX19ID0gZTtcblx0XHQgIGNvbnNvbGUubG9nKGUuZGV0YWlsKVxuXHRcdCAgXG5cdFx0fSlcbiAgfSxcbiAgXG4gIF9faW5pdEVsZW1lbnRFdmVudDogZnVuY3Rpb24oc2VsZWN0Q29udGFpbmVyKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgc2VsZWN0Q29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrZWQtc3VibWl0QnRuJywgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnNhdmUodGhpcylcbiAgICB9KVxuICAgIFxuICAgIHNlbGVjdENvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdzZXQtZG9jdW1lbnRfaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuc2F2ZSh0aGlzKVxuICAgIH0pXG4gICAgXG4gICAgLy8uIGZldGNoIGxvZ2ljXG4gICAgbGV0IGNvbGxlY3Rpb24gPSBzZWxlY3RDb250YWluZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbGxlY3Rpb24nKSB8fCAnbW9kdWxlX2FjdGl2aXR5JztcbiAgICBsZXQgaWQgPSBzZWxlY3RDb250YWluZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWRvY3VtZW50X2lkJyk7XG4gICAgXG4gICAgaWYgKGNvbGxlY3Rpb24gJiYgaWQpIHtcbiAgICAgIENvQ3JlYXRlLnJlYWREb2N1bWVudCh7XG4gICAgICAgICdjb2xsZWN0aW9uJzogY29sbGVjdGlvbiwgXG4gICAgICAgICdkb2N1bWVudF9pZCc6IGlkLFxuICAgICAgICAnbWV0YWRhdGEnOiAnY29jcmVhdGUtc2VsZWN0J1xuICAgICAgfSlcbiAgICB9XG4gIH0sXG4gIFxuICBfX3NlbmRSZXF1ZXN0OiBmdW5jdGlvbihzZWxlY3RDb250YWluZXIpIHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IHNlbGVjdENvbnRhaW5lci5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29sbGVjdGlvbicpIHx8ICdtb2R1bGVfYWN0aXZpdHknO1xuICAgIGxldCBpZCA9IHNlbGVjdENvbnRhaW5lci5nZXRBdHRyaWJ1dGUoJ2RhdGEtZG9jdW1lbnRfaWQnKTtcbiAgICBcbiAgICBpZiAoY29sbGVjdGlvbiAmJiBpZCkge1xuICAgICAgQ29DcmVhdGUucmVhZERvY3VtZW50KHtcbiAgICAgICAgJ2NvbGxlY3Rpb24nOiBjb2xsZWN0aW9uLCBcbiAgICAgICAgJ2RvY3VtZW50X2lkJzogaWQsXG4gICAgICAgICdtZXRhZGF0YSc6ICdjb2NyZWF0ZS1zZWxlY3QnXG4gICAgICB9KVxuICAgIH1cbiAgfSxcblxuICBzYXZlOiBmdW5jdGlvbihlbGVtZW50LCBpc1N0b3JlID0gdHJ1ZSkge1xuICBcbiAgICBsZXQgdmFsdWUgPSBDb0NyZWF0ZVNlbGVjdC5nZXRWYWx1ZShlbGVtZW50KTtcbiAgICBcbiAgICBsZXQgY29sbGVjdGlvbiA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbGxlY3Rpb24nKSB8fCAnbW9kdWxlX2FjdGl2aXR5JztcbiAgICBcbiAgICBsZXQgaWQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1kb2N1bWVudF9pZCcpO1xuICAgIGxldCBuYW1lID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgICBsZXQgcmVhbHRpbWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1yZWFsdGltZScpIHx8IFwidHJ1ZVwiO1xuICAgIGlmICghbmFtZSkgcmV0dXJuO1xuICAgIFxuICAgIGlmIChyZWFsdGltZSAhPSBcInRydWVcIiAmJiAhaXNTdG9yZSkgcmV0dXJuO1xuICAgIFxuICAgIGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zYXZlX3ZhbHVlJykgPT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIUNvQ3JlYXRlRG9jdW1lbnQuY2hlY2tJRChlbGVtZW50KSkge1xuICAgICAgQ29DcmVhdGVEb2N1bWVudC5yZXF1ZXN0RG9jdW1lbnRJZChlbGVtZW50LCBcIm5hbWVcIiwgdmFsdWUpXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1kb2N1bWVudF9pZCcsICdwZW5kaW5nJyk7XG4gICAgfSBlbHNlIGlmIChpZCkge1xuICAgICAgQ29DcmVhdGUudXBkYXRlRG9jdW1lbnQoe1xuICAgICAgICAnY29sbGVjdGlvbic6IGNvbGxlY3Rpb24sIFxuICAgICAgICAnZG9jdW1lbnRfaWQnOiBpZCwgXG4gICAgICAgICdkYXRhJyA6IHsgXG4gICAgICAgICAgW25hbWVdIDogdmFsdWUgXG4gICAgICAgIH0sXG4gICAgICAgICd1cHNlcnQnOiB0cnVlLFxuICAgICAgICAnbWV0YWRhdGEnOiAnY29jcmVhdGUtc2VsZWN0J1xuICAgICAgfSlcbiAgICB9XG4gICAgXG4gIH0sXG59XG5cbkNvQ3JlYXRlU2VsZWN0QWRhcHRlci5pbml0KCk7XG5cblxuQ29DcmVhdGVPYnNlcnZlci5hZGQoeyBcblx0bmFtZTogJ0NvQ3JlYXRlU2VsZWN0QXR0cmlidXRlcycsIFxuXHRvYnNlcnZlOiBbJ2F0dHJpYnV0ZXMnXSxcblx0YXR0cmlidXRlczogWydkYXRhLWRvY3VtZW50X2lkJ10sXG5cdGluY2x1ZGU6ICdjb2NyZWF0ZS1zZWxlY3QnLCBcblx0dGFzazogZnVuY3Rpb24obXV0YXRpb24pIHtcblx0XHRDb0NyZWF0ZVNlbGVjdEFkYXB0ZXIuX19zZW5kUmVxdWVzdChtdXRhdGlvbi50YXJnZXQpXG5cdH1cbn0pXG5cbkNvQ3JlYXRlT2JzZXJ2ZXIuYWRkKHsgXG5cdG5hbWU6ICdDb0NyZWF0ZVNlbGVjdCcsIFxuXHRvYnNlcnZlOiBbJ3N1YnRyZWUnLCAnY2hpbGRMaXN0J10sXG5cdGluY2x1ZGU6ICdjb2NyZWF0ZS1zZWxlY3QnLCBcblx0dGFzazogZnVuY3Rpb24obXV0YXRpb24pIHtcblx0XHRDb0NyZWF0ZVNlbGVjdEFkYXB0ZXIuaW5pdEVsZW1lbnQobXV0YXRpb24udGFyZ2V0KVxuXHR9XG59KSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./CoCreate-components/CoCreate-select/src/CoCreate-adapter.js\n");

/***/ })

/******/ })["default"];
});