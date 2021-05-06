import CoCreateObserver from '@cocreate/observer';
// options
let containerSelector = 'cocreate-select, div.select--field';
let inputSelector = 'input';
let ulSeletablesSelector = 'ul.selectable--list';

const container = new Map();



// function alterSelector(){

// }

// alterSelector.prototype.addAttribute =

function addAttribute(containerSelector, att) {
  return containerSelector.split(',').map(s => s.trim() + att).join(', ')
}



function CoCreateSelect(c) {
  this.init(c);
}


function getValue(node) {
  let values = Array.from(node.querySelectorAll('[selected]')).map((item) => item.getAttribute('value'))

  return node.getAttribute('multiple') ? values : (values[0] || '')
}

function setValue(data) {

  //      [name="${data['name']}"]\
  let selector = addAttribute(containerSelector,
    `[data-collection="${data['collection']}"][data-document_id="${data['document_id']}"]`);

  for (let el of document.querySelectorAll(selector)) {
    const name = el.getAttribute('name');
    container.get(el).renderValue(data['data'][name]);
  }

}

CoCreateSelect.getValue = getValue;
CoCreateSelect.setValue = setValue;




CoCreateSelect.prototype = {

  isMultiple: function() {
    return this.selectContainer.hasAttribute('multiple') ? true : false;
  },
  init: function(selectContainer) {
    if (container.has(selectContainer))
      return;
    container.set(selectContainer, this)

    this.selectContainer = selectContainer;
    this.input = selectContainer.querySelector(inputSelector);
    this.ulSelectables = selectContainer.querySelector(ulSeletablesSelector);


    const self = this;

    if (this.input) {

      this.input.addEventListener('keydown', function(e) {
        let keyCode = e.keyCode;
        if (keyCode == 13) {
          e.preventDefault()
        }

        if (keyCode == 13 && this.value.length > 0) {
          self.addValue(this.value);
          self.save(selectContainer)
          self.__fireSelectedEvent(selectContainer)
          this.value = '';
        }
        else if (keyCode == 8 && !this.value.length) {
          let selectedItems = selectContainer.querySelectorAll('[selected]');
          if (!selectedItems.length) return;
          selectedItems[selectedItems.length - 1].remove();
          self.save(selectContainer)
          self.__fireSelectedEvent(selectContainer)

        }
      })
    }

    document.addEventListener('click', function(event) {
      var isClickInside = self.selectContainer.contains(event.target);
      if (!isClickInside || self.selectContainer != event.target)
        self.__closeDropDown();

    });

    this.ulSelectables.addEventListener('click', function(e) {
      // select an li from ul selectable
      let el = e.target;
      if (!self.ulSelectables.contains(el))
        return;

      if (!el.matches('li'))

        while (el && el.tagName != 'LI') {
          el = el.parentElement;
        }

      if (!el.classList.contains('selectable'))
        return;

      // check if data exist
      let value = el.getAttribute('value');
      let text = el.innerText;


      self.addValue(value, text)
      self.save(selectContainer)
      self.__fireSelectedEvent(selectContainer)

    });

    selectContainer.addEventListener('click', function(e) {
      // remove seletec item or open dropdown
      if (e.target.matches('.remove')) {
        e.target.parentNode.remove();
        self.save(selectContainer)
        self.__fireSelectedEvent(selectContainer)

      }
      else if (!self.ulSelectables.classList.contains('open')) {
        self.__openDropDown(selectContainer)
      }

    }, true);
  },

  // todo: add focus parameter
  __openDropDown: function() {
    this.input.classList.add('open');
    this.input.focus();
    this.ulSelectables.classList.add('open');
    this.selectContainer.classList.add('active');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
  },

  __closeDropDown: function() {
    this.input.classList.remove('open');
    this.ulSelectables.classList.remove('open');
    this.selectContainer.classList.remove('active');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
  },



  renderValue: function(value) {

    this.selectContainer.querySelectorAll('[selected]')
      .forEach((item) => item.remove())
    let seletable = this.ulSelectables.querySelector(`li[value="${value}"]`)
    if(seletable)
    {
      let li = seletable.cloneNode(true)
      li.classList.remove('selected');
      this.addValue( li)
    } else
   this.addValue(null, value);


  },


  addValue: function( li, value) {

    let span = document.createElement('span');
    span.innerText = 'x';
    span.classList.add('remove');
    let con;
    if(!li)
    {
        con = document.createElement('li');
        con.setAttribute('value', value);
        con.innerText = value;
    }

    con.setAttribute('selected', "");
    con.classList.remove('selectable');
    con.appendChild(span);

    if (!this.isMultiple()) {
      this.__closeDropDown();
    }
    this.selectContainer.insertBefore(li, this.input ? this.input : this.ulSelectables);
  },

  // gets all value 
  getValue,


  // for crdt
  save: function(selectEl) {
    if (!selectEl) {
      return;
    }
    let event = new CustomEvent('CoCreateSelect-save', {
      detail: {
        element: selectEl,
      }
    })

    document.dispatchEvent(event);
  },
  // for crdt and outsider call



  __fireSelectedEvent: function(element) {
    element.dispatchEvent(new CustomEvent('selectedValue'));
    element.dispatchEvent(new CustomEvent('input', { bubbles: true }));
    let value = this.getValue(element)
    document.dispatchEvent(new CustomEvent('CoCreate-selected', {
      detail: {
        element: element,
        value: value
      }
    }));
  }
}

function init(container) {
  // const mainContainer = container || document;

  let containerList = document.querySelectorAll(containerSelector);

  for (let selectCon of containerList)
    new CoCreateSelect(selectCon);
}


if (document.readyState == 'complete')
  init();
else
  window.addEventListener('load', init)



export default { init: CoCreateSelect, ...CoCreateSelect };
