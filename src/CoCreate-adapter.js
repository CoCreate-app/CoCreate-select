const CoCreateSelectAdapter = {
  
  init: function() {
    this.initElement();
    this.__initEvents()
  },
  
  initElement: function(container) {
    const mainContainer = container || document;
    if (!mainContainer.querySelectorAll) {
      return;
    }
  
    let containerList = mainContainer.querySelectorAll('cocreate-select, div.select--field');
    for(let i = 0 ; i < containerList.length ; i++){
      this.__initElementEvent(containerList[i]);
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
		
		
		document.addEventListener('CoCreateSelect-save', function(e) {
		  const {detail: {element}} = e;
		  if (!element) {
		    return;
		  }
		  
		  self.save(element);
		})
		
		CoCreateSocket.listen('readDocument', function(data) {
		  CoCreateSelect.setValue(data);
		})
		
		CoCreateSocket.listen('updateDocument', function(data) {
		  CoCreateSelect.setValue(data);
		})
		
		document.addEventListener('CoCreate-selected', function(e){
		  const {detail: {element, value}} = e;
		  console.log(e.detail)
		  
		})
  },
  
  __initElementEvent: function(selectContainer) {
    const self = this;
    selectContainer.addEventListener('clicked-submitBtn', function() {
      self.save(this)
    })
    
    selectContainer.addEventListener('set-document_id', function() {
      self.save(this)
    })
    
    //. fetch logic
    let collection = selectContainer.getAttribute('data-collection') || 'module_activity';
    let id = selectContainer.getAttribute('data-document_id');
    
    if (collection && id) {
      CoCreate.readDocument({
        'collection': collection, 
        'document_id': id
      })
    }
  },

  save: function(element, isStore = true) {
  
    let value = CoCreateSelect.getValue(element);
    
    let collection = element.getAttribute('data-collection') || 'module_activity';
    
    let id = element.getAttribute('data-document_id');
    let name = element.getAttribute('name');
    let realtime = element.getAttribute('data-realtime') || "true";
    if (!name) return;
    
    if (realtime != "true" && !isStore) return;
    
    if (element.getAttribute('data-save_value') == 'false') {
      return;
    }
    
    if (!CoCreateDocument.checkID(element)) {
      CoCreateDocument.requestDocumentId(element, "name", value)
      element.setAttribute('data-document_id', 'pending');
    } else if (id) {
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
}

CoCreateSelectAdapter.init();
