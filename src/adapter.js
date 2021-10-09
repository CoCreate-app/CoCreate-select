import crud from '@cocreate/crud-client';
import form from '@cocreate/form';
import * as config from './config';
import { container,	selectedToOption } from './select';
import messageClient from '@cocreate/message-client';

export function initEvents() {
	document.addEventListener('dndsuccess', function(e) {
		const { dropedEl, dragedEl } = e.detail;
		if (dropedEl.matches(config.containerSelector)) {
			container.get(dropedEl).__fireSelectedEvent({
				selectContainer: dropedEl
			})
		}
	})

	document.addEventListener('input', function(e) {
		let {name, document_id,	isRealtime} = crud.getAttr(e.target);
		if (e.target.matches(config.containerSelector)) {

			if (document_id === 'null')
				messageClient.send({
					broadcast_sender: false,
					rooms: "",
					emit: {
						message: "select",
						data: {
							name: e.target.getAttribute('name'),
							values: self.getAllValue(e.target)
						}
					},
				});
			else if (isRealtime != "false")
				SelectAdapter.save(e.target);
		}
	})

	messageClient.listen('select', function(data) {
		let { name,	values} = data;
		let select = document.querySelector(`[name="${name}"]`);

		if (!select || !container.has(select)) return;
		let instance = container.get(select);
		instance.unselectAll(false)
		values.forEach(value => instance.selectOption(value, true, value, false))

	})

	crud.listen('updateDocument', function(data) {
		if (data.metadata == 'cocreate-select') {
			for (let key of Object.keys(data['data'])) {
				self.writeSelect(data, key);
			}
		}
	})
}

const SelectAdapter = {

	read: async function(selectContainer, instance) {
		let data = await crud.read(selectContainer, false);
		if (!data) return;
		let name = selectContainer.getAttribute('name');
		
		let options = data.data[name];
		options = Array.isArray(options) ? options : [options];
		options.forEach(op => instance.selectOption(op, true, undefined, false));
	},



	writeSelect: function(data, nameInDb) {
		for (let [el, instance] of container) {
			let {collection, document_id, name, isListen} = crud.getAttr(el)
			if (isListen == "false") return;
			if (data['collection'] == collection && data['document_id'] == document_id && nameInDb == name) {

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
	
	getValues: function(form, collection, document_id = '') {
		let data = {};
		if (!collection) return {}
		let selectors = `[collection='${collection}'][document_id='${document_id}']`
		let elements = document.querySelectorAll(`cocreate-select${selectors}`);
		for (let element of elements) {
			let name = element.getAttribute('name')
			data[name] = this.getAllValue(element);
		}
		return data;
	},
	
	getAllValue: function(element) {
		let value = Array.from(element.selectedOptions)
			.map(selOption => selectedToOption.has(selOption) ? selectedToOption.get(selOption).getAttribute('value') : '');
		return value;
	},

	save: async function(element, isStore = true) {
		if (!isStore) return;
		let value = this.getAllValue(element)
		value = value.length <= 1 ? value[0] : value;
		value = value ? value : '';
		await crud.save(element, value)
	},


}

form.init({
	name: 'CoCreateSelect',
	selector: "cocreate-select",
	callback: function(form, collection, document_id) {
		return SelectAdapter.getValues(form, collection, document_id)
	},
});



export default SelectAdapter;
