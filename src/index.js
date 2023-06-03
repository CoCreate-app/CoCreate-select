import CoCreateSelect from "./select.js";
import { initEvents } from "./adapter.js";
import observer from '@cocreate/observer';
import crud from '@cocreate/crud-client';
import { containerSelector } from './config';
import './index.css';

function init() {
    let elements = document.querySelectorAll(containerSelector);
    initElements(elements);
    initEvents();
}

function initElements(elements) {
    for(let element of elements)
        initElement(element);
}

function initElement(element) {
	CoCreateSelect.init(element);
}


// SelectAdapter.init();
// CoCreateSelect.adapter = SelectAdapter;

observer.init({
	name: 'CoCreateSelectAttributes',
	observe: ['attributes'],
	attributeName: crud.getAttributeNames(['collection', 'document_id', 'name']),
	target: 'cocreate-select',
	callback: function(mutation) {
		CoCreateSelect.init(mutation.target);
	}
});

observer.init({
	name: 'CoCreateSelect',
	observe: ['addedNodes'],
	target: 'cocreate-select',
	callback: function(mutation) {
		CoCreateSelect.init(mutation.target);
	}
});

// observer.init({
// 	name: 'CoCreateSelect',
// 	observe: ['childList'],
// 	target: 'cc-option',
// 	callback: function(mutation) {
// 		CoCreateSelect.init(mutation.target)
// 	}
// })

init();

export * from './select';
export default CoCreateSelect;
