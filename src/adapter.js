import crud from '@cocreate/crud-client';
import * as config from './config';
import { container } from './select';
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
							values: self.getValue(e.target)
						}
					},
				});
			else if (isRealtime != "false")
				save(e.target);
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
				writeSelect(data, key);
			}
		}
	})
}

export async function read(selectContainer) {
	let instance = selectContainer.select;
	let data = await crud.read(selectContainer, false);
	if (!data) return;
	let name = selectContainer.getAttribute('name');
	
	let options = data.data[name];
	selectContainer['getValue'] = options;

	options = Array.isArray(options) ? options : [options];
	options.forEach(op => instance.selectOption(op, true, undefined, false));
}

export function writeSelect(data, nameInDb) {
	for (let [el, instance] of container) {
		let {collection, document_id, name, isListen} = crud.getAttr(el);
		if (isListen == "false") return;
		if (data['collection'] == collection && data['document_id'] == document_id && nameInDb == name) {

			if (data['data'][name]) {
				
				let options = data['data'][name];
				el['getValue'] = options;
				options = Array.isArray(options) ? options : [options];
				options.forEach(op => instance.selectOption(op, true, undefined, false));
				
			}
			else if (data['data'][name] === '')
				instance.unselectAll();

			break;
		}
	}
}

// function getValue(element) {
// 	let value = Array.from(element.selectedOptions)
// 		.map(selOption => selectedToOption.has(selOption) ? selectedToOption.get(selOption).getAttribute('value') : '');
// 	value = value.length <= 1 ? value[0] : value;
// 	value = value ? value : '';
// 	return value;
// }

export async function save(element, isStore = true) {
	if (!isStore) return;
	let value = element.getValue(element);
	await crud.save(element, value);
}


// export default SelectAdapter;
