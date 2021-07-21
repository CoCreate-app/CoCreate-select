import CoCreateSelect from "./select.js"
import SelectAdapter from "./adapter.js"
import observer from '@cocreate/observer';
import { containerSelector } from './config';
import form from '@cocreate/form';
import './index.css';

SelectAdapter.init();
CoCreateSelect.adapter = SelectAdapter;


// observer.init({
// 	name: 'CoCreateSelectAttributes',
// 	observe: ['attributes'],
// 	attributeName: ['data-document_id'],
// 	include: 'cocreate-select',
// 	callback: function(mutation) {
// 		SelectAdapter.__sendRequest(mutation.target)
// 	}
// });

observer.init({
	name: 'CoCreateSelect',
	observe: ['addedNodes'],
	target: 'cocreate-select',
	callback: function(mutation) {
		
			CoCreateSelect.init(mutation.target)
		
	}
})

// observer.init({
// 	name: 'CoCreateSelect',
// 	observe: ['childList'],
// 	target: 'cc-option',
// 	callback: function(mutation) {
// 		CoCreateSelect.init(mutation.target)
// 	}
// })

form.init({
	name: 'CoCreateSelect',
	selector: "cocreate-select",
	callback: function(el) {
		SelectAdapter.save(el);
	}
});

export * from './select';
export default CoCreateSelect;
