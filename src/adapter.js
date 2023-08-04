import crud from '@cocreate/crud-client';
import * as config from './config';
import { container } from './select';
import messageClient from '@cocreate/message-client';

export function initEvents() {
    document.addEventListener('dndsuccess', function (e) {
        const { droppedEl, draggedEl } = e.detail;
        if (droppedEl.matches(config.containerSelector)) {
            container.get(droppedEl).__fireSelectedEvent({
                selectContainer: droppedEl
            })
        }
    })

    document.addEventListener('input', function (e) {
        let { key, object, isRealtime } = crud.getAttributes(e.target);
        if (e.target.matches(config.containerSelector)) {

            if (object === 'null')
                messageClient.send({
                    broadcastSender: false,
                    rooms: "",
                    message: "select",
                    data: {
                        key: e.target.getAttribute('key'),
                        values: self.getValue(e.target)
                    }
                });
            else if (isRealtime != "false")
                save(e.target);
        }
    })

    messageClient.listen('select', function (response) {
        let data = response.data
        let { key, values } = data;
        let select = document.querySelector(`[key="${key}"]`);

        if (!select || !container.has(select)) return;
        let instance = container.get(select);
        instance.unselectAll(false)
        values.forEach(value => instance.selectOption(value, true, value, false))

    })

    crud.listen('update.object', function (data) {
        let doc = data.object[0]
        if (doc.array == 'crdt-transactions')
            return
        for (let key of Object.keys(doc)) {
            writeSelect(doc, key);
        }
    })
}

export async function read(selectContainer) {
    let instance = selectContainer.select;
    let data = await crud.read(selectContainer);
    if (data && data.object && data.object[0]) {
        let key = selectContainer.getAttribute('key');

        let options = data.object[0][key];

        options = Array.isArray(options) ? options : [options];
        options.forEach(op => instance.selectOption(op, true, undefined, false));
    }
}

export function writeSelect(doc, nameInDb) {
    for (let [el, instance] of container) {
        let { array, object, key, isListen } = crud.getAttributes(el);
        if (isListen == "false") return;

        if (doc['array'] == array && doc['_id'] == object && nameInDb == key) {

            if (doc[key]) {

                let options = [key];
                options = Array.isArray(options) ? options : [options];
                options.forEach(op => instance.selectOption(op, true, undefined, false));

            }
            else if (doc[key] === '')
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