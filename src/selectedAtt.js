import {getInstance} from './utils';
export default function(cond) {
    Object.defineProperty(window.HTMLElement.prototype, 'selected', {
        get: function() {
            if (cond(this))
                return this.hasAttribute('selected');
        },
        set: function(value) {
            if (cond(this)) {
        
                let instance = getInstance(this);
                if (value) {
                    this.setAttribute('selected', '')
                    instance.selectOption(this, false)
                }
                else {
                    this.removeAttribute('selected')
                    instance.unselectOption(this)

                }
            }
        }
    })
}
