const CoCreateSelect = {
  
  init: function() {
    this.initElement();
    this.__initSocketListeners()
    this.__initEvents()
  },
  
  initElement: function(container) {
    const mainContainer = container || document;
    
    if (!mainContainer.querySelectorAll) {
      return;
    }
  
    let containerList = mainContainer.querySelectorAll('cocreate-select, div.select--field');
    
    // if (containerList.length == 0 && 
    //   mainContainer.classList.contains('select--field') &&
    //   mainContainer.tagName === 'DIV') 
    // {
    //   containerList = [mainContainer];
    // }
    
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
        dropedEl.dispatchEvent(new CustomEvent('selectedValue'));
      }
		})
  },
  
  __initSocketListeners: function() {
    const self = this;
    CoCreateSocket.listen('readDocument', function(data) {
      self.__fetchedData(data)
    })
    
    CoCreateSocket.listen('updateDocument', function(data) {
      self.__fetchedData(data, true)
    })
  },
  
  __initSelect: function(selectContainer) {
  
  	if (CoCreateInit.getInitialized(selectContainer)) {
  		return;
  	}
  	CoCreateInit.setInitialized(selectContainer)
  	
    
    let input = selectContainer.querySelector('input');
    let ul_selector = selectContainer.querySelector('ul.selectable--list');
    let templateWrappers = selectContainer.querySelectorAll('[data-template_id][data-fetch_collection]');
    
    const self = this;
    
    if (input) {
      input.addEventListener('click', function (evt) {
        this.focus();
        if(!ul_selector.classList.contains("open")){
          self.__openDropDown(selectContainer);
        }
      });
      
      input.addEventListener('keydown', function(e) {
        let keyCode = e.keyCode;
        
        if (keyCode == 13 && this.value.length > 0) {
          
          // if (this.hasAttribute('data-template_id')) {
          //   return ;
          // }
          
          self.__selectValue(this.value, selectContainer);
          
          self.save(selectContainer)
          selectContainer.dispatchEvent(new CustomEvent('selectedValue'));

          this.value = '';
        } else if (keyCode == 8 && !this.value.length) {
          let selectedItems = selectContainer.querySelectorAll('.selected');
          
          if (selectedItems.length > 0) {
            selectedItems[selectedItems.length -1].remove();
            self.save(selectContainer)
            selectContainer.dispatchEvent(new CustomEvent('selectedValue'));

          }
        }
      })
      
      input.addEventListener('focusout', function(evt) {
        setTimeout(() => {
          if(evt.target!=document.activeElement || !selectContainer.hasAttribute('multiple'))
            self.__closeDropDown(selectContainer);
        }, 200)
      })
    }
    
    ul_selector.addEventListener('click', function (e) {
      if (!e.target.matches('li')) {
        let li = e.target;
        while(typeof li.tagName != 'undefined' && li.tagName.toLowerCase() != 'li') {
          li = li.parentNode;
        }
        
        if (li.classList && li.classList.contains('selectable')) {
          // check if data exist
          let value = li.getAttribute('data-value');
          let selectValue = self.getValue(selectContainer);
          
          if (value == selectValue || selectValue.indexOf(value) > -1) return;
          
          /// here emit event
          self.__selectItem(li, selectContainer)
          self.save(selectContainer)
          selectContainer.dispatchEvent(new CustomEvent('selectedValue'));
        }
      }
    });
  
    selectContainer.addEventListener('click', function (e) {
      if (e.target.matches('.remove')) {
        e.target.parentNode.remove();
        
        self.save(selectContainer)
        selectContainer.dispatchEvent(new CustomEvent('selectedValue'));
        return;
      }
      if (!ul_selector.classList.contains('open')) {
        self.__openDropDown(selectContainer)
      }
      let input = selectContainer.querySelector('input');
      input.focus()
    }, true);
      
    for (let j = 0; j < templateWrappers.length; j++) {
      let templateWrapper = templateWrappers[j];
      this.__initSelectTemplateWrapper(templateWrapper, selectContainer)
    }

    selectContainer.addEventListener('clicked-submitBtn', function() {
      saveSelectedDataIntoDB(this)
    })
    
    selectContainer.addEventListener('set-document_id', function() {
      saveSelectedDataIntoDB(this)
    })
    
    function saveSelectedDataIntoDB(element) {
      const value = self.getValue(element)
      const collection = element.getAttribute('data-collection') || 'module_activity';
    
      const id = element.getAttribute('data-document_id');
      const name = element.getAttribute('name');
      
      if (element.getAttribute('data-save_value') == 'false') {
        return;
      }
      CoCreate.updateDocument({
        'collection': collection, 
        'document_id': id, 
        'data' : { 
          [name] : value 
        },
        'metadata': ''
      })
    }
    
    this.__fetchValues(selectContainer);
  },
  
  __fetchValues: function(selectContainer) {
  
    let collection = selectContainer.getAttribute('data-collection') || 'module_activity';
    let id = selectContainer.getAttribute('data-document_id');
    
    if (collection && id) {
      CoCreate.readDocument({
        'collection': collection, 
        'document_id': id
      })
    }
  },
  
  __openDropDown: function(selectContainer, focus=true) {
    if(focus){
      let input = selectContainer.querySelector('input');
      let ul_selector = selectContainer.querySelector('ul.selectable--list');
      
      if (input) {
        input.classList.add('open');
        if(focus){
        input.focus();  
        }
      }
      
      if (ul_selector) {
        ul_selector.classList.add('open');
      }
  
      selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-open'));
    }
    
  },
  
  __closeDropDown: function(selectContainer) {
    /*let type = selectContainer.hasAttribute('multiple') ? 'multiple' : 'single';
    console.log("close ",type)
    if (type == 'single') {
    */
      let input = selectContainer.querySelector('input');
      let ul_selector = selectContainer.querySelector('ul.selectable--list');
      
      if (input) {
        input.classList.remove('open');
      }
      
      if (ul_selector) {
        ul_selector.classList.remove('open');
      }
      
      selectContainer.dispatchEvent(new CustomEvent('CoCreateSelect-close'));
    /*}*/
  },

  __fetchedData: function(data, isUpdate) {
    
    let selectContainers = document.querySelectorAll('cocreate-select,.select--field');
    let status = false;
    
    let fetchInfos = [];
    
    for (let i=0; i < selectContainers.length; i++) {
      let selectContainer = selectContainers[i];
      
      var collection = selectContainer.getAttribute('data-collection') ? selectContainer.getAttribute('data-collection') : 'module_activity';
      var id = selectContainer.getAttribute('data-document_id');
      var name = selectContainer.getAttribute('name');
      
      if (data['collection'] == collection && data['document_id'] == id && name) {
        let w_fetchData = this.__renderValue(selectContainer, data['data'][name]);
        fetchInfos = fetchInfos.concat(w_fetchData)
        if (data['data'][name]) {
          status = true;
        }
        
      } 
    }
    
    if (isUpdate && status) {
      //. remove repact items
      let result_fetch = []
      for (var i = 0; i < fetchInfos.length; i++) {
        if (!fetchInfos[i]) continue;
        if (!result_fetch.includes[fetchInfos[i]]) {
          result_fetch.push(fetchInfos[i]);
  
          CoCreate.readDocument({
            'collection': fetchInfos[i]['collection'], 
            'document_id': fetchInfos[i]['id']
          })
        }
      }
    }
  
  },
  
  __renderValue: function(selectContainer, values) {
    if (!values) {
      return;
    }
    let selectedItems = selectContainer.querySelectorAll('.selected');
    for (let i=0; i < selectedItems.length; i++) {
      selectedItems[i].remove();
    }
    
    let input = selectContainer.querySelector('input');
    let ul_selector = selectContainer.querySelector('ul.selectable--list');
    
    let fetchInfo = [];
    
    if (values && typeof values == 'object') {
      for (let i = 0; i < values.length; i++) {
        let value = values[i];
        
        if (ul_selector.querySelector('.template')) {
          let template = ul_selector.querySelector('.template');
          let passTo = ul_selector.getAttribute('data-pass_to');
          let collection = ul_selector.getAttribute('data-fetch_collection')
          let result = this.__getSelectItemTemplate(template, value, passTo, collection);
          this.__selectItem(result, selectContainer,false);
          fetchInfo.push({id: value, collection: collection});
        } else if (ul_selector.querySelector("li[data-value='" + value + "']")){
          let li = ul_selector.querySelector("li[data-value='" + value + "']");
          this.__selectItem(li, selectContainer,false);
        } else {
          this.__selectValue(value, selectContainer,false)
        }
      }
    } else if (values) {
      if (ul_selector.querySelector('.template')) {
        let template = ul_selector.querySelector('.template');
        let passTo = ul_selector.getAttribute('data-pass_to');
        let collection = ul_selector.getAttribute('data-fetch_collection')
        let result = this.__getSelectItemTemplate(template, values, passTo, collection); 
        this.__selectItem(result, selectContainer);
      
        fetchInfo.push({id: values, collection: collection});
      } else if (ul_selector.querySelector("li[data-value='" + values + "']")){
        let li = ul_selector.querySelector("li[data-value='" + values + "']");
        this.__selectItem(li, selectContainer,false);

      } else {
        this.__selectValue(values, selectContainer);
      }
    }
    
    try {
      if (CoCreateFloatLabel) {
        CoCreateFloatLabel.update(selectContainer, values && values.length > 0)
      }
    } catch (err) {
      
    }
    return fetchInfo;
  },
  
  __selectValue: function(value, selectContainer) {
    let currentValue = this.getValue(selectContainer);
    if (currentValue == value || currentValue.indexOf(value) > -1) return;
    
    let searchInput = selectContainer.querySelector('input');
    let span = document.createElement('span');
    span.innerHTML='x';
    span.classList.add('remove');
    
    let li = document.createElement('li');
    li.classList.add('selected');
    li.setAttribute('data-value', value);
    li.innerHTML = value;
    li.appendChild(span);
    
    selectContainer.insertBefore(li, searchInput);
  
  },
  
  __selectItem: function(li, selectContainer,focus=true) {
    const self = this;
    let type = selectContainer.hasAttribute('multiple') ? 'multiple' : 'single';
    let searchInput = selectContainer.querySelector('input');
    if (type == 'single') {
      let selectedItems = selectContainer.querySelectorAll('.selected');
      selectedItems.forEach(function(item) {
        item.remove();
      })
      searchInput.value='';
    }else if(type=='multiple'){
      setTimeout(function(){
        self.__openDropDown(selectContainer,focus)  
      },150)
    }
  
    let span = document.createElement('span');
    span.innerHTML='x';
    span.classList.add('remove');
    let selectedItem = li.cloneNode(true);
    selectedItem.classList.add('selected');
    selectedItem.classList.remove('selectable');
    selectedItem.appendChild(span);
    selectContainer.insertBefore(selectedItem, searchInput);
  },
  
  __getSelectItemTemplate: function(template, id, passTo, tempate_collection) {
    
    if (!template) return null;
    
    template = template.cloneNode(true);
    template.removeAttribute('id');
    template.classList.remove('template');
    template.setAttribute('data-value', id);
    
    let tags = template.querySelectorAll('h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, span, code, img');
    
    for (let i = 0; i < tags.length; i++) {
    
      let tag = tags[i];
      let pass_id = tag.getAttribute('data-pass_id');
      if (passTo && passTo == pass_id) {
        if (tag.hasAttribute('raw')) {
          tag.textContent = id;
        } else {
          let collection = tag.getAttribute('data-collection') ? tag.getAttribute('data-collection') : tempate_collection;
          tag.setAttribute('data-collection', collection);
          tag.setAttribute('data-document_id', id);
        }
      }
    }
    
    return template;
  },
  
  __initSelectTemplateWrapper: function(templateWrapper, selectContainer) {
    const self = this;
    templateWrapper.addEventListener('fetchedTemplate', function(e) {
      let selectableItems = this.querySelectorAll('.selectable');
      for (let i=0; i < selectableItems.length; i++) {
        let selectableItem = selectableItems[i];
        
        let id = selectableItem.getAttribute('data-document_id');
        if (id) {
          selectableItem.setAttribute('data-value', id);
        }
      }
      
      self.__fetchValues(selectContainer);
    })
  },

  
  save: function(selectEle) {  /// this function will save select value
  
    let value = this.getValue(selectEle);
    
    let collection = selectEle.getAttribute('data-collection') || 'module_activity';
    
    let id = selectEle.getAttribute('data-document_id');
    let name = selectEle.getAttribute('name');
    let realtime = selectEle.getAttribute('data-realtime') || "true";
    if (!name) return;
    
    if (realtime != "true") return;
    
    if (!CoCreateDocument.checkID(selectEle)) {
      CoCreateDocument.requestDocumentId(selectEle, "name", value)
      selectEle.setAttribute('data-document_id', 'pending');
    } else if (id) {
      if (selectEle.getAttribute('data-save_value') == 'false') {
        return;
      }
      
      CoCreate.updateDocument({
        'collection': collection, 
        'document_id': id, 
        'data' : { 
          [name] : value 
        },
        'upsert': true,
        'metadata': ''
      })
    }
    
  },
  
  getValue:function(node) {
    let type = node.hasAttribute('multiple') ? 'multiple' :'single'
    
    ///  get selectetable items
    let selectedItems = node.querySelectorAll('.selected');
    
    let value;
    
    if (selectedItems.length > 0) {
      if (type == 'multiple') {
        value = [];
        for (let i=0; i < selectedItems.length; i++) {
          value.push(selectedItems[i].getAttribute('data-value'));
        }
      } else {
        let item = selectedItems[0];
        value = item.getAttribute('data-value');
      }
    } else {
      value = type == 'multiple' ? [] : '';
    }
    
    return value;
  }
}

CoCreateSelect.init();
