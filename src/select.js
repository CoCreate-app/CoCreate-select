import CoCreateObserver from '@cocreate/observer';
const isInit = new Map()
const CoCreateSelect = {
  
  init: function() {
    this.initElement();
    // this.__initEvents()
  },
  
  initElement: function(container) {
    const mainContainer = container || document;
    
    if (!mainContainer.querySelectorAll) {
      return;
    }
  
    let containerList = mainContainer.querySelectorAll('cocreate-select, div.select--field');
    
    for(let i = 0 ; i < containerList.length ; i++){
      let selectContainer = containerList[i];
      this.__initSelect(selectContainer);
    }
  },
  
  __initEvents: function() {
    const self = this;
    document.addEventListener('dndsuccess', function(e) {
			const {dropedEl, dragedEl} = e.detail;
      if ((typeof dropedEl.tagName != 'undefined' && dropedEl.tagName.toLowerCase() == 'cocreate-select') 
          || dropedEl.classList.contains('select--field')) 
      {
        self.save(dropedEl)
        self.__fireSelectedEvent(dropedEl, )
      }
		})
  },

  __initSelect: function(selectContainer) {
  
    if(isInit.has(selectContainer)) 
      return;
      
    isInit.set(selectContainer, true)

    
    let input = selectContainer.querySelector('input');
    let ul_selector = selectContainer.querySelector('ul.selectable--list');

    const self = this;
    
    if (input) {

      input.addEventListener('keydown', function(e) {
        let keyCode = e.keyCode;
        if (keyCode == 13) {
          e.preventDefault()
        }
        
        if (keyCode == 13 && this.value.length > 0) {
          self.__selectValue(this.value, selectContainer);
          self.save(selectContainer)
          self.__fireSelectedEvent(selectContainer)
          this.value = '';
        } else if (keyCode == 8 && !this.value.length) {
          let selectedItems = selectContainer.querySelectorAll('[selected]');
          if (selectedItems.length > 0) {
            selectedItems[selectedItems.length -1].remove();
            self.save(selectContainer)
            self.__fireSelectedEvent(selectContainer)
          }
        }
      })
    }
    
    document.addEventListener('click', function(event) {
      var isClickInside = selectContainer.contains(event.target);
      if (!isClickInside) {
        self.__closeDropDown(selectContainer);
      }
    });
    
    ul_selector.addEventListener('click', function (e) {
      if (!e.target.matches('li')) {
        let li = e.target;
        while(typeof li.tagName != 'undefined' && li.tagName.toLowerCase() != 'li') {
          li = li.parentNode;
        }
        
        if (li.classList && li.classList.contains('selectable')) {
          // check if data exist
          let value = li.getAttribute('value');
          let selectValue = self.getValue(selectContainer);
          
          if (value == selectValue || selectValue.indexOf(value) > -1) return;
          
          /// here emit event
          self.__selectItem(li, selectContainer)
          self.save(selectContainer)
          self.__fireSelectedEvent(selectContainer)
        }
      }
    });
  
    selectContainer.addEventListener('click', function (e) {
      if (e.target.matches('.remove')) {
        e.target.parentNode.remove();
        self.save(selectContainer)
        self.__fireSelectedEvent(selectContainer)
        return;
      }
      if (!ul_selector.classList.contains('open')) {
        self.__openDropDown(selectContainer)
      }
      let input = selectContainer.querySelector('input');
      if (input) {
        input.focus()
      }
    }, true);
  },
  
  __openDropDown: function(selectContainer, focus=true) {
    if(focus){
      let input = selectContainer.querySelector('input');
      let ul_selector = selectContainer.querySelector('ul.selectable--list');
      
      if (input) {
        input.classList.add('open');
        input.focus();
      }
      
      if (ul_selector && ul_selector) {
        ul_selector.classList.add('open');
      }
      selectContainer.classList.add('active');
      
      selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
    }
  },
  
  __closeDropDown: function(selectContainer) {
      let input = selectContainer.querySelector('input');
      let ul_selector = selectContainer.querySelector('ul.selectable--list');
      if (input && input.classList.contains('open')) {
        input.classList.remove('open');
      }
      
      let value = input.value;

      const active = selectContainer.hasAttribute('active')
      if (!active && (!value || value.length == 0)) 
        selectContainer.classList.remove('active');

      if (ul_selector && ul_selector.classList.contains('open')) {
        ul_selector.classList.remove('open');
        selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
      
      }
  },

  setValue: function(data) {
    const self = this;
    let selectContainers = document.querySelectorAll('cocreate-select,.select--field');
    selectContainers.forEach((selectEl) => {
      const collection = selectEl.getAttribute('data-collection') || 'module_activity';
      const id = selectEl.getAttribute('data-document_id');
      const name = selectEl.getAttribute('name');
      if (data['collection'] == collection && data['document_id'] == id && name) {
        self.__renderValue(selectEl, data['data'][name]);
      } 
    })
  },
  
  renderValue: function(target, value) {
    this.__renderValue(target, value);
  }, 
  
  __renderValue: function(selectContainer, values) {
    if (!values) {
      return;
    }
    let selectedItems = selectContainer.querySelectorAll('[selected]');
    selectedItems.forEach((item) => item.remove())

    let ul_selector = selectContainer.querySelector('ul.selectable--list');
    if (values && typeof values === 'string') {
      values = [values];
    }

    for (let i = 0; i < values.length; i++) {
      const selectedItem = ul_selector.querySelector("li[value='" + values[i] + "']");
      if (selectedItem){
        this.__selectItem(selectedItem, selectContainer,false);
      } else {
        this.__selectValue(values[i], selectContainer,false)
      }
    }

    try {
      if (CoCreateFloatLabel) {
        CoCreateFloatLabel.update(selectContainer, values && values.length > 0)
      }
    } catch (err) {
      
    }
  },
  
  __selectValue: function(value, selectContainer) {
    let currentValue = this.getValue(selectContainer);
    if (currentValue == value || currentValue.indexOf(value) > -1) return;
    
    let searchInput = selectContainer.querySelector('input');
    let ul_selector = selectContainer.querySelector('ul.selectable--list');
    
    let span = document.createElement('span');
    span.innerHTML='x';
    span.classList.add('remove');
    let li = document.createElement('li');
    li.setAttribute('value', value);
    // li.setAttribute('data-value', value);
    li.innerHTML = value;

    li.setAttribute('selected', "");
    // li.classList.add('selected');
    li.classList.remove('selectable');
    li.appendChild(span);

    selectContainer.insertBefore(li, searchInput ? searchInput : ul_selector);

  },
  
  __selectItem: function(li, selectContainer, focus=true) {
    let type = selectContainer.hasAttribute('multiple') ? 'multiple' : 'single';
    let searchInput = selectContainer.querySelector('input');
    let ul_selector = selectContainer.querySelector('ul.selectable--list');
    
    if (type == 'single') {
      let selectedItems = selectContainer.querySelectorAll('[selected]');
      selectedItems.forEach((item) => item.remove())
      if (searchInput) {
        searchInput.value = '';
      }
    } 
    let span = document.createElement('span');
    span.innerHTML='x';
    span.classList.add('remove');
    let selectedItem = li.cloneNode(true);
    
    // selectedItem.classList.add('selected');
    selectedItem.setAttribute("selected", "");
    selectedItem.classList.remove('selectable');
    selectedItem.appendChild(span);
    selectContainer.insertBefore(selectedItem, searchInput ? searchInput : ul_selector);
    
    if (type == 'single') {
      this.__closeDropDown(selectContainer);
    }
  },
  
  getValue:function(node) {
    let type = node.hasAttribute('multiple') ? 'multiple' :'single'
    let selectedItems = node.querySelectorAll('[selected]');
    
    let value = [];
    if (selectedItems.length > 0) {
      selectedItems.forEach((item) => value.push(item.getAttribute('value')))
    } 
    value = (type === 'multiple') ? value : (value[0] || '')
    return value;
  },
  
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
  
  __fireSelectedEvent: function(element) {
    element.dispatchEvent(new CustomEvent('selectedValue'));
    element.dispatchEvent(new CustomEvent('input',{ bubbles: true}));
    let value = this.getValue(element)
    document.dispatchEvent(new CustomEvent('CoCreate-selected', {
      detail: {
        element: element,
        value: value
      }
    }));
  }
}

export default CoCreateSelect;

