import { container } from './select';
import * as config from './config';
export default function(cond) {
    Object.defineProperty(window.HTMLElement.prototype, 'selected', {
        get: function() {
            if (cond(this))
                return this.hasAttribute('selected');
        },
        set: function(value) {
            if (cond(this)) {
                let select = this;
                while (select.parentElement && !select.matches(config.containerSelector)) {
                    select = select.parentElement;
                 }
        
                let instance = container.get(select);
                if (value) {
                    this.setAttribute('selected', '')
                    instance.selectOption(this)
                }
                else {
                    this.removeAttribute('selected')
                    instance.unselectOption(this)

                }
            }
        }
    })
}
