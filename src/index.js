import CoCreateSelect from "./select.js";
import observer from "@cocreate/observer";
import { getAttributeNames } from "@cocreate/utils";
import { containerSelector } from "./config";
import "./index.css";

function init() {
	let elements = document.querySelectorAll(containerSelector);
	initElements(elements);
}

function initElements(elements) {
	for (let element of elements) initElement(element);
}

function initElement(element) {
	CoCreateSelect.init(element);
}

// SelectAdapter.init();
// CoCreateSelect.adapter = SelectAdapter;

observer.init({
	key: "CoCreateSelectAttributes",
	types: ["attributes"],
	attributeFilter: getAttributeNames(["array", "object", "key"]),
	selector: "cocreate-select",
	callback: function (mutation) {
		CoCreateSelect.init(mutation.target);
	}
});

observer.init({
	name: "CoCreateSelect",
	types: ["addedNodes"],
	selector: "cocreate-select",
	callback: function (mutation) {
		CoCreateSelect.init(mutation.target);
	}
});

// observer.init({
// 	name: 'CoCreateSelect',
// 	types: ['childList'],
// 	target: 'cc-option',
// 	callback: function(mutation) {
// 		CoCreateSelect.init(mutation.target)
// 	}
// })

init();

export * from "./select";
export default CoCreateSelect;
