export default function(cond) {
    Object.defineProperty(window.HTMLElement.prototype, 'selected', {
        get: function() {
            if (cond(this))
                return this.hasAttribute('selected');
        },
        set: function(value) {
            if (cond(this))
                if (value)
                    this.setAttribute('selected', '')
            else
                this.removeAttribute('selected')
        }
    })
}
