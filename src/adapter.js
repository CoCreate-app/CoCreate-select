import CoCreateSelect from "./select.js"
import crud from '@cocreate/crud-client';
import form from '@cocreate/form'
import {container} from './select';

const SelectAdapter = {
	
	init: function() {
		this.initElement();
		this.__initEvents()
	},
	
	initElement: function(container) {
		const mainContainer = container || document;
		if (!mainContainer.querySelectorAll) {
			return;
		}
	
		let containerList = mainContainer.querySelectorAll('cocreate-select, div.select--field');
		for(let i = 0 ; i < containerList.length ; i++){
			CoCreateSelect.init(containerList[i]);
			this.__initElementEvent(containerList[i]);
		}
	},
	
	__initEvents: function() {
		const self = this;
		document.addEventListener('dndsuccess', function(e) {
			const {dropedEl, dragedEl} = e.detail;
			if ((typeof dropedEl.tagName != 'undefined' && dropedEl.tagName.toLowerCase() == 'cocreate-select') 
					|| dropedEl.classList.contains('select--field')) 
			{
				self.save(dropedEl)
				dropedEl.dispatchEvent(new CustomEvent('input'));
			}
		})
		
		
		document.addEventListener('input', function(e) {
			self.save(e.target);
		})
		
		crud.listen('readDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				CoCreateSelect.setValue(data);
			}
		})
		
		crud.listen('updateDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				CoCreateSelect.setValue(data);
			}
		})
		
	},
	
	__initElementEvent: function(selectContainer) {
		const self = this;

		selectContainer.addEventListener('set-document_id', function() {
			self.save(this)
		})
		
		//. fetch logic
		let collection = selectContainer.getAttribute('data-collection') || 'module_activity';
		let id = selectContainer.getAttribute('data-document_id');
		
		if (collection && id) {
			crud.readDocument({
				'collection': collection, 
				'document_id': id,
				'metadata': 'cocreate-select'
			})
		}
	},
	
	__sendRequest: function(selectContainer) {
		let collection = selectContainer.getAttribute('data-collection') || 'module_activity';
		let id = selectContainer.getAttribute('data-document_id');
		
		if (collection && id) {
			crud.readDocument({
				'collection': collection, 
				'document_id': id,
				'metadata': 'cocreate-select'
			})
		}
	},

	save: function(element, isStore = true) {
	
		let value = Array.from(element.options);
		
		let collection = element.getAttribute('data-collection') || 'module_activity';
		
		let id = element.getAttribute('data-document_id');
		let name = element.getAttribute('name');
		let realtime = element.getAttribute('data-realtime') || "true";
		if (!name) return;
		
		if (realtime != "true" && !isStore) return;
		
		if (element.getAttribute('data-save_value') == 'false') {
			return;
		}
		
		if (!form.checkID(element)) {
			form.request({element, value, nameAttr: "name"});
			element.setAttribute('data-document_id', 'pending');
		} else if (id) {
			crud.updateDocument({
				'collection': collection, 
				'document_id': id, 
				'data' : { 
					[name] : value 
				},
				'upsert': true,
				'metadata': 'cocreate-select'
			})
		}
		
	},
}

export default SelectAdapter;