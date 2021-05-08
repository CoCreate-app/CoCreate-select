import observer from '@cocreate/observer';
import selectedAtt from './selectedAtt';
import optionsAtt from './optionsAtt';
import selectedOptionsAtt from './selectedOptionsAtt';
import { parse, addAttribute } from './utils'
// options
const containerSelector = 'cocreate-select, div.select--field';
const inputSelector = 'input';
const optionsSelector = 'cc-options';
const optionSelector = "cc-option";
const optionTagName = "cc-option";
const selectedTagName = "selected";
const removeMarkup = '<span class="remove">x</span>'



selectedAtt((el) => {
  return el.matches(`${optionsSelector} > ${optionSelector}, ${addAttribute(containerSelector, '>' + optionSelector)}`)
})

optionsAtt((el) => el.matches(containerSelector))

selectedOptionsAtt((el) => el.matches(containerSelector))





// const optionTagNameUpper = optionTagName.toUpperCase();
export const container = new Map();
const removeElement = parse(removeMarkup);




function CoCreateSelect(c) {
  this.init(c);
}



CoCreateSelect.prototype = {

  isMultiple: function() {
    return this.selectContainer.hasAttribute('multiple') ? true : false;
  },
  init: function(selectContainer) {
    if (container.has(selectContainer))
      return;
    container.set(selectContainer, this)

    this.selectContainer = selectContainer;
    this.selectedContainer = selectContainer.querySelector(selectedTagName);
    if (!this.selectedContainer) {
      this.selectedContainer = document.createElement(selectedTagName)
      selectContainer.prepend(this.selectedContainer)
    }
    this.input = selectContainer.querySelector(inputSelector);
    this.optionsContainer = selectContainer.querySelector(optionsSelector);
    if (!this.optionsContainer) {
      this.optionsContainer = this.selectContainer;
      this.getOptions = function() {
        return this.selectContainer.querySelectorAll('input~*');
      }
    }
    else
      this.getOptions = function() {
        return this.optionsContainer.children;
      }

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

    this.optionsContainer.addEventListener('click', function(e) {
      let el = e.target;
      if (!self.optionsContainer.contains(el.parentElement))
        return;

      if (!el.matches(optionSelector))
        while (el && !el.matches(optionSelector)) {
          el = el.parentElement;
        }

      if (!el.classList.contains('option'))
        return;

      // check if data exist
      let value = el.getAttribute('value');

      // todo: hide selected options
      el.setAttribute('selected', '');

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
      else if (!self.optionsContainer.classList.contains('open')) {
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
    let option = this.optionsContainer.querySelector(`${optionSelector}[value="${value}"]`)
    if (option) {
      let selectedOption = option.cloneNode(true)
      selectedOption.classList.remove('option');
      this.selectOption(selectedOption)
    }
    else
      this.addValue(value);

  },

  renderValue: function(target, value) {
    if (container.has(target))
      container.get(target).addValue(value)
  },

  addValue: function(value, text) {
    let selectedOption = document.createElement(optionTagName);
    selectedOption.setAttribute('value', value);
    selectedOption.innerText = text ? text : value;
    this.selectOption(selectedOption)
  },
  // todo: implement
  // selectOption: function(){},
  selectOption: function(option) {
    option.setAttribute('selected', "");
    option.appendChild(removeElement.cloneNode(true));
    if (!this.isMultiple()) {
      this.__closeDropDown();
    }
    this.selectedContainer.appendChild(option);
  },

  // gets all value 
  getValue: function(node) {
    let values = Array.from(node.querySelectorAll('[selected]')).map((item) => item.getAttribute('value'))

    return node.getAttribute('multiple') !== null ? values : (values[0] || '')
  },


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




function setValue(data) {

  //      [name="${data['name']}"]\
  let selector = addAttribute(containerSelector,
    `[data-collection="${data['collection']}"][data-document_id="${data['document_id']}"][name]`);

  for (let el of document.querySelectorAll(selector)) {
    const name = el.getAttribute('name');
    container.get(el).__renderValue(null, data['data'][name]);
  }

}

export default { init: (el) => new CoCreateSelect(el), setValue };
