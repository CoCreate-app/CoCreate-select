import { container } from './select';
import * as config from './config';
export default function(cond) {
    Object.defineProperty(window.HTMLElement.prototype, 'options', {
        get: function() {
            if (cond(this) && container.has(this)) {
                let instance = container.get(this);
                    return instance.getOptions();
            }
        },
    })
}
