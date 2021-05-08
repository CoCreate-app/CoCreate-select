import {container} from './select';

export default function(cond) {
    Object.defineProperty(window.HTMLElement.prototype, 'options', {
        get: function() {
            if (cond(this) && container.has(this))
                return container.get(this).optionsContainer.children;
        },
    })
}
