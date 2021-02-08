import CoCreateSelect from "./select.js"
import SelectAdapter from "./adapter.js"

SelectAdapter.init();
CoCreateSelect.adapter = SelectAdapter;

CoCreate.observer.add({ 
	name: 'CoCreateSelectAttributes', 
	observe: ['attributes'],
	attributes: ['data-document_id'],
	include: 'cocreate-select', 
	callback: function(mutation) {
		SelectAdapter.__sendRequest(mutation.target)
	}
});

CoCreate.observer.add({ 
	name: 'CoCreateSelect', 
	observe: ['subtree', 'childList'],
	include: 'cocreate-select', 
	callback: function(mutation) {
		SelectAdapter.initElement(mutation.target)
	}
});
export default CoCreateSelect;
