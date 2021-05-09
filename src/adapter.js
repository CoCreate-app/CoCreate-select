import CoCreateSelect from "./select.js"
import crud from '@cocreate/crud-client';
import form from '@cocreate/form';
import * as config from './config';
import { container } from './select';

const SelectAdapter = {

	init: function() {

		let containerList = document.querySelectorAll(config.containerSelector);

		for (let selectCon of containerList) {
			new CoCreateSelect(selectCon);
			this.dbToSelects(selectCon)
		}
		this.__initEvents()
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
				self.saveSelect(e.target);
		})

		crud.listen('readDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				self.template(data);
			}
		})

		crud.listen('updateDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				self.template(data);
			}
		})

	},

	dbToSelects: function(selectContainer) {
		const self = this;

		selectContainer.addEventListener('set-document_id', function() {
			self.saveSelect(this)
		})


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

	getCrudCred: function(el) {
		const collection = el.getAttribute('data-collection') || 'module_activity';
		const id = el.getAttribute('data-document_id');
		const name = el.getAttribute('name');
		let realtime = el.getAttribute('data-realtime') || "true";
		return { name, id, collection, realtime };
	},
	writeSelect: function({ collection, document_id, ...data }) {


		for (let [el, instance] of this.container) {
			let { name, id, collection } = this.getCrudCred(el);
			if (data['collection'] == collection && data['document_id'] == id && name) {
				instance.selectOption(data['data'][name]);
			}
		}

	},
	saveSelect: function(element, isStore = true) {

		let value = Array.from(element.options);

		let { name, id, collection, realtime } = this.getCrudCred(el);
		if (!name || !isStore || realtime != "true" || element.getAttribute('data-save_value') == 'false') return;


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
