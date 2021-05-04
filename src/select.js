import CoCreateObserver from '@cocreate/observer';
// options
let containerSelector = 'cocreate-select, div.select--field';
let inputSelector = 'input';
let ulSeletablesSelector = 'ul.selectable--list';
let onOpenName = 'CoCreateSelect-open';
const isInit = new Map();


  
  function CoCreateSelect(container) {
    const mainContainer = container || document;
    
    let containerList = mainContainer.querySelectorAll(containerSelector);
    
    for(let i = 0 ; i < containerList.length ; i++)
      this.__initSelect(containerList[i]);
    
  }


CoCreateSelect.prototype = {
  
  
// map from container to class  
  // __initEvents: function() {
  //   const self = this;
  //   document.addEventListener('dndsuccess', function(e) {
		// 	const {dropedEl, dragedEl} = e.detail;
  //     if ( dropedEl.tagName.toLowerCase() == 'cocreate-select'
  //         || dropedEl.classList.contains('select--field')) 
  //     {
  //       self.save(dropedEl)
  //       self.__fireSelectedEvent(dropedEl, )
  //     }
		// })
  // },
  isMultiple: ()=> selectContainer.hasAttribute('multiple') ? true : false,
  init: function(selectContainer) {
  
    this.selectContainer = selectContainer;
    this.input = selectContainer.querySelector(inputSelector);
    this.ulelectables = selectContainer.querySelector(ulSeletablesSelector);
    
    if(isInit.has(selectContainer)) 
      return;
    isInit.set(selectContainer, true)



    const self = this;
    
    if (this.input) {

      this.input.addEventListener('keydown', function(e) {
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
    
    this.ulSelectables.addEventListener('click', function (e) {
      if (!e.target.matches('li')) {
        let li = e.target;
        while(li && li.tagName != 'LI') {
          li = li.parentElement;
        }
        
        if ( li.classList.contains('selectable')) {
          // check if data exist
          let value = li.getAttribute('value');
          let selectValue = self.getValue(selectContainer);
          
          if (value == selectValue || selectValue.indexOf(value) !== -1) return;
          

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
      if (!this.ulSelectables.classList.contains('open')) {
        self.__openDropDown(selectContainer)
      }
      let input = selectContainer.querySelector('input');
      if (input) {
        input.focus()
      }
    }, true);
  },
  
  // todo: add focus parameter
  __openDropDown: function(selectContainer) {


      if (this.input) {
        this.input.classList.add('open');
        this.input.focus();
      }
      
      if (this.ulelectables && this.ulelectables) {
        this.ulelectables.classList.add('open');
      }
      selectContainer.classList.add('active');
      
      selectContainer.dispatchEvent(new CustomEvent(onOpenName));
    
  },
  
  __closeDropDown: function(selectContainer) {

      if (input && input.classList.contains('open')) {
        input.classList.remove('open');
      }
      
      let value = input.value;

      const active = selectContainer.hasAttribute('active')
      if (!active && (!value || value.length == 0)) 
        selectContainer.classList.remove('active');

      if (this.ulelectables && this.ulelectables.classList.contains('open')) {
        this.ulelectables.classList.remove('open');
        selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
      
      }
  },


  

  
  renderValue: function(selectContainer, values) {
    if (!values) 
      return;
    else if(typeof values === 'string')
      values = [values];
    
    let selectedItems = selectContainer.querySelectorAll('[selected]');
    selectedItems.forEach((item) => item.remove())


    for (let value of values) {

      if (selectedItem){
        this.__selectItem(selectedItem, selectContainer);
      } else {
        this.__selectValue(values[i], selectContainer)
      }
    }


  },

  __selectValue: function(value, selectContainer) {
    let currentValue = this.getValue(selectContainer);
    if (currentValue == value || currentValue.indexOf(value) > -1) return;
    

    let span = document.createElement('span');
    span.innerText='x';
    span.classList.add('remove');
    let li = document.createElement('li');
    li.setAttribute('value', value);
    li.innerText = value;

    li.setAttribute('selected', "");
    li.classList.remove('selectable');
    li.appendChild(span);

    selectContainer.insertBefore(li, this.input ? this.input : this.ulelectables);

  },
  
  __selectItem: function(li, selectContainer, focus=true) {
    let type = 
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
    selectContainer.insertBefore(selectedItem, searchInput ? searchInput : this.ulelectables);
    
    if (type == 'single') {
      this.__closeDropDown(selectContainer);
    }
  },
  
  // gets all value 
  getValue:function(node) {
    let values = node.querySelectorAll('[selected]')
      .map((item) => item.getAttribute('value'))
  
    return this.isMultiple()  ? values : (values[0] || '')
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

