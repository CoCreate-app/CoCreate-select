import CoCreateSelect from "./select.js"
import SelectAdapter from "./adapter.js"
import CoCreateObserver from '@cocreate/observer';
import form from '@cocreate/form'
import './index.css';

SelectAdapter.init();
CoCreateSelect.adapter = SelectAdapter;

CoCreateObserver.init({ 
	name: 'CoCreateSelectAttributes', 
	observe: ['attributes'],
	attributes: ['data-document_id'],
	include: 'cocreate-select', 
	callback: function(mutation) {
		SelectAdapter.__sendRequest(mutation.target)
	}
});

CoCreateObserver.init({ 
	name: 'CoCreateSelect', 
	observe: ['subtree', 'childList'],
	include: 'cocreate-select', 
	callback: function(mutation) {
		CoCreateSelect.init(mutation.target)
	}
});

form.init({
	name: 'CoCreateSelect',
	selector: "cocreate-select",
	callback: function(el) {
		SelectAdapter.save(el);
	}
});
export default CoCreateSelect;
