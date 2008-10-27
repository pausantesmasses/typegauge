/**
 * ProtoSafe v1.1.5
 *
 * Encapsulates/modifies Prototype and all included files.
 * Increases compatibility with 3rd party scripts by keeping Prototype
 * out of the global namespace, as much as possible, and by subclassing
 * the Array object to avoid for-in loop pollution.
 *
 *
 * IMPORTANT:
 *   
 *   ProtoSafe <strong>should</strong> be compatible with Prototype
 *   versions 1.4 - 1.6.0.2. Script order is not important. You may place
 *   ProtoSafe's script element before or after any other JavaScript framework.
 *   
 *   For production use <strong>all</strong> files, including Prototype, must
 *   be pre-modified by the Modify tool (./tools/modify.html). A pre-modified
 *   version of Prototype 1.6.0.2 is included with ProtoSafe.
 *   
 *   The prototype.js file available at www.prototypejs.org has a javascript
 *   comment on line 2696 containing a non-ascii encoded apostrophe. This may
 *   cause an issue with ProtoSafe. You may use the Prototype versions within
 *   ProtoPack (version 2.19b or higher) at:
 *   
 *   http://groups.google.com/group/prototype-core/files <protopack_vx.xx.zip> or
 *   http://code.google.com/p/protosafe/downloads/list <protopack_vx.xx.zip>
 *
 *
 * Modification Utility:
 *   
 *   What it DOES:
 *     
 *     The Modification Utility (MU) replaces any array
 *     with $Array. It also performs Prototype/Scriptaculous
 *     specific modifications such as removing window
 *     references from core Prototype objects, removing
 *     support for extending the native Event and Element
 *     objects, wrapping Element.extend() to automatically
 *     clean MooTool extensions and removing the
 *     Scriptaculous.load() method call.
 *
 *     The MU also supports compressing Prototype 1.6/Scriptaculous 1.8
 *     or higher. It uses a customized Packer3 that ignores the $super
 *     variable when packing with the "shrink variables" option. Read the
 *     Packer3.js source to learn how to compile your own version of Packer.
 *   
 *   What it DOESN'T:
 *     
 *     The MU does not replace window.<variable name> references.
 *     Make sure you consistently use/not use the window reference
 *     with a given variable (preferably not use).
 *     
 *     Remove any method call that dynamically loads additional files
 *     based on the url of the external file. This may conflict with ProtoSafe's
 *     own load functionality.
 *  
 *     Avoid the use of the following syntax:
 *     var foo = [,,,'4']; //although valid when converted -> new $Array(,,,'4') throws a syntax error.
 *   
 *   How To:
 *     
 *     Before modifing/compiling your code you may want to test it under ProtoSafe's debug mode to ensure
 *     it will work with ProtoSafe's modifications. To do this place protosafe.js and the "tools" folder
 *     in the same directory as prototype.js. Include in page:
 *     <script type="text/javascript" src="protosafe.js?debug=1&load=effects,site"></script>
 *     This will concat prototype.js, effects.js, and site.js into a single script and modify/encapsulate
 *     it at runtime.
 *     
 *     Compile AJAX Loaded Files:
 *       
 *       1) Click "Options" panel.
 *       2) Choose ProtoSafe AJAX Loader mode.
 *       3) Choose compression options.
 *       4) Click "Input" panel.
 *       5) Click "Insert File" and select the file you wish to include. (ex: effects.js or site.js)
 *       6) Click "Modify" button.
 *       7) Modified code will appear in the "Output" panel.
 *       8) Copy text from "Output" panel and re-save file.
 *       9) Repeat steps 4-8 for additional files. 
 *      10) Include in page: <script type="text/javascript" src="protosafe.js?load=effects,site"></script>
 *     
 *     Compile Standalone File:
 *       
 *       1) Click "Options" panel
 *       2) Choose ProtoSafe Standalone mode.
 *       3) Choose compression options.
 *       4) Click "Input" panel.
 *       5) Click "Insert File" and select prototype.js first.
 *       6) Click "Insert File" again to append another file. (ex: effects.js or site.js)
 *       7) Repeat step 6 until all files have been added.
 *       8) Click "Modify" button.
 *       9) Modified code will appear in the "Output" panel.
 *      10) Copy text from "Output" panel and save as a single js file. (ex: standalone.js)
 *      11) Include in page: <script type="text/javascript" src="standalone.js"></script>
 *
 *     Using XML Files:
 *       
 *       At "Step 5" of the Ajax Loaded/Standalone instructions above, you may select
 *       a specifically created xml file to automate the file concatenation process.
 *       An example file can be found in the root folder (./example.build.xml).
 *       
 *       <?xml version="1.0" encoding="utf-8"?>
 *       <project>
 *         <filelist prototypesrc="prototype.js">
 *           <file src="demos/scripts/debug/builder.js" />
 *           <file src="demos/scripts/debug/effects.js" />
 *           <file src="demos/scripts/debug/reflection.js" />
 *           <file src="demos/scripts/main.js" />
 *         </filelist>
 *       </project>
 *       
 *       Relative paths are relative to the xml file's location.
 *       The "prototypesrc" attribute of the "filelist" node contains
 *       the filepath to prototype.js. The "file" nodes  "src"
 *       attribute contains the filepath to the included files. You
 *       may specify urls for the file sources. ProtoSafe concats the
 *       files by child node order.
 *
 *
 *  Tested successfully on:
 *    
 *    Win: 
 *      Opera 9.50 Alpha
 *      Firefox 2.0.0.12
 *      IE 7.0
 *      IE 6.0.2
 *      IE 5.5
 *      Safari 3 (XP Beta)
 *
 *    Mac:
 *      Firefox 2.0.0.2
 *      Firefox 2.0.0.12
 *      Camino 1.0.4
 *      Opera 9.10
 *      Opera 9.26
 *      Omniweb 5.6
 *      Safari 2.0.4
 *      Safari 3 (OSX 10.4.9 Beta)
 *
 *
 * Caveats/Gotchas:
 *   
 *   Synchronous Requests:
 *     
 *     Synchronous requests are enabled by default as an attempt
 *     to preserve the firing of dom:loaded and window onload event
 *     observers. Loading large files may cause the web page to
 *     temporarily lock up or become unresponsive.
 *   
 *   
 *   Asynchronous Requests:
 *     
 *     Asynchronous requests will avoid the caveats of synchronous
 *     requests, at the expense of consistently firing the dom:loaded
 *     and window onload event observers. This happens because one or
 *     all of the scripts may finish loading after the dom:loaded or
 *     window onload events have fired.
 *   
 *   
 *   Inline JavaScript calls:
 *     
 *     Because Prototype and all included files are encapsulated, inline
 *     JavaScript calls to Prototype/included methods will not work.
 *   
 *   
 *   Element Sugar Cross-Contamination:
 *     
 *     Although Prototype is encapsulated, it and other frameworks
 *     like MooTools, can still extend DOM elements which can lead to
 *     instances of sugar cross-contamination. Any Prototype method that
 *     uses Element.extend will automatically remove MooTools extensions
 *     without the need to call ProtoSafe.
 *     
 *     For example in Firefox:
 *       
 *       //if MooTools exists it will auto extend all elements:
 *       var element = document.createElement('DIV'); //auto extends elements
 *       element.setText('Happy cows come from California.');
 *       
 *       element = ProtoSafe(example); //removes MooTools extensions
 *         //OR simply
 *       element = $(element); // $ uses Element.extend so it's good to go
 *       
 *       console.log(typeof element.setText);  // -> undefined
 *       console.log(typeof element.identify); // -> function
 *   
 *   
 *   Arrays:
 *     
 *     Because the Array object is subclassed you no longer get the native
 *     sugar from standard arrays. However, all arrays returned from Prototype
 *     methods should be pre-sweetened. You may use the Modify tool (./tools/modify.html),
 *     included with ProtoSafe, to assist you in the modification process.
 *     
 *     Use the following syntax for manually creating a sweetened array:
 *       new $Array(10) //makes a new $Array with a length of 10
 *         //OR
 *       $Array('andrew','jd','juriy ','justin','mislav','sam','tobie');
 *     
 *     Use new string $split() method to return an $Array:
 *       'apples,oranges,bananas'.$split(',').each(function(fruit){ ... });
 *   
 *   
 *   ASCII Encoded Files:
 *     
 *     When this file is loaded by ajax from your local filesystem the special characters below
 *     will not render properly because this file, like most javascript files, is ASCII encoded.
 *     ASCII only supports 128 character codes. The characters below are composed of character codes
 *     greater than 128. Normally a server would specify which encoding to impose on a file. However,
 *     on your local filesystem the file's actual encoding is used. To fix this issue with other files
 *     use Notepad, or any other text editor capable of saving UTF-8 encoded files, to re-save the file
 *     and change the "Encoding" option from "ANSI" to "UTF-8".
 *     
 *     ASCII Test:
 *     Ã ž Ÿ Â £ ¤ ¥
 *     
 *     References:
 *     http://en.wikipedia.org/wiki/ASCII
 *     http://en.wikipedia.org/wiki/UTF-8
 *   
 *   
 *   Obfuscated JavaScript:
 *     
 *     ProtoSafe <strong>works</strong> with minified, variable shrunk, and
 *     Dean Edwards Packer 3 base62 encoded files. However, obfuscated files are
 *     impossible to accurately pattern match and modify. When ProtoSafe encounters
 *     an obfuscated file it will "error out", failing to modify the file's source
 *     correctly. To assist developers, in debug mode, ProtoSafe will throw a warning
 *     if it detects commonly used js obfuscators. If you still wish to use obfuscated
 *     files you must manually modify the original unobfuscated file. Then re-obfuscate
 *     the modified file with the obfuscator of your choice. You may use the Modify
 *     tool (./tools/modify.html), included with ProtoSafe, to assist you
 *     in the modification process.
 *   
 *   
 *   Debug Runtime File Modifications & Performance:
 *     
 *     While in debug mode ProtoSafe will auto-modify all files at runtime.
 *     Although convenient for developers it does add to the scripts overall
 *     startup delay. Use pre-modified copies of your files to avoid this
 *     process and the delay associated with it. You may use the Modify
 *     tool (./tools/modify.html) included with ProtoSafe to streamline the
 *     manual conversion of your files.
 *     
 *     File source modifications are done with regular expressions. If you
 *     have any regular expression optimizations/tweaks please email me.
 *   
 *   
 *   Safari 2.0.4 Status Bar Loading Indicator:
 *     
 *     The iframes in Safari seem to keep the status bar loading indicator busy
 *     after the page has finished loading. I have tried setting the src attribute
 *     to "javascript:false" as well as using document.open()/document.close().
 *     If you know of a way to fix this please email me.
 *
 *
 * Usage examples:
 *   
 *   Basic usage: (Requires all files to be pre-modified)
 *     <script type="text/javascript" src="protosafe.js?load=effects,site"></script>
 *   
 *   Debug mode: (Allows unmodified files, will modify at runtime)
 *     <script type="text/javascript" src="protosafe.js?debug=1&load=effects,site"></script>
 *   
 *   Disable auto-modifying files in debug mode:
 *     <script type="text/javascript" src="protosafe.js?debug=1&nomod=1&load=effects,site"></script>
 *   
 *   Asynchronous requests:
 *     <script type="text/javascript" src="protosafe.js?async=1&load=effects,site"></script>
 *   
 *   Alias ProtoSafe as Prototype/Protoculous: (renaming prototype.js -> lib.js and protosafe.js -> prototype.js)
 *     <script type="text/javascript" src="prototype.js?load=effects,site"></script>
 *       OR
 *     <script type="text/javascript" src="protoculous.js?load=effects,site"></script>
 *
 *   Standalone usage: (It's a regular javascript file, name it whatever you want)
 *     <script type="text/javascript" src="standalone.js"></script>
 *
 *
 * @author John-David Dalton <john.david.dalton[at]gmail[dot]com>
 * @version 1.1.5
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @link http://groups.google.com/group/rubyonrails-spinoffs/browse_thread/thread/ae0c3f99d46e5462/98cc71dc5a5b758d
 */

/**
 * ProtoSafe()
 *
 * Scrubs element(s) removing
 * all non-native methods.
 *
 * @param mixed element
 * @return mixed
 */
var ProtoSafe = (function(){
	
	/**
	 * Removes element methods
	 * added by MooTools.
	 *
	 * @param mixed element
	 * @return element
	 * @access private
	 */
	function scrub(element){
		
		//resolve dom element
		if(typeof element == 'string'){
			element = document.getElementById(element);
		}
		if(!element || !element.tagName || !element.htmlElement){
			return element; //bail if no tag name or not modified by MooTools
		}
		
		var natives = ProtoSafe.getNativeMethodNames(element) || {};
		for(var i in element){
			try{
				if(typeof element[i] == 'function'){
					if(!natives[i]){
						element[i] = ProtoSafe.undefined; //mask non-native method as undefined
					}else{
						delete element[i]; //expose native method
					}
				}
			}catch(e){}
		}
		
		//unset framework flags
		element._extendedByPrototype = element._extended = element.htmlElement = ProtoSafe.undefined;
		return element;
	};
	
	return function(){
		if(arguments.length > 1){
			for(var i=0,l=arguments.length,elements=[]; i < l; i++){
				elements.push(scrub(arguments[i]));
			}
			return elements;
		}
		return scrub(arguments[0])
	}
})();

/**
 * ProtoSafe.extend()
 *
 * Clone of Object.extend().
 * Copies all properties from the
 * source to the ProtoSafe object. 
 *
 * @param object source
 * @return object
 */
ProtoSafe.extend = function(source){
	destination = this;
	if(arguments.length == 2){
		destination = source;
		source = arguments[1];
	}
	for(var property in source)
		destination[property] = source[property];
	return destination;
};

/**
 * Add methods
 */
ProtoSafe.extend({
	
	/**
	 * @var object used for browser detection
	 */
	Browser: {
		IE: !!(window.attachEvent && !window.opera),
		WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
		Gecko: navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1
	},
	
	/**
	 * @var name of the library/framework to safeguard
	 */
	libname: '',
	
	/**
	 * @var path to profosafe.js (resolved when ProtoSafe.load() is called)
	 */
	path: '',
	
	/**
	 * ProtoSafe.init()
	 *
	 * Finds this files src and parses
	 * the query paramaters as well as
	 * defines basic properties.
	 * @return boolean
	 */
	init: function(){
	
		var scriptUri,src,
		srcPattern = /proto(?:type|safe|culous)[a-z0-9._-]*\.js(?:\?.*)?$/,
		scripts = document.getElementsByTagName('SCRIPT');
		
		//resolve this script src location.
		for(var i=0,script; script=scripts[i]; i++){
		
			src = script.src;
			scriptUri = (src.match(srcPattern) || [])[0];
			
			if(src && scriptUri){
				this.path = src.replace(scriptUri, '');
				this.libname = (scriptUri.indexOf('protosafe') === 0)? 'prototype' : 'lib';
				break;
			}
		}
		if(!script){
			return false; //bail if no script found
		}
		
		//resolve query params
		this.Query.parse(src);
		
		//extend functionality for debug mode
		if(this.Query.get('debug')){
			this.include('tools/modify.js');
		}
		//auto load by default
		if(this.Query.get('load') && this.Query.get('auto') !== false){
			this.load();
		}
	},
	
	/**
	 * ProtoSafe.load()
	 *
	 * Loads the framework/included
	 * files and executes them.
	 * @return void
	 */
	load: function(){
		
		//resolve included files
		var includes = arguments;
		if(!includes.length){
			includes = (includes=this.Query.get('load'))? includes : [];
			if(!this.isArray(includes)) includes = [includes];
		}
		
		//set entryLimit to library (1) + number of included files
		this.Writer.entryLimit = includes.length + 1;
		
		//load framework/library and ensure first in
		this.Writer.load(this.libname+'.js', {
			asynchronous: !!this.Query.get('async'),
			order: 0
		});
		
		//load included files
		for(var i=0,include; include=includes[i]; i++){
			this.Writer.load(include+'.js', {
				asynchronous: !!this.Query.get('async'),
				order: i+1
			});
		}
	},
	
	/**
	 * ProtoSafe.exec()
	 *
	 * Executes the given code. You may choose
	 * to employ the following techniques:
	 *
	 * window    - executes code via window.eval() (default)
	 * capsulate - executes code in a closure
	 * sandbox   - executes code in a separate document scope
	 *
	 * Only the "sandbox" technique supports the "persist"
	 * option. This option allows the sandbox to remain
	 * connected after the eval has been executed.
	 *
	 * Examples:
	 * ProtoSafe.exec("var foo = 3"); //window.foo is 3
	 * ProtoSafe.exec({window: "var foo = 3"}); //equiv, window.foo is 3
	 * ProtoSafe.exec({capsulate: "var foo = 3"}); //window.foo is undefined
	 * ProtoSafe.exec({sandbox: {persist: true, code: "parent.Array2 = Array"}}); //Array2 is Array() of sandbox
	 *
	 * @param object evaluations
	 * @return void
	 * @link http://alex.dojotoolkit.org/?p=538
	 * @link http://tobielangel.com/2007/2/23/to-eval-or-not-to-eval
	 * @link http://dean.edwards.name/weblog/2006/11/sandbox#comment75681
	 * @link http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
	 */
	exec: function(evaluations){
		
		var persist,sandbox,script,self = arguments.callee,
		dummyId = '__protosafe_safari_dummy', scriptId = '__protosafe_exec_script',
		head = document.getElementsByTagName('head')[0] || document.documentElement;
		
		if(typeof evaluations != 'object'){
			evaluations = {window: evaluations};
		}
		for(var technique in evaluations){
			
			var persist, code = evaluations[technique];
			if(typeof code == 'object'){
				persist = code.persist, code = code.code;
			}
			if(/^(?:\s|\n)*$/.test(code)) {
				continue; //skip if empty
			}
			switch(technique.toLowerCase()){
				
				case 'capsulate':
					//encapsulate code in a self-executing anonymous function
					new Function('',code)(); break;
				
				case 'sandbox':
					if(window.createPopup){
						(sandbox = window.createPopup()).document.write('<script>'+code+'<\/script>'); 
					}else{
						var dummy,frame,container = head;
						sandbox = document.createElement('iframe');
						
						if(this.Browser.WebKit){
							//safari 2.0.4 has issues with setting display:none and requires a dummy iframe
							container = document.body || head;
							with(sandbox.style){ position='absolute';left='-5px';width='0px';height='0px';overflow='hidden';}
							if(!document.body && !window.frames.length){
								document.write('<iframe id="'+dummyId+'" style="position:absolute;left:-5px;width:0px;height:0px;overflow:hidden;"></iframe>');
								dummy = document.getElementById(dummyId);
							}
						}else{
							sandbox.style.display = 'none';
						}
						
						container.appendChild(sandbox);
						(frame = window.frames[window.frames.length-1]).document.open();
						frame.document.write('<script>'+code+'<\/script>');
						frame.document.close();
						
						if(dummy) dummy.parentNode.removeChild(dummy);
						if(!persist) container.removeChild(sandbox);
					}
					//handle sandbox persistence
					if(persist) self.persisted.push(sandbox); break;
				
				default:
					//synchronous eval
					if(document.body){
						(script = document.createElement('script')).type = 'text/javascript';
						try {
							script.appendChild( document.createTextNode(code) );
						} catch (e) { script.text = code }
						head.appendChild(script);
					}
					else{
						//firefox 2.0.0.2/camino 1.0.4 don't execute inserted scripts synchronously when dom not loaded
						document.write('<script id="'+scriptId+'" type="text/javascript">'+ code +'<\/script>');
						script = document.getElementById(scriptId);
					}
					head.removeChild(script);
			}
		}
	},
	
	/**
	 * ProtoSafe.isArray()
	 *
	 * Checks if object is an array.
	 *
	 * @param object object
	 * @return boolean
	 */
	isArray: function(object) {
		return object != null && typeof object == "object" &&
		  'splice' in object && 'join' in object;
	},
	
	/**
	 * ProtoSafe.isObfuscated()
	 *
	 * Checks if code has been encoded
	 * by some common obfuscators.
	 *
	 * @param string code
	 * @return boolean
	 */
	isObfuscated: function(code){
		return (
		  /eval\(function\(p,a,c,k,e,r/.test(code) ||               //Packer
		    (/^O=/.test(code) && /eval\(i\);?$/.test(code)) ||      //BananaScript
              (/^\$=/.test(code) && /\/£\/g,"\\""\)\)$/.test(code)) //MemTronic's "
		);
	},
	
	/**
	 * ProtoSafe.firebugEnabled()
	 *
	 * Checks if Firebug is enabled.
	 *
	 * @return boolean
	 * @link http://www.getfirebug.com/
	 */
	firebugEnabled: function(){
		return (this.Browser.Gecko && window.console && console.firebug);
	},
	
	/**
	 * ProtoSafe.warn()
	 *
	 * Sends a warning to the user.
	 * In Firefox \w Firebug it will post a warning to the console,
	 * else it will throw an alert with the given message. 
	 *
	 * @param string msg
	 * @return void
	 */
	warn: function(msg){
		this.firebugEnabled()? console.warn(msg) : alert(msg);
	},
	
	/**
	 * ProtoSafe.cleanPath()
	 *
	 * Format, resolve, and standardize paths.
	 *
	 * @param string filepath
	 * @return string
	 */
	cleanPath: function(filepath){
		
		//change slashes to forward slashes and escape spaces
		filepath = (filepath||'').replace(/\\/g,'/').replace(/\s/g, '%20');
		if(filepath.charAt(0) == '/') filepath = filepath.substring(1); //strip leading slash
		
		//append js extension if file has no extension
		if(!/\.[a-z]{2,4}$/.test(filepath))
			filepath+= '.js';
		
		//if path is relative append to protosafe path
		if(!/^(file|ftp|https?):/.test(filepath))
			filepath = this.path + filepath.replace(this.path, '');
		
		return filepath;
	},
	
	/**
	 * ProtoSafe.getFileContents()
	 *
	 * Gets the contents of the requested
	 * file and returns it as a string.
	 *
	 * @param string filepath
	 * @return string
	 */
	getFileContents: function(filepath){
		return new ProtoSafe.AjaxRequest(filepath, {method:'get', asynchronous:false}).transport.responseText;
	},
	
	/**
	 * ProtoSafe.include()
	 *
	 * Loads and executes the requested file(s).
	 * Used for dynamically extending ProtoSafe.
	 *
	 * @param string filepath
	 * @return void
	 */
	include: function(){
		for(var i=0,arg; arg=arguments[i]; i++){
			this.exec(this.getFileContents(arg));
		}
	},
	
	/**
	 * ProtoSafe.getNativeMethodNames() 
	 *
	 * Returns an object whose properties
	 * are the native method names of the
	 * given element.
	 *
	 * @param string tagName
	 * @return object
	 */
	getNativeMethodNames: function(tagName){
		
		if(tagName && tagName.nodeType == 1){;
			tagName = tagName.tagName;
		}
		tagName = (tagName||'').toUpperCase();
		if(tagName && !ProtoSafe.NativeMethodNames.ByTag[tagName]){
			this.exec({sandbox: ''+
				'parent.ProtoSafe.NativeMethodNames.ByTag.'+tagName+' = {};'+
				'var dummy = document.createElement("'+tagName+'");'+
				'for(var i in dummy){'+
				  'if(typeof dummy[i] == "function")'+
				    'parent.ProtoSafe.NativeMethodNames.ByTag.'+tagName+'[i] = true;'+
				'}'
			});
		}
		return ProtoSafe.NativeMethodNames.ByTag[tagName];
	},
	
	/**
	 * ProtoSafe.NativeMethodNames
	 * 
	 * Object holds native method name by tag name.
	 * @static
	 */
	NativeMethodNames: {
		ByTag: {}
	},
	
	/**
	 * ProtoSafe.Writer
	 *
	 * Utility object that writes and execs text.
	 * @static
	 */
	Writer: {
		
		/**
		 * @var entries to be compiled and exec'd
		 */
		entries: [],
		
		/**
		 * @var when entry limit is reached the writer publishes the text.
		 */
		entryLimit: 0,
		
		/**
		 * @var count of how many entries the writer has written.
		 */
		entryCount: 0,
		
		/**
		 * Reads the requested file and
		 * writes its contents as one
		 * text entry.
		 *
		 * @param string filepath
		 * @param object options
		 * @return void
		 */
		load: function(filepath, options){
			
			options = options || {};
			new ProtoSafe.AjaxRequest(filepath, {
				method: 'get',
				asynchronous: options.asynchronous,
				onSuccess: function(transport)
				{
					var text = transport.responseText;
					if(ProtoSafe.Writer.load.debug){ //handle debug modifications
						text = ProtoSafe.Writer.load.debug(text);
					}
					
					ProtoSafe.Writer.write(text, options.order);
				}
			})
		},
		
		/**
		 * Writes text entry to the
		 * order index specified. Text
		 * is appended if no order index
		 * is given.
		 *
		 * @param string text
		 * @param integer order (zero-based index)
		 * @return void
		 */
		write: function(text, order){
			
			if(order != null){
				this.entries.splice(order, 0, text);
			}else{
				this.entries.push(text);
			}
			if(this.entryLimit && ++this.entryCount >= this.entryLimit){
				this.publish(); //publish when total num of entries is >= the entry limit
			}
		},
		
		/**
		 * Wraps the written text in a closure and execs it.
		 * @return void
		 */
		 publish: function(){
		 	
	 		//handle debug modifications
	 		var entries = this.entries;
	 		if(arguments.callee.debug){
	 			entries = arguments.callee.debug(entries);
	 		}
	 		//run code in a self executing closure
	 		ProtoSafe.exec({capsulate: entries.join('\n')});
	 		
	 		//clear entries
	 		this.entries = [];
	 		this.entryCount = 0;
		}
	},
	
	/**
	 * ProtoSafe.Query
	 *
	 * Utility object that parses query parameters.
	 * @static
	 */
	Query: {
		
		/**
		 * @var array of parsed query parameters
		 */
		params: {},
		
		/**
		 * Gets value of given param name.
		 * @param string name
		 * @return mixed
		 */
		get: function(name){
			return this.params[name];
		},
		
		/**
		 * Extracts query variable name/value pairs.
		 * @param string query
		 * @return void
		 */
		parse: function(query){
			var pairs = query.substring(query.indexOf('?')+1).split('&');
			this.params = {}; //clear old params
			for(var i=0, pair; pair=pairs[i]; i++){
				pair = pair.split('=');
				this.params[pair[0]] = this.resolveValue(pair[1]);
			}
		},
		
		/**
		 * Resolve data type from string value.
		 * @param string value
		 * @return mixed
		 */
		resolveValue: function(value){
			
			//is null
			if(!value && value !== 0)
				return null;
			//is boolean
			if(/^(1|0|true|false)$/.test(value))
				return /1|true/.test(value)? true : false;
			//is array
			if(value.indexOf(',') !== -1){
				for(var i=0,item,value=value.split(','); item=value[i]; i++)
					value[i] = this.resolveValue(item);
			}
			return value;
		}
	}
});

/**
 * @staticvar holds the persisted sandboxes
 */
ProtoSafe.exec.persisted = [];

/**
 * ProtoSafe.AjaxRequest() (Instanciable)
 *
 * Old school ajax request modeled
 * after the Prototype Ajax methods. 
 *
 * @link http://www.ibm.com/developerworks/web/library/wa-ajaxintro1.html
 * @link http://developer.mozilla.org/en/docs/XMLHttpRequest
 */
ProtoSafe.AjaxRequest = function() {
	this.initialize.apply(this, arguments);
};

ProtoSafe.extend(ProtoSafe.AjaxRequest.prototype, {
	
	/**
	 * @var ajax request completed flag
	 */
	_completed: false,
	
	/**
	 * @var ajax request options
	 */
	options: false,
	
	/**
	 * @var flag to allow the status code 0
	 */
	allowStatusZero: false,
	
	/**
	 * @var holds XMLHttpRequest object
	 */
	transport: false,
	
	/**
	 * Initializes the ajax request.
	 * @param string url
	 * @param object options
	 * @return XMLHttpRequest
	 * @link http://ajaxian.com/archives/using-the-http-accept-header-for-ajax
	 */
	initialize: function(uri, options){
		
		var self = this;
		this.options = options || {};
		if(!/^(get|post)$/i.test(this.options.method)) this.options.method = 'post';
		if(this.options.asynchronous == null) this.options.asynchronous = true;
		
		uri = ProtoSafe.cleanPath(uri);
		this.allowStatusZero = /^(file|ftp):/.test(uri) ||
		  (!/^(file|ftp|https?):/.test(uri) && /^(file|ftp):/.test(window.location.protocol));
		
		if(this.transport=this.getTransport()){
			
			this.transport.onreadystatechange = function(){ self.onStateChange()};
			this.transport.open(this.options.method.toUpperCase(), uri, this.options.asynchronous);
			this.transport.setRequestHeader('Accept', 'text/javascript, text/html, application/xml, text/xml, */*');
			this.transport.send(this.options.postBody);
			
			/* Force Firefox to handle ready state 4 for synchronous requests */
			if(!this.options.asynchronous && this.transport.overrideMimeType){
				this.onStateChange();
			}
		}
	},
	
	/**
	 * Mimics Prototype's getTransport() method.
	 * @return XMLHttpRequest
	 * @link http://www.dustindiaz.com/faster-ajax/
	 * @link http://manual.dojotoolkit.org/WikiHome/DojoDotBook/Book50 (bottom of page)
	 */
	getTransport: function(){
		var transport;
		try{
		     /* fallback on activex xmlhttp to avoid IE7 local file-system read error */
		     if(ProtoSafe.Browser.IE && window.location.href.indexOf('file://') == 0) throw 'skip';  
		     
		     transport = new XMLHttpRequest();
			 ProtoSafe.AjaxRequest.prototype.getTransport = function(){ return new XMLHttpRequest()}}catch(e){
		try{ transport = new ActiveXObject('Msxml2.XMLHTTP');
			 ProtoSafe.AjaxRequest.prototype.getTransport = function(){ return new ActiveXObject('Msxml2.XMLHTTP')}}catch(e){
		try{ transport = new ActiveXObject('Microsoft.XMLHTTP');
			 ProtoSafe.AjaxRequest.prototype.getTransport = function(){ return new ActiveXObject('Microsoft.XMLHTTP')}
		}catch(e){
			 ProtoSafe.AjaxRequest.prototype.getTransport = function(){ return false;}
		}}}
		return transport;
	},
	
	/**
	 * Gets the transport's status code.
	 * @return integer
	 */
	getStatus: function() {
    	try{
    		return this.transport.status || 0;
    	}catch(e){ return 0}
    },
	
	/**
	 * Simplified version of Prototype's onStateChange() method.
	 * @param XMLHttpRequest transport
	 * @param object options
	 * @return void
	 * @link http://dev.rubyonrails.org/ticket/10191
	 */
	onStateChange: function(){
		
		if(this.transport.readyState == 4 && !this._completed){
			
			var status = this.getStatus();
			this._completed = true;
			
			if(this.options.onComplete) this.options.onComplete(transport);
			if(((!status && this.allowStatusZero) || (status >= 200 && status < 300)) && this.options.onSuccess){
				this.options.onSuccess(this.transport);
			}else if(this.options.onFailure){
				this.options.onFailure(this.transport);
			}
			this.transport.onreadystatechange = function(){};
		}
	}
});


/**
 * String.prototype.$split()
 *
 * A special clone of split() that returns an $Array.
 * @param string delimiter
 * @return $Array
 */
String.prototype.$split = function(){
	return $Array.to(this.split.apply(this, arguments));
};

/**
 * $Array (Instanciable)
 *
 * Returns an extended array.
 * I choose to extend individual arrays rather than
 * the approach taken by Dean Edwards/Hedger Wang
 * because their subclass didn't act like a real array. 
 *
 * var fruit = new $Array('apples','oranges','bananas'); //would not populate the array
 * fruit[0]  = 'strawberry'; //would not overwrite 'apples'
 * fruit[3]  = 'plum'; //would not effect length property
 *
 * @return array
 * @link http://webreflection.blogspot.com/2008/03/sorry-dean-but-i-subclassed-array-again.html
 * @link http://www.lshift.net/blog/2006/07/24/subclassing-in-javascript-part-1
 * @link http://www.hedgerwow.com/360/dhtml/js-array2.html
 * @link http://dean.edwards.name/weblog/2006/11/hooray/
 */
var $Array = function(){

	var list, args = arguments;
	if(this instanceof $Array &&
		args.length == 1 &&
			typeof args[0] == 'number'){
		//handle new $Array(10)
		list = new Array(args[0]);
	}
	else{
		//handle $Array(1,2,3);
		list = [];
		if(args.length){ 
			list.push.apply(list,args);
		}
	}
	//return extended array
	return $Array.to(list);
};

$Array.prototype = [];

(function(){
	var methods = ['concat', 'filter', 'map', 'reverse', 'slice', 'sort', 'splice', 'unshift'], l = methods.length;
	
	/**
	 * $Array.to()
	 *
	 * Extends an iterable with
	 * the contents of the $Array.prototype.
	 *
	 * @param mixed iterable
	 * @return mixed iterable
	 */
	$Array.to = function(iterable) {
		if(iterable.__proto__ && (iterable.__proto__ = $Array.prototype)) return iterable;
		for(var i in $Array.prototype)
			iterable[i] = $Array.prototype[i];
		var i = l, m;
		while(i) if($Array.prototype[m = methods[--i]]) iterable[m] = $Array.prototype[m];
		return iterable;
	};
	
	//wrap native methods to return $Array instance
	var i = l, m;
	while(i)
	  if(typeof Array.prototype[m = methods[--i]] == 'function')
	    $Array.prototype[m] = new Function('', 'return $Array.to(Array.prototype.'+m+'.apply(this, arguments))');
})();

//start 'er up!
ProtoSafe.init();
