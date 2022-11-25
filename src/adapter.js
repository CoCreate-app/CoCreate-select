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
		let {name, document_id,	isRealtime} = crud.getAttributes(e.target);
		if (e.target.matches(config.containerSelector)) {

			if (document_id === 'null')
				messageClient.send({
					broadcastSender: false,
					rooms: "",
					message: "select",
					data: {
						name: e.target.getAttribute('name'),
						values: self.getValue(e.target)
					}
				});
			else if (isRealtime != "false")
				save(e.target);
		}
	})

	messageClient.listen('select', function(response) {
		let data = response.data
		let { name,	values} = data;
		let select = document.querySelector(`[name="${name}"]`);

		if (!select || !container.has(select)) return;
		let instance = container.get(select);
		instance.unselectAll(false)
		values.forEach(value => instance.selectOption(value, true, value, false))

	})

	crud.listen('updateDocument', function(data) {
		let doc = data.document[0]
		if (doc.collection == 'crdt-transactions') 
			return
		for (let key of Object.keys(doc)) {
			writeSelect(doc, key);
		}
	})
}

export async function read(selectContainer) {
	let instance = selectContainer.select;
	let data = await crud.read(selectContainer);
	if (!data) return;
	let name = selectContainer.getAttribute('name');
	
	let options = data.document[0][name];

	options = Array.isArray(options) ? options : [options];
	options.forEach(op => instance.selectOption(op, true, undefined, false));
}

export function writeSelect(doc, nameInDb) {
	for (let [el, instance] of container) {
		let {collection, document_id, name, isListen} = crud.getAttributes(el);
		if (isListen == "false") return;
		
		if (doc['collection'] == collection && doc['_id'] == document_id && nameInDb == name) {

			if (doc[name]) {
				
				let options = [name];
				options = Array.isArray(options) ? options : [options];
				options.forEach(op => instance.selectOption(op, true, undefined, false));
				
			}
			else if (doc[name] === '')
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
	let value = element.getValue();
	await crud.save(element, value);
}


// export default SelectAdapter;