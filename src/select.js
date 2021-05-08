import observer from '@cocreate/observer';

// options
const containerSelector = 'cocreate-select, div.select--field';
const inputSelector = 'input';
const optionsSelector = 'cc-options';
const optionSelector = "cc-option";
const selectedSelector = "seleccted";


// const optionTagNameUpper = optionTagName.toUpperCase();
const container = new Map();

function addAttribute(containerSelector, att) {
  return containerSelector.split(',').map(s => s.trim() + att).join(', ')
}



function CoCreateSelect(c) {
  this.init(c);
}


function getValue(node) {
  let values = Array.from(node.querySelectorAll('[selected]')).map((item) => item.getAttribute('value'))

  return node.getAttribute('multiple') !== null ? values : (values[0] || '')
}

function setValue(data) {

  //      [name="${data['name']}"]\
  let selector = addAttribute(containerSelector,
    `[data-collection="${data['collection']}"][data-document_id="${data['document_id']}"][name]`);

  for (let el of document.querySelectorAll(selector)) {
    const name = el.getAttribute('name');
    container.get(el).__renderValue(null, data['data'][name]);
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
    this.selectOptions = selectContainer.querySelector(optionsSelector);


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
          let selectedOptions = selectContainer.querySelectorAll('[selected]');
          if (!selectedOptions.length) return;
          selectedOptions[selectedOptions.length - 1].remove();
          self.save(selectContainer)
          self.__fireSelectedEvent(selectContainer)

        }
      })
    }

    document.addEventListener('click', function(event) {
      var isClickInside = self.selectContainer.contains(event.target);
      if (!isClickInside)
        self.__closeDropDown();

    });

    this.selectOptions.addEventListener('click', function(e) {
      let el = e.target;
      if (!self.selectOptions.contains(el.parentElement))
        return;

      if (!el.matches(optionSelector))
        while (el && !el.matches(optionSelector)) {
          el = el.parentElement;
        }

      if (!el.classList.contains('option'))
        return;

      // check if data exist
      let value = el.getAttribute('value');

      if (!self.isMultiple())
        self.removeValues()
      self.addValue(value, el.innerText ? el.innerText : value)
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
      else if (!self.selectOptions.classList.contains('open')) {
        self.__openDropDown(selectContainer)
      }

    }, true);
  },

  // todo: add focus parameter
  __openDropDown: function() {
    this.input.focus();
    this.selectContainer.classList.add('open');
    this.selectContainer.classList.add('active');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
  },

  __closeDropDown: function() {
    this.selectContainer.classList.remove('open');
    this.selectContainer.classList.remove('active');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
  },


  removeValues: function() {
    this.selectContainer.querySelectorAll('[selected]')
      .forEach((item) => item.remove())
  },
  __renderValue: function(depricatedSelectContainer, value) {
    if (!value) return;

    this.removeValues();
    let option = this.selectOptions.querySelector(`${optionSelector}[value="${value}"]`)
    if (option) {
      let selectedOption = option.cloneNode(true)
      selectedOption.classList.remove('option');
      this.addByOption(selectedOption)
    }
    else
      this.addValue(value);

  },

  renderValue: function(target, value) {
    if (container.has(target))
      container.get(target).addValue(value)
  },

  addValue: function(value, text) {
    let selectedOption = document.createElement('li');
    selectedOption.classList.add('option')
    selectedOption.setAttribute('value', value);
    selectedOption.innerText = text ? text : value;
    this.addByOption(selectedOption)
  },
  // todo: implement
  // selectOption: function(){},
  addByOption: function(option) {

    let span = document.createElement('span');
    span.innerText = 'x';
    span.classList.add('remove');

    option.setAttribute('selected', "");
    option.appendChild(span);

    if (!this.isMultiple()) {
      this.__closeDropDown();
    }
    this.selectContainer.insertBefore(option, this.input ? this.input : this.selectOptions);
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


  observer.init({
    name: 'CoCreateSelect',
    observe: ['subtree', 'childList'],
    include: containerSelector,
    callback: function(mutation) {
      // console.log(mutation)
      new CoCreateSelect.init(mutation.target)
    }
  })



  // init dnd
  document.addEventListener('dndsuccess', function(e) {
    const { dropedEl, dragedEl } = e.detail;
    if ((typeof dropedEl.tagName != 'undefined' && dropedEl.tagName.toLowerCase() == 'cocreate-select') ||
      dropedEl.classList.contains('select--field')) {
      dropedEl.save(dropedEl)
      dropedEl.__fireSelectedEvent(dropedEl, )
    }
  })

  let containerList = document.querySelectorAll(containerSelector);

  for (let selectCon of containerList)
    new CoCreateSelect(selectCon);
}


if (document.readyState == 'complete')
  init();
else
  window.addEventListener('load', init)






export default { init: CoCreateSelect, ...CoCreateSelect };
