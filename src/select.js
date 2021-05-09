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
          self.selectOption(this.value);

          this.value = '';
        }
        else if (keyCode == 8 && !this.value.length) {
          let selectedContainer = self.selectedContainer.children;
          if (!selectedContainer.length) return;
          let option = selectedToOption.get(selectedContainer[selectedContainer.length - 1])
          self.unselectOption(option)


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
      if (!el) return;
      self.selectOption(el, true)


    });

    selectContainer.addEventListener('click', function(e) {
      // remove seletec item or open dropdown
      if (e.target.matches('.remove')) {
        this.unselectOption(e.target.parentNode);


      }
      else if (!self.optionsContainer.classList.contains('open')) {
        self.open(selectContainer)
      }
    }, true);
  },


  open: function() {
    this.input.focus();
    this.selectContainer.classList.add('open');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
  },

  close: function() {
    this.selectContainer.classList.remove('open');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
  },

  unselectAll: function() {
    for (let el of this.selectedContainer.children)
      if (selectedToOption.has(el))
        this.unselectOption(selectedToOption.get(el));

  },
  __renderValue: function(value) {
    if (!value) return;

    this.unselectAll();

    let option = this.getOptions().find(el => el.getAttribute('value') == value);
    if (option)
      this.selectOption(option, false)
    else
      this.addValue(value);

  },


  selectOption: function(option, closeOnMultiple = true, innerText) {


    if (this.isMultiple()) {
      let limit = this.selectContainer.getAttribute('data-limit_option');
      if (this.selectedContainer.children.length >= limit)
        return console.warn('limit for select is reached')

    }
    else if (this.selectedContainer.children.length)
      this.unselectAll();

    let selectedOption, value;
    if (typeof option == 'string') {
      selectedOption = document.createElement(optionTagName);
      selectedOption.setAttribute('value', option);
      value = option;
      selectedOption.innerText = innerText ? innerText : option;
    }
    else {
      option.setAttribute('selected', "");
      value = option.getAttribute('value');
      selectedOption = option.cloneNode(true);
      optionToSelected.set(option, selectedOption);
      selectedToOption.set(selectedOption, option);
    }



    selectedOption.appendChild(removeElement.cloneNode(true));
    if (!this.isMultiple() && closeOnMultiple)
      this.close();

    this.selectedContainer.appendChild(selectedOption);
    this.__fireSelectedEvent({ unselectOption: value })
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
    if (typeof option == 'string')
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
      this.__fireSelectedEvent({ unselectOption: value })
    }
  },


  // for crdt and outsider cal
  __fireSelectedEvent: function(detail) {

    let event = new CustomEvent('input', {
      bubbles: true,
      detail,
    });
    Object.defineProperty(event, 'target', { writable: false, value: this.selectContainer });
    this.selectContainer.dispatchEvent(event);

  }
}



function template({ collection, document_id, ...data }) {


  for (let [el, instance] of this.container) {
    const collection = el.getAttribute('data-collection') || 'module_activity';
    const id = el.getAttribute('data-document_id');
    const name = el.getAttribute('name');
    if (data['collection'] == collection && data['document_id'] == id && name) {
      instance.__renderValue(data['data'][name]);
    }
  }

}

export default { init: (el) => new CoCreateSelect(el), template };
