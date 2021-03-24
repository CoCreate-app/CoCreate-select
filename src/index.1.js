import CoCreateSelect from "./select.js"
import SelectAdapter from "./adapter.js"

SelectAdapter.init();
CoCreateSelect.adapter = SelectAdapter;

CoCreate.observer.init({ 
	name: 'CoCreateSelectAttributes', 
	observe: ['attributes'],
	attributes: ['data-document_id'],
	include: 'cocreate-select', 
	callback: function(mutation) {
		SelectAdapter.__sendRequest(mutation.target)
	}
});

CoCreate.observer.init({ 
	name: 'CoCreateSelect', 
	observe: ['subtree', 'childList'],
	include: 'cocreate-select', 
	callback: function(mutation) {
		SelectAdapter.initElement(mutation.target)
	}
});

CoCreate.form.init({
	name: 'CoCreateSelect',
	selector: "cocreate-select",
	callback: function(el) {
		CoCreate.select.adapter.save(el);
	}
});
export default CoCreateSelect;
