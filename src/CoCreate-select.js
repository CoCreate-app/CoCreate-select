//registerModuleSelector('cocreate-select')


initCoCreateSelectSockets();
initSortForSelect();

CoCreate.registerSocketInit(initCoCreateSelects, window);

function initCoCreateSelects(container) {
  const mainContainer = container || document;
  
  if (!mainContainer.querySelectorAll) {
    return;
  }

  let containerList = mainContainer.querySelectorAll('cocreate-select,div.select--field');
  console.log("Init Select ",containerList)
  // if (containerList.length == 0 && 
  //   mainContainer.classList.contains('select--field') &&
  //   mainContainer.tagName === 'DIV') 
  // {
  //   containerList = [mainContainer];
  // }
  
  for(let i = 0 ; i < containerList.length ; i++){
    let selectContainer = containerList[i];
    initSelect(selectContainer);
  }
}


function initCoCreateSelectSockets() {
  // CoCreateSocket.listen('readDocument', function(data) {
  //   fetchedCoCreateSelectData(data);
  // })
  
  CoCreateSocket.listen('readDocument', function(data) {
    fetchedCoCreateSelectData(data);
  })
  
  CoCreateSocket.listen('updateDocument', function(data) {
    fetchedCoCreateSelectData(data, true);
  })
}

function initSortForSelect() {
  
  try {
    if (SortableOBJs) {
    
      for (let i=0; i < SortableOBJs.length; i++) {
        let sortableObj = SortableOBJs[i];
        
        Sortable.utils.on(sortableObj.el, 'sort', function(e) {

          //if (e.to.classList.contains('select--field')) saveSelect(e.to);
          //console.log("e",e,"e.to",e.to,"e.to.tagName",e.to.tagName)
          if (
                (typeof e.to.tagName != 'undefined' && e.to.tagName.toLowerCase() == 'cocreate-select') 
                || e.to.classList.contains('select--field')
              ) 
                saveSelect(e.to);
          
          /// here emit event
          let evt = new CustomEvent('selectedValue');
          e.to.dispatchEvent(evt);
        })
      }
    }  
  } catch (err) {}
}



function initSelect(selectContainer) {
  
	if (CoCreateUtils.getInitialized(selectContainer)) {
		return;
	}
	CoCreateUtils.setInitialized(selectContainer)
	
  
  let input = selectContainer.querySelector('input');
  console.log("InitSelect",input)			
  let ul_selector = selectContainer.querySelector('ul.selectable--list');
  let templateWrappers = selectContainer.querySelectorAll('.template-wrapper');
  let faTemplateWrappers = selectContainer.querySelectorAll('.template-wrapper-array');
  
  if (input) {
    
    //// add listeners to inputs
    input.addEventListener('click', function (evt) {
      this.focus();
      if(!ul_selector.classList.contains("open")){
        openSelectDropDown(selectContainer);
      }
    });
    
    input.addEventListener('keydown', function(e) {
      let keyCode = e.keyCode;
      
      if (keyCode == 13 && this.value.length > 0) {
        
        // if (this.hasAttribute('data-template_id')) {
        //   return ;
        // }
        
        selectValueForSelect(this.value, selectContainer);
        saveSelect(selectContainer);
        
        /// here emit event
        let evt = new CustomEvent('selectedValue');
        selectContainer.dispatchEvent(evt);
        
        this.value = '';
        
      } else if (keyCode == 8 && !this.value.length) {
        let selectedItems = selectContainer.querySelectorAll('.selected');
        
        if (selectedItems.length > 0) {
          selectedItems[selectedItems.length -1].remove();
          saveSelect(selectContainer);
          
          /// here emit event
          let evt = new CustomEvent('selectedValue');
          selectContainer.dispatchEvent(evt);
        }
      }
    })
    
    input.addEventListener('focusout', function(evt) {
      setTimeout(() => {
        if(evt.target!=document.activeElement || !selectContainer.hasAttribute('multiple'))
          closeSelectDropDown(selectContainer);
      }, 200)
    })
  }
  
  input.addEventListener('keyup', function(e) {
    if(this.classList.contains('option-search') && ul_selector){
        let allSelectorOptions = ul_selector.querySelectorAll('.selectable');
        filterSelectorOptions(allSelectorOptions, this.value);
    }
  });
  
  
  
  ul_selector.addEventListener('click', function (e) {
    if (!e.target.matches('li')) {
      let li = e.target;
      console.log("click",li)
      while(typeof li.tagName != 'undefined' && li.tagName.toLowerCase() != 'li') {
        li = li.parentNode;
      }
      
      if (li.classList && li.classList.contains('selectable')) {
        // check if data exist
        let value = li.getAttribute('data-value');
        let selectValue = getSelectValue(selectContainer);
        
        if (value == selectValue || selectValue.indexOf(value) > -1) return;
        
        /// here emit event
        selectItemForSelect(li, selectContainer)
        saveSelect(selectContainer);  
        
        let evt = new CustomEvent('selectedValue');
        selectContainer.dispatchEvent(evt);
      }
    }
  });

  selectContainer.addEventListener('click', function (e) {
    if (e.target.matches('.remove')) {
      e.target.parentNode.remove();
      
      saveSelect(selectContainer); 
      
      /// here emit event
      let evt = new CustomEvent('selectedValue');
      selectContainer.dispatchEvent(evt);
      return;
    }
    if (!ul_selector.classList.contains('open')) {
      openSelectDropDown(selectContainer)
    }
    let input = selectContainer.querySelector('input');
    input.focus()
    
  }, true);
    
  for (let j=0; j < templateWrappers.length; j++) {
    let templateWrapper = templateWrappers[j];
    
    
    initSelectTemplateWrapper(templateWrapper, selectContainer);
  }
  
  for (let j=0; j < faTemplateWrappers.length; j++) {
    initFATemplateWrapper(faTemplateWrappers[j], selectContainer);
  }
  
  //. set save function
  
  selectContainer.addEventListener('clicked-submitBtn', function() {
    saveSelectedDataIntoDB(this)
  })
  
  selectContainer.addEventListener('set-document_id', function() {
    saveSelectedDataIntoDB(this)
  })
  
  function saveSelectedDataIntoDB(element) {
    const value = getSelectValue(element)
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
  
  fetchValuesForSelect(selectContainer);
}



function openSelectDropDown(selectContainer) {
  let input = selectContainer.querySelector('input');
  let ul_selector = selectContainer.querySelector('ul.selectable--list');
  
  if (input) {
    input.classList.add('open');
    input.focus();  
  }
  
  if (ul_selector) {
    ul_selector.classList.add('open');
  }
  
  let evt = new CustomEvent('open');
  selectContainer.dispatchEvent(evt);
}

function closeSelectDropDown(selectContainer) {
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
    
    let evt = new CustomEvent('close');
    selectContainer.dispatchEvent(evt);
  /*}*/
}

function fetchValuesForSelect(selectContainer) {
  
  let collection = selectContainer.getAttribute('data-collection') || 'module_activity';
  let id = selectContainer.getAttribute('data-document_id');
  
  if (collection && id) {
    CoCreate.readDocument({
      'collection': collection, 
      'document_id': id
    })
  }
  
}

function initSelectTemplateWrapper(templateWrapper, selectContainer) {
  templateWrapper.addEventListener('fetchedTemplate', function(e) {
    let collection = this.getAttribute('data-fetch_collection') ? this.getAttribute('data-fetch_collection') : 'module_activity';

    let selectableItems = this.querySelectorAll('.selectable');
    
    for (let i=0; i < selectableItems.length; i++) {
      let selectableItem = selectableItems[i];
      
      let id = selectableItem.getAttribute('data-document_id');
      if (id) {
        selectableItem.setAttribute('data-value', id);
      }
    }
    
    fetchValuesForSelect(selectContainer);
  })
}

function initFATemplateWrapper(faTemplateWrapper, selectContainer) {
  faTemplateWrapper.addEventListener('fetchedArray', function(e) {
    console.log('fetched array');
    
    let selectableItems = this.querySelectorAll('.selectable');
    
    for (let i=0; i < selectableItems.length; i++) {
      let selectableItem = selectableItems[i];
      
      let collection = selectableItem.getAttribute('data-collection') ? selectableItem.getAttribute('data-collection') : 'module_activity';
      let id = selectableItem.getAttribute('data-document_id');
      
      if (id) {
        selectableItem.setAttribute('data-value', id);
      }
    }
    
    fetchValuesForSelect(selectContainer);
  })
}

function saveSelect(selectEle) {  /// this function will save select value
  
  let value = getSelectValue(selectEle);
  
  let collection = selectEle.getAttribute('data-collection') || 'module_activity';
  
  let id = selectEle.getAttribute('data-document_id');
  let name = selectEle.getAttribute('name');
  let realtime = selectEle.getAttribute('data-realtime') || true;
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
      'metadata': ''
    })
  }
}

function fetchedCoCreateSelectData(data, isUpdate) {
  
  let selectContainers = document.querySelectorAll('cocreate-select,.select--field');
  let status = false;
  
  let fetchInfos = [];
  
  for (let i=0; i < selectContainers.length; i++) {
    let selectContainer = selectContainers[i];
    
    var collection = selectContainer.getAttribute('data-collection') ? selectContainer.getAttribute('data-collection') : 'module_activity';
    var id = selectContainer.getAttribute('data-document_id');
    var name = selectContainer.getAttribute('name');
    
    if (data['collection'] == collection && data['document_id'] == id && name) {
      let w_fetchData = showValueInSelect(selectContainer, data['data'][name]);
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

}

function showValueInSelect(selectContainer, values) {
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
    for (let i =0; i < values.length; i++) {
      let value = values[i];
      
      if (ul_selector.querySelector('.template')) {
        let template = ul_selector.querySelector('.template');
        let passTo = ul_selector.getAttribute('data-pass_to');
        let collection = ul_selector.getAttribute('data-fetch_collection')
        let result = getSelectItemTemplate(template, value, passTo, collection);
        selectItemForSelect(result, selectContainer);
        
        fetchInfo.push({id: value, collection: collection});
      } else if (ul_selector.querySelector("li[data-value='" + value + "']")){
        let li = ul_selector.querySelector("li[data-value='" + value + "']");
        selectItemForSelect(li, selectContainer);
      } else {
        selectValueForSelect(value, selectContainer)
      }
    }
  } else if (values) {
    if (ul_selector.querySelector('.template')) {
      let template = ul_selector.querySelector('.template');
      let passTo = ul_selector.getAttribute('data-pass_to');
      let collection = ul_selector.getAttribute('data-fetch_collection')
      let result = getSelectItemTemplate(template, values, passTo, collection); 
      selectItemForSelect(result, selectContainer);
      
      fetchInfo.push({id: values, collection: collection});
    } else if (ul_selector.querySelector("li[data-value='" + values + "']")){
      let li = ul_selector.querySelector("li[data-value='" + values + "']");
      selectItemForSelect(li, selectContainer);
    } else {
      selectValueForSelect(values, selectContainer);
    }
  }
  
  try {
    updateFloatLabel(selectContainer, values && values.length > 0);
  } catch (err) {
    
  }
  return fetchInfo;
}

function getSelectItemTemplate(template, id, passTo, tempate_collection) {
  
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
}

function selectItemForSelect(li, selectContainer) {
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
      openSelectDropDown(selectContainer)  
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
  
  
}

function selectValueForSelect(value, selectContainer) {
  let currentValue = getSelectValue(selectContainer);
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

}

function getSelectValue(selectEle) {
  let type = selectEle.hasAttribute('multiple') ? 'multiple' :'single'
  
  ///  get selectetable items
  let selectedItems = selectEle.querySelectorAll('.selected');
  
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

var faOBJs = [];
var faWrapperClass = 'template-wrapper-array';

initSocketsForFetchArray();
initFetchArrays();

function initSocketsForFetchArray() {
  CoCreateSocket.listen('readDocument', function(data) {
    fetchedFA(data);
  })
}

function initFetchArrays() {
  let fetchArrayWrappers = document.querySelectorAll('.' + faWrapperClass);
  
  for (let i=0; i < fetchArrayWrappers.length; i++) {
    let fetchArrayWrapper = fetchArrayWrappers[i];
    
    let id = fetchArrayWrapper.id;
    if (!id) continue;
    
    let fetch_collection = fetchArrayWrapper.getAttribute('data-fetch_collection') ? fetchArrayWrapper.getAttribute('data-fetch_collection') : 'module_activity';
    let fetch_module_id = fetchArrayWrapper.getAttribute('data-fetch_document_id');
    let fetch_name = fetchArrayWrapper.getAttribute('data-fetch_name');
    
    if (!fetch_name) continue;
    
    let faObj = {
      eId: id,
      el: fetchArrayWrapper,
      templateId: fetchArrayWrapper.getAttribute('data-template_id'),
      fetch_collection: fetch_collection,
      fetch_module_id: fetch_module_id,
      fetch_name: fetch_name,
      values: []
    }
    
    faOBJs.push(faObj);
    
    fetchFA(faObj);
  }
}

function fetchFA(faObj) {
  let id = faObj.fetch_module_id
  CoCreate.readDocument({
    'collection': faObj.fetch_collection, 
    'document_id': id
  })
}

function fetchedFA(data) {
  let is_fetch = false;
  for (let i=0; i < faOBJs.length; i++) {
    let faObj = faOBJs[i];
    
    if (faObj.fetch_collection == data['collection']) {
      let id = faObj.fetch_module_id;
      
      if (id == data['document_id']) {
        let ids = data['data'][faObj.fetch_name];
        
        if (ids) {
          if (JSON.stringify(ids) != JSON.stringify(faObj.values)) {
            faObj.values = ids;
            showFAResult(faObj, ids)  
            is_fetch = true;
          }
        }
      }
    }
  }
  
  if (is_fetch) {
    CoCreate.fetchModules();
  }
}

function showFAResult(faObj, ids) {
  
  let template = faObj.el.querySelector('.template');//  document.getElementById(faObj.eId);
  if (!template) return;
  
  let result = getFAResultTemplate(faObj.el, ids);
  
  console.log(result);
  
  clearOldItems(faObj.el);
  
  template.insertAdjacentHTML('beforebegin', result.innerHTML);
  
  faObj.el.dispatchEvent(new CustomEvent('fetchedArray'));
  
  // fetchData();
}

function clearOldItems(wrapper) {
  let templateId = wrapper.getAttribute('data-template_id');
  
  let olds = wrapper.querySelectorAll("[templateId='" + templateId + "']");
  
  for (let i=0; i < olds.length; i++) {
    olds[i].remove();
  }
}

function getFAResultTemplate(wrapper, ids) {
  
  let templateId = wrapper.getAttribute('data-template_id');
  let passTo = wrapper.getAttribute('data-pass_to');
  
  let templateDiv = document.createElement('div');
  
  for (let k=0; k < ids.length; k++) {
    let id = ids[k];
    
    let itemTemplateDiv = document.createElement('div');
    let template = wrapper.querySelector('.template').cloneNode(true);
    
    template.setAttribute('templateId', templateId);
    template.removeAttribute('id');
    template.classList.remove('template');
    
    itemTemplateDiv.appendChild(template.cloneNode(true));
    
    /////  fetch data for h1, h2, h3, h4, h5 ,h6, p, i, q, a, b, li, span, code
    let displayList = itemTemplateDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, span, code, img');
    
    for (let i = 0; i < displayList.length; i++) {
      
      let display = displayList[i];
      let pass_id = display.getAttribute('data-pass_id');
      if (passTo && passTo == pass_id) {
        
        display.setAttribute('data-document_id', id);
        if (display.hasAttribute('raw')) {
          display.textContent = id;
        }
      }
    }
    
    console.log(itemTemplateDiv.innerHTML)
    
    templateDiv.insertAdjacentHTML('beforeend', itemTemplateDiv.innerHTML);
  }
  
  return templateDiv;
}

function filterSelectorOptions(options, value){
  if(!options.length) return;
  
  for(let option of options){
    var textContent = option.innerText;
    if(textContent.includes(value))
      option.classList.remove('hidden');
    else
      option.classList.add('hidden');
  }
}
initCoCreateSelects(document)
//CoCreateInit.register('CoCreateSelect', window, initCoCreateSelects);
