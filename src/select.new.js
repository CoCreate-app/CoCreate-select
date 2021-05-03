import CoCreateObserver from '@cocreate/observer';
// const option 

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
  
  	if (CoCreateObserver.getInitialized(selectContainer, "cocreate-select")) {
  		return;
  	}
  	CoCreateObserver.setInitialized(selectContainer, "cocreate-select")
  	
    const searchInput = selectContainer.querySelector('input');
    const options = selectContainer.querySelector('.selectable--list');
    const selected = selectContainer.querySelectorAll('[selected]');
    const type = selectContainer.hasAttribute('multiple') ? 'multiple' :'single'
    
    const self = this;
    
    if (searchInput) {

      searchInput.addEventListener('keydown', function(e) {
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
          let selected = selectContainer.querySelectorAll('[selected]');
          if (selected.length > 0) {
            selected[selected.length -1].remove();
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
    
    options.addEventListener('click', function (e) {
      if (!e.target.matches('.selectable')) {
        let option = e.target;
        // while(typeof li.tagName != 'undefined' && li.tagName.toLowerCase() != 'li') {
        //   option = li.parentNode;
        // }
        
        if (options.classList && options.classList.contains('selectable')) {
          // check if data exist
          let value = options.getAttribute('value');
          let selectValue = self.getValue(selectContainer);
          
          if (value == selectValue || selectValue.indexOf(value) > -1) return;
          
          /// here emit event
          self.__selectItem(option, selectContainer)
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
      if (!selectContainer.classList.contains('open')) {
        self.__openDropDown(selectContainer)
      }
      if (searchInput) {
        searchInput.focus()
      }
    }, true);
  },
  
  __openDropDown: function(selectContainer, focus=true) {
    if(focus){
      selectContainer.classList.add('active');
      selectContainer.classList.add('open');
      
      selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
    }
  },
  
  __closeDropDown: function(selectContainer) {
      let searchInput = selectContainer.querySelector('input');;
      let value = searchInput.value;

      const active = selectContainer.hasAttribute('active')
      if (!active && (!value || value.length == 0)) 
        selectContainer.classList.remove('active');

      if (selectContainer && selectContainer.classList.contains('open')) {
        selectContainer.classList.remove('open');
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
    // let selected = selectContainer.querySelectorAll('[selected]');
    selected.forEach((item) => item.remove())

    if (values && typeof values === 'string') {
      values = [values];
    }

    for (let i = 0; i < values.length; i++) {
      const selectedItem = options.querySelector(".option[value='" + values[i] + "']");
      if (selectedItem){
        this.__selectItem(selectedItem, selectContainer,false);
      } else {
        this.__selectValue(values[i], selectContainer,false)
      }
    }

  },
  
  __selectValue: function(value, selectContainer) {
    let currentValue = this.getValue(selectContainer);
    if (currentValue == value || currentValue.indexOf(value) > -1) return;
    
    let searchInput = selectContainer.querySelector('input');

    
    let removeSelected = document.createElement('span');
    removeSelected.innerHTML='x';
    removeSelected.classList.add('remove');
    let li = document.createElement('li');
    li.setAttribute('value', value);
   
    // li.setAttribute('data-value', value);
    li.innerHTML = value;

    li.setAttribute('selected', "");
    // li.classList.add('selected');
    li.classList.remove('selectable');
    li.appendChild(removeSelected);

    selectContainer.insertBefore(li, searchInput ? searchInput : options);

  },
  
  __selectItem: function(li, selectContainer, focus=true) {

    if (type == 'single') {
      selected.forEach((item) => item.remove())
      if (searchInput) {
        searchInput.value = '';
      }
    } 
    let span = document.createElement('span');
    span.innerHTML='x';
    span.classList.add('remove');
    let selectedItem = li.cloneNode(true);
    
    selectedItem.setAttribute("selected", "");
    selectedItem.classList.remove('selectable');
    selectedItem.appendChild(span);
    selectContainer.insertBefore(selectedItem, searchInput ? searchInput : options);
    
    if (type == 'single') {
      this.__closeDropDown(selectContainer);
    }
  },
  
  getValue:function(selectContainer) {
    let value = [];
    if (selected.length > 0) {
      selected.forEach((item) => value.push(item.getAttribute('value')))
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

