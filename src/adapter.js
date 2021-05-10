import CoCreateSelect from "./select.js"
import crud from '@cocreate/crud-client';
import form from '@cocreate/form';
import * as config from './config';
import { container, selectedToOption } from './select';

const SelectAdapter = {

	init: function() {

		let containerList = document.querySelectorAll(config.containerSelector);

		for (let selectCon of containerList) {
			let instance = CoCreateSelect.init(selectCon);
			this.dbToSelects(selectCon, instance)
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


		crud.listen('updateDocument', function(data) {
			if (data.metadata == 'cocreate-select') {
				for(let key of Object.keys(data['data']))
				{
						self.writeSelect(data, key);
				}
			
			}
		})

	},

	dbToSelects: async function(selectContainer, instance) {
		const self = this;

		selectContainer.addEventListener('set-document_id', function() {
			self.saveSelect(this)
		})

		let { name, id, collection } = this.getCrudCred(selectContainer);
		if (collection && id) {

			let unique = Date.now();
			crud.readDocument({
				collection: collection,
				document_id: id,
				event: unique
			})
			let data = await crud.listenAsync(unique);
			let options = data['data'][name];
			options = Array.isArray(options) ? options : [options];
			options.forEach(op => instance.selectOption(op, true, undefined, false))
			

		}
	},

	getCrudCred: function(el) {
		const collection = el.getAttribute('data-collection') || 'module_activity';
		const id = el.getAttribute('data-document_id');
		const name = el.getAttribute('name');
		let realtime = el.getAttribute('data-realtime') || "true";
		return { name, id, collection, realtime };
	},
	writeSelect: function(data, nameInDb) {
		for (let [el, instance] of container) {
			let { name, id, collection } = this.getCrudCred(el);
			if (data['collection'] == collection && data['document_id'] == id && nameInDb == name) {

				if (data['data'][name]) {
					let options = data['data'][name];
					options = Array.isArray(options) ? options : [options];
					options.forEach(op => instance.selectOption(op, true, undefined, false))
				}
				else if (data['data'][name] === '')
					instance.unselectAll();
					
					break;
			}
		}
	},
	saveSelect: function(element, isStore = true) {



		let { name, id, collection, realtime } = this.getCrudCred(element);
		if (!name || !isStore || realtime != "true" || element.getAttribute('data-save_value') == 'false') return;

		let value = Array.from(element.selectedOptions)
			.map(selOption => selectedToOption.has(selOption) ? selectedToOption.get(selOption).getAttribute('value') : '');
		value = value.length <= 1 ? value[0] : value;
		value = value ? value : '';

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
				'metadata': 'cocreate-select',
				broadcast_sender: false
			})
		}

	},
}

export default SelectAdapter;
