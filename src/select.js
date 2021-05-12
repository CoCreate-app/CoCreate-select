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


document.addEventListener('click', function(e) {
  let target = e.target;
  let isOpened;
  //todo:
  // go up until you reach containerSelector or add same function to every element matches containerSelector: this way click event buble up and whenever 
  // the difference is the first one little ram improve and second one a little cpu improve
  // and check if it's in container
  // also save last open element to close
  for (let [el, instance] of container) {
    if (el.contains(target)) {
      if (target.matches('.remove'))
        instance.unselectOption(target.parentNode);
      else if (el.classList.contains('open'))
        instance.close()
      else
        instance.open()

    }
    else if (el.classList.contains('open'))
      instance.close()
  }




});


function CoCreateSelect(c) {
  this.init(c);
}

CoCreateSelect.prototype = {

  isMultiple: function() {
    return this.selectContainer.hasAttribute('multiple') ? true : false;
  },
  init: function(selectContainer) {
    if (!selectContainer.matches(containerSelector))
      return console.warn('an element rejected to be identified as a cocreate-select: element does not match with ' + containerSelector, selectContainer)

    if (selectContainer.querySelector(containerSelector))
      return console.warn('an element rejected to be identified as a cocreate-select: cocreate-select can not be nested another cocreate-select', selectContainer);

    if (container.has(selectContainer))
      return;


    this.selectContainer = selectContainer;
    this.selectedContainer = selectContainer.querySelector(`:scope > ${selectedTagName}`);
    if (!this.selectedContainer) {
      this.selectedContainer = document.createElement(selectedTagName)
      selectContainer.prepend(this.selectedContainer)
    }
    this.input = selectContainer.querySelector(` :scope > ${inputSelector}`);
    let lastEl = selectContainer.children[selectContainer.children.length - 1];


    for (let option of this.getOptions())
      if (option.hasAttribute('selected'))
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

    this.selectContainer.addEventListener('click', function(e) {
      let el = e.target;

      while (!el.matches(optionSelector)) {
        el = el.parentElement;
        if (!el) return;
      }

      self.selectOption(el, true)
    });
    container.set(selectContainer, this);
  },

  open: function() {
    this.selectContainer.classList.add('open');
    if (this.input)
      this.input.focus();
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
  },

  close: function() {
    if (this.input)
      this.input.value = ""
    this.selectContainer.classList.remove('open');
    this.selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
  },
  getOptions: function() {
    return this.selectContainer.querySelectorAll(optionSelector);
  },
  unselectAll: function() {
    if (this.selectedContainer.children.length)
      for (let el of this.selectedContainer.children)
        if (selectedToOption.has(el))
          this.unselectOption(selectedToOption.get(el));
  },

  selectOption: function(option, closeOnMultiple = true, innerText, doEvent = true) {
    if (!option) return;
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
      // todo: when an option is not found. just use option itself and remvove these lines
      optionToSelected.set(selectedOption, selectedOption);
      selectedToOption.set(selectedOption, selectedOption);
    }
    else {
      value = option.getAttribute('value');
      selectedOption = option.cloneNode(true);
      option.setAttribute('selected', "");
      optionToSelected.set(option, selectedOption);
      selectedToOption.set(selectedOption, option);
    }



    selectedOption.appendChild(removeElement.cloneNode(true));

    this.selectedContainer.appendChild(selectedOption);
    doEvent && this.__fireSelectedEvent({ unselectOption: value })
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
      if (selectedToOption.has(option))
        option = selectedToOption.get(option);
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


export default { init: (el) => new CoCreateSelect(el) };
