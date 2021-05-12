import { getInstance } from './utils';
import { selectedToOption } from './select';

export default function(cond) {
    Object.defineProperty(window.HTMLElement.prototype, 'selectedIndex', {
        get: function() {
            if (cond(this)) {
                let instance = getInstance(this);
                let children = instance.selectedContainer.children;
                if (children.length) {
                    let optionEl = selectedToOption.get(children[0]);
                    return Array.prototype.indexOf.call(instance.getOptions(), optionEl);
                }
                return -1;
            }

        },
        set: function(value) {
            if (cond(this)) {
                let instance = getInstance(this);
                if (isFinite(value)) {
                    let option = instance.getOptions()[value];
                    instance.selectOption(option, false);
                }
            }
        }
    })
}
