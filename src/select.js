/*global CustomEvent*/
import observer from '@cocreate/observer';
import selectedAtt from './selectedAtt';
import optionsAtt from './optionsAtt';
import selectedOptionsAtt from './selectedOptionsAtt';
import selectedIndexAtt from './selectedIndexAtt';
import { parse, addAttribute } from './utils'
import {
  containerSelector,
  inputSelector,
  optionsSelector,
  optionSelector,
  optionTagName,
  selectedTagName,
  removeMarkup
}
from './config';

selectedAtt((el) => {
  return el.matches(`${optionsSelector} > ${optionSelector}, ${addAttribute(containerSelector, '>' + optionSelector)}`)
})

optionsAtt((el) => el.matches(containerSelector))

selectedOptionsAtt((el) => el.matches(containerSelector))
selectedIndexAtt((el) => el.matches(containerSelector))






export const container = new Map();
export const optionToSelected = new Map();
export const selectedToOption = new Map();
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

    for (let option of this.getOptions())
      if (option.getAttribute('selected'))
        this.selectOption(option)

    const self = this;

    if (this.input) {

      this.input.addEventListener('keydown', function(e) {
        let keyCode = e.keyCode;
        if (keyCode == 13) {
          e.preventDefault()
        }

        if (keyCode == 13 && this.value.length > 0) {
          self.addValue(this.value);
          self.__fireSelectedEvent({ selectContainer })
          this.value = '';
        }
        else if (keyCode == 8 && !this.value.length) {
          let selectedContainer = self.selectedContainer.children;
          if (!selectedContainer.length) return;
          let option = selectedToOption.get(selectedContainer[selectedContainer.length - 1])
          self.unselectOption(option)
          self.__fireSelectedEvent({ selectContainer })

        }
      })
    }

    document.addEventListener('click', function(event) {
      var isClickInside = self.selectContainer.contains(event.target);
      if (!isClickInside)
        self.close();

    });

    this.optionsContainer.addEventListener('click', function(e) {
      let el = e.target;
      if (!self.optionsContainer.contains(el.parentElement))
        return;

      if (!el.matches(optionSelector))
        while (el && !el.matches(optionSelector)) {
          el = el.parentElement;
        }
      if(!el) return;
      self.selectOption(el, true)
      self.__fireSelectedEvent({ selectContainer })

    });

    selectContainer.addEventListener('click', function(e) {
      // remove seletec item or open dropdown
      if (e.target.matches('.remove')) {
        // todo: search for cc-option
        e.target.parentNode.remove();
        self.__fireSelectedEvent({ selectContainer })

      }
      else if (!self.optionsContainer.classList.contains('open')) {
        self.open(selectContainer)
      }
    }, true);
  },


  open: function() {
    this.input.focus();
    this.selectContainer.classList.add('open');
    this.selectContainer.classList.add('active');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
  },

  close: function() {
    this.selectContainer.classList.remove('open');
    this.selectContainer.classList.remove('active');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
  },

  unselectAll: function() {
    for (let el of this.selectedContainer.children)
      if (selectedToOption.has(el))
        this.unselectOption(selectedToOption.get(el));

  },
  __renderValue: function(depricatedSelectContainer, value) {
    if (!value) return;

    this.unselectAll();

    let option = this.getOptions().find(el => el.getAttribute('value') == value);
    if (option)
      this.selectOption(option, false)
    else
      this.addValue(value);

  },


  addValue: function(value, text) {
    let selectedOption = document.createElement(optionTagName);
    selectedOption.setAttribute('value', value);
    selectedOption.innerText = text ? text : value;
    this.selectOption(selectedOption, true);
    return selectedOption;
  },

  selectOption: function(option, closeOnMultiple) {
    option.setAttribute('selected', "");
    let newOption = option.cloneNode(true);
    optionToSelected.set(option, newOption);
    selectedToOption.set(newOption, option);
    newOption.appendChild(removeElement.cloneNode(true));
    if (!this.isMultiple()) {
      closeOnMultiple && this.close();
      this.unselectAll();
    }
    this.selectedContainer.appendChild(newOption);
  },
  /**
   * unselect a cc-select option
   * 
   * @param [HTMLElement|String] option the element to unselect or a string with value attribute, 
   *  if it's an element, the element should be from where cc-options container 
   * 
   * @return undefined
   * */
  unselectOption: function(option) {
    let value;
    if (typeof option != 'string')
      value = option
    else {
      option.removeAttribute('selected');
      value = option.getAttribute('value');
    }

    let selectedOption = this.selectedContainer.querySelector(`[value="${value}"]`);
    if (selectedOption) {
      optionToSelected.delete(option);
      selectedToOption.delete(selectedOption);
      selectedOption.remove();
    }
  },


  // for crdt and outsider cal
  __fireSelectedEvent: function({ selectContainer, detail = {} }) {

    let event = new CustomEvent('input', {
      bubbles: true,
      detail,
    });
    Object.defineProperty(event, 'target', { writable: false, value: selectContainer });
    selectContainer.dispatchEvent(event);

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
      dropedEl.__fireSelectedEvent({ selectContainer: dropedEl })
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




function template({ collection, document_id, ...data }) {

  let selector = addAttribute(containerSelector,
    `[data-collection="${collection}"][data-document_id="${document_id}"][name]`);

  for (let el of document.querySelectorAll(selector)) {
    const name = el.getAttribute('name');
    container.get(el).__renderValue(null, data['data'][name]);
  }

}

export default { init: (el) => new CoCreateSelect(el), template };
