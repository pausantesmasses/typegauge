TypeGauge = {
  
  isActive: function() {
   if (window.content.document.getElementById('typegauge')) return true
   else return false
  },
  
  toggle: function() {
    if(this.isActive()) {
      this.shutdown()
    }
    else {
      this.init()
    }
  },
  
  init: function() {
    this.attachStyles("chrome://typegauge/content/typegauge/typegauge.css")
    
    var doc = window.content.document
    var body = window.content.document.getElementsByTagName('body')[0]
    var els = body.getElementsByTagName('*')
    var background = doc.createElement('div')
    var output = doc.createElement('div')
    background.setAttribute('id', 'typegauge-bg')
    output.setAttribute('id', 'typegauge')
    body.appendChild(background)
    body.appendChild(output)
    

    for (i = 0; i < els.length; i++) {
      els[i].addEventListener("mouseover", this.highLight, false)
      els[i].addEventListener("mouseout", this.removeHighLight, false)
    }
    
    doc.getElementById('typegauge').removeEventListener("mouseover", this.highLight, false)
    doc.getElementById('typegauge').removeEventListener("mouseout", this.removeHighLight, false)
    doc.getElementById('typegauge-bg').removeEventListener("mouseover", this.highLight, false)
    doc.getElementById('typegauge-bg').removeEventListener("mouseout", this.removeHighLight, false)
  },
  
  shutdown: function() {
    var body = window.content.document.getElementsByTagName('body')[0]
    
    body.removeChild(window.content.document.getElementById('typegauge'))
    body.removeChild(window.content.document.getElementById('typegauge-bg'))
    
    var els = body.getElementsByTagName('*')
    for (i = 0; i < els.length; i++) {
      els[i].removeEventListener("mouseover", this.highLight, false)
      els[i].removeEventListener("mouseout", this.removeHighLight, false)
    }
    
  },
  
  attachStyles: function(location) {
    var headEls = window.content.document.getElementsByTagName("head")
    var link = window.content.document.createElement("link")

    link.setAttribute("href", location)
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("type", "text/css")

    if(headEls.length) {
      headEls[0].appendChild(link);      
    }
    else {
      window.content.document.appendChild(link);
    }
    
  },
  
  highLight: function(event) {
    event.target.style.outline = '2px solid #ffcc00'
    var tag = event.target.tagName
    var size = TypeGauge.getFontSize(event.target)
    var lineHeight = TypeGauge.getLineHeight(event.target)
    TypeGauge.updateOutput({tag:tag, size:size, lineHeight:lineHeight})
  },
  
  removeHighLight: function(event) {
    event.target.style.outline = 'none'
  },
  
  getFontSize: function(el) {
    var fontSize = TypeGauge.getStyle(el, 'font-size')
    fontSize = fontSize.replace('px','')
    return fontSize.substr(0,fontSize.indexOf('.')+3)  + 'px'
  },
  
  getLineHeight: function(el) {
    
    var lineHeight = TypeGauge.getStyle(el, 'line-height')

    if (lineHeight == 'normal') {
      var fontSize = TypeGauge.getStyle(el, 'font-size')
      var value = fontSize.replace('px','')
      var lineHeight = value * 1.2 + ''
    }
    else if(lineHeight.indexOf('px')){
        lineHeight = lineHeight.replace('px','')
    }
    else {
        return 'E ' + lineHeight
    }
    return lineHeight.substr(0,lineHeight.indexOf('.')+3) + 'px'  
  },

  getStyle: function(el, styleProp) {
    var style = window.content.document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
    return style;
  },
  
  updateOutput: function(output) {
    var outputStr = '<dl>'
    
    for(key in output) {
      outputStr += '<dt class="tg-'+ key + '">'+ key +'</dt><dd class="tg-'+ key + '">' + output[key] + '</dd>' 
    }
    
    outputStr += '</dl>'
    
    window.content.document.getElementById('typegauge').innerHTML = outputStr
  }
}
