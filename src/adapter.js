import CoCreateSelect from "./select.js"
import {socket, crud} from '../../../CoCreateJS/src';

// import CoCreateSocket from '@cocreate/socket';
// import CoCreateCrud from '@cocreate/crud';
import crudUtils from '@cocreate/crud/src/utils.crud.js'
import form from '@cocreate/form'

// let socket = new CoCreateSocket('ws');
// let crud = CoCreateCrud(socket);

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
			CoCreateSelect.__initSelect(containerList[i]);
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
				dropedEl.dispatchEvent(new CustomEvent('selectedValue'));
			}
		})
		
		
		document.addEventListener('CoCreateSelect-save', function(e) {
			const {detail: {element}} = e;
			if (!element) {
				return;
			}
			
			self.save(element);
		})
		
		socket.listen('readDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				CoCreateSelect.setValue(data);
			}
		})
		
		socket.listen('updateDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				CoCreateSelect.setValue(data);
			}
		})
		
		document.addEventListener('CoCreate-selected', function(e){
			const {detail: {element, value}} = e;
			console.log(e.detail)
			
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
	
		let value = CoCreateSelect.getValue(element);
		
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