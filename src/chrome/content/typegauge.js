TypeGauge = TG = {
  
  initialize: function() {
    TG.log = Components.utils.reportError;
    window.addEventListener("load", TG.onWindowLoad, false);
    window.addEventListener("unload", TG.onWindowUnload, false);
  },
  
  onWindowLoad: function() {
    TG.panel = document.getElementById('typegauge-panel');
    TG.updateOutput({tag:'...', size:'...', lineHeight:'...'});
    
    var appcontent = document.getElementById("appcontent");
    appcontent.addEventListener("DOMContentLoaded", TG.onPageLoad, true);
  },
  
  onWindowUnload: function() {
    var appcontent = document.getElementById("appcontent");
    appcontent.removeEventListener("DOMContentLoaded", TG.onPageLoad, true);
  },
  
  onPageLoad: function(event) {
    TG.startListening(event.target);
  },
  
  startListening: function(page) {
    TG.updateOutput({tag:'', size:'', lineHeight:''});
    page.addEventListener("mouseover", this.highlight, false);
    page.addEventListener("mouseout", this.removeHighlight, false);
    window.content.addEventListener("unload", this.stopListening, false);
  },
  
  stopListening: function() {
    var page = window.content.document;
    page.removeEventListener("mouseover", this.highlight, false)
    page.removeEventListener("mouseout", this.removeHighlight, false)
  },
  
  toggle: function() {
    var anchor = document.getElementById('browser-bottombox')
    if (TG.panel.state == 'closed') {
      TG.panel.openPopup(anchor, "before_start", 0, 0, false, true);
    }
    else {
      TG.panel.hidePopup();
    }
  },
  
  highlight: function(event) {
    if (TG.panel.state == 'closed') return;
    if (event.target.className == 'tg_wrapper') return;
    if (event.relatedTarget && event.relatedTarget.className == 'tg_wrapper') return;
    
    var element = event.target;
    var istext, isHighlighted;
    
    for (var i=0, node; node = element.childNodes[i]; i++) {
      isHighlighted = node.className == 'tg_wrapper';
      if(isHighlighted) break;
      
      istext = node.nodeType == 3 && !/^\s*$/.test(node.nodeValue);
      if(istext) break;
    };
    
    if (istext) {
      
      element.className += ' tg_highlighted';
      var html = element.innerHTML;
      element.innerHTML = '';
      var wrapper = window.content.document.createElement('span');
      wrapper.className += 'tg_wrapper';
      wrapper.innerHTML = html;
      element.appendChild(wrapper);
      
      wrapper.style.backgroundColor = 'InfoBackground';
      wrapper.style.border = '1px solid #ffcc00'
      wrapper.style.borderWidth = '1px 0'
      wrapper.style.cursor = 'text';
      var tag = element.tagName;
      var size = TG.getFontSize(element);
      var lineHeight = TG.getLineHeight(element);
      TG.updateOutput({tag:tag, size:size, lineHeight:lineHeight});
    }
    event.stopPropagation();
  },
  
  removeHighlight: function(event) {
    if (TG.panel.state == 'closed') return;
    if (event.target.className != 'tg_wrapper') return;
    if (event.relatedTarget && event.relatedTarget.className.indexOf('tg_highlighted') > 0) return;
    
    var wrapper = event.target;
    var element = wrapper.parentNode;

    element.innerHTML = wrapper.innerHTML;
    element.className = element.className.replace('tg_highlighted', '');
  },
  
  getFontSize: function(el) {
    var fontSize = TG.getStyle(el, 'font-size');
    fontSize = fontSize.replace('px','');
    return fontSize.substr(0,fontSize.indexOf('.')+3)  + 'px';
  },
  
  getLineHeight: function(el) {
    var lineHeight = TG.getStyle(el, 'line-height')

    if (lineHeight == 'normal') {
      var fontSize = TG.getStyle(el, 'font-size');
      var value = fontSize.replace('px','');
      var lineHeight = value * 1.2 + '';
    }
    else if(lineHeight.indexOf('px')){
        lineHeight = lineHeight.replace('px','');
    }
    else {
        return 'E ' + lineHeight;
    }
    return lineHeight.substr(0,lineHeight.indexOf('.')+3) + 'px';
  },

  getStyle: function(el, styleProp) {
    return window.content.document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
  },
  
  updateOutput: function(output) {
    var outputStr = '<dl id="typegauge-dl">';
    for(key in output) {
      outputStr += '<dt class="tg_'+ key + '">'+ key +'</dt><dd class="tg_'+ key + '">' + output[key] + '</dd>';
    }
    outputStr += '</dl>';
    var parser = new DOMParser();
    var resultDoc = parser.parseFromString(outputStr,"text/xml");
    document.getElementById('typegauge').replaceChild(resultDoc.documentElement, document.getElementById('typegauge-dl'));
    // TG.log(document.getElementById('typegauge').getElementsByTagName('dt')[0].className)
  }

}

TypeGauge.initialize();