import CoCreateSelect from "./select.js"
import crud from '@cocreate/crud-client';
import form from '@cocreate/form';
import * as config from './config';
import { container } from './select';

const SelectAdapter = {


	init: function() {







		this.initElement();
		this.__initEvents()

		let containerList = document.querySelectorAll(config.containerSelector);

		for (let selectCon of containerList)
			new CoCreateSelect(selectCon);
	},

	__initEvents: function() {
		const self = this;

		document.addEventListener('dndsuccess', function(e) {
			const { dropedEl, dragedEl } = e.detail;
			if (dropedEl.matches(config.containerSelector)) {
				container.get(dropedEl).__fireSelectedEvent({ selectContainer: dropedEl })
			}
		})


		document.addEventListener('input', function(e) {
			if (e.target.matches(config.containerSelector))
				self.save(e.target);
		})

		crud.listen('readDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				CoCreateSelect.template(data);
			}
		})

		crud.listen('updateDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				CoCreateSelect.template(data);
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
			form.request({ element, value, nameAttr: "name" });
			element.setAttribute('data-document_id', 'pending');
		}
		else if (id) {
			crud.updateDocument({
				'collection': collection,
				'document_id': id,
				'data': {
					[name]: value
				},
				'upsert': true,
				'metadata': 'cocreate-select'
			})
		}

	},
}

export default SelectAdapter;
