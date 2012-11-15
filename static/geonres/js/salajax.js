/*
The Salajax Class.
Ajax class that allows use of the back button and bookmarks.
Written by Nigel Liefrink.


| This software is provided "as is", without warranty of any kind, express or |
| implied, including  but not limited  to the warranties of  merchantability, |
| fitness for a particular purpose and noninfringement. In no event shall the |
| authors or  copyright  holders be  liable for any claim,  damages or  other |
| liability, whether  in an  action of  contract, tort  or otherwise, arising |
| from,  out of  or in  connection with  the software or  the  use  or  other |
| dealings in the software.   

14-05-2007 : v2.0 Initial version release.  

Usage:
    //set up the salajax settings.
    var sal = new salajax();
    sal.Debug = 0;
    sal.EnableBackButton(true); //turns on the back buttons.
    sal.EnableBookmarks(true); //saves state in the clients cookies so bookmarks will work provided they havn't deleted their cookies.
    sal.OnStart = 'TestOnStart()'; //enables a script to run before the request is made. e.g. change pointer/icon/loading section of page.
    sal.OnEnd = 'TestOnEnd()'; //enables a script to run after the request is returned. e.g. change pointer/icon/loading section of page.
    sal.PresendHtml = '<img border="0" src="http://www.ajaxload.info/cache/ff/ff/ff/00/80/ff/24-1.gif"/>';
    sal.OnError = 'DefaultOnError()';//set a function to pass to if there is an error.
    sal.OnErrorHtml = '<img border="0" src="http://www.register.com/images/icons/error_icon.gif" /><font color="red">Error!</font>'; //When calling  etInnerHTMLFromAjaxResponse and there is an error, this will be displayed.
    sal.EvalScripts = true; //if set to true, will evaluate any javascript in the responseText. 
                             //NOTE: to use functions returned in your responseText you must declare the functions in your ajax response like this:
                             //         var FunctionToChange = function(var1,var2)
                             //         { 
                             //             //do stuff
                             //         }
                             //            
    this.KeepDotNetViewState = true; //if set to true will post the current viewstate when using .NET
    //end setting the salajax settings.
    
    
    Some examples of main usage in web page:
    sal.PassAjaxResponseToFunction('/myscript.*?getsomehtml=1', 'FunctionToHandleTheResponse');
    sal.PassAjaxResponseToFunction(document.forms[0], 'FunctionToHandleTheResponse');

	sal.SetInnerHTMLFromAjaxResponse('/myscript.*?getsomehtml=1', 'id_of_div'); //using get and string of id div.
	sal.SetInnerHTMLFromAjaxResponse(document.forms[0], object);//using post and object to change the innerhtml of.
	sal.SetInnerHTMLFromAjaxResponse('form', 'id_of_div');//using post ('form' will submit forms[0]'), object to change the innerhtml of.

    Read function definitions for more detail.



*/
function salajax()
{
    this.Debug = 0;//1=Debug, 2=Verbose - will cause alert statements to popup.
    this.PresendHtml = 'Loading...'; //TODO: use an image. When set to null, this will leave the current html until the response is returned.
    this.OnStart = '';//set a function to pass to eval.
    this.OnEnd = '';//set a function to pass to eval.
    this.OnError = 'DefaultOnError()';//set a function to pass if there is an error.
    this.OnErrorHtml = '<font color="red">Error!</font>'; //When setting InnerHtml and there is an error this will be displayed. Set to null to turn this feature off.
    this.EvalScripts = false; //if set to true, will evaluate any javascript in the responseText.
    this.KeepDotNetViewState = false; //if set to true will post the current viewstate when using .NET
    this.EnableBookmarkDays = 600; //how many days to keep the bookmarks..
    //TODO: Possibly save state on server, send the key in the request to the server or make a seperate ajax call to get and save state...
    //this.SaveStateOnServer = false; //if set to true will send the key name with the request.
    
    //Also Available are these two functions.
    //this.EnableBackButton(false);
    //this.EnableBookmarks(false);

    var _backButtonEnabled = false;
    var _bookmarksEnabled = false;
    var _savedstate = new Object();
    var _savedkeys = new Array();
    
    var self = this;
    
    
    //enables back button and storing of state keys in the # of the url.
    //will also start polling for any changes to the hash, so as to update the ajax section of the page.
    this.EnableBackButton = function(blnEnable) 
    {
        _backButtonEnabled = blnEnable;
        if(blnEnable)
        {
            this.PollForStateChange();
        }
    }
    
    //Default Function to call when there is an error.
    var DefaultOnError = function()
    {
        alert('There was an error loading the data. Sorry for the inconvenience.');
    }
    
    
    /**
    <summary>
    Gets the response stream from the passed url, and then calls the callbackFuntion passing the response and the div_ids.
    </summary>
    <param name="url">The url to make the request to get the response data.</param>
    <param name="callbackFunction">The function to call after the response has been recieved. the response <b>must</b> always be the first argument to the function.</param>
    </summary>
    <example>
	<code>
	var sal = new salajax();
	sal.PassAjaxResponseToFunction('?getsomehtml=1', 'FunctionToHandleTheResponse');

    function FunctionToHandleTheResponse(response){
	    var data = response.split(';');
	    document.getElementById('d1').innerHTML = data[0];
	    document.getElementById('d2').innerHTML = data[1];
	    document.getElementById('d3').innerHTML = data[2];
    }
	    </code>
    </example>
    */
    this.PassAjaxResponseToFunction = function (urlOrForm, callbackFunction)
    {		
      if(this.onStart != '')
      {
        eval(this.OnStart);
      }
      var xmlhttp = new this.GetXmlHttp();
      //now we got the XmlHttpRequest object, send the request.
      if(this.Debug >= 2)
      {
        alert(urlOrForm);
      }

      if (xmlhttp)
      {
         xmlhttp = this.SetReadyStateForFunction(xmlhttp, callbackFunction)                          
         this.SubmitXmlHttp(urlOrForm, xmlhttp, 'f|'+callbackFunction);
      }

    }


    /**
    ///<summary>
    ///Sets the innerHTML property of obj_id with the response from the passed url or form./
    ///</summary>
    ///<param name="urlOrForm">The url or form to submit to make the request to get the response data.</param>
    ///<param name="obj_id">The object or the id as a string of the object to set the innerHTML for.</param>
    <example>
	<code>
	var sal = new salajax();
	sal.SetInnerHTMLFromAjaxResponse('?getsomehtml=1', 'id_of_div'); //using get and string of id div.
	sal.SetInnerHTMLFromAjaxResponse(document.forms[0], object);//using post and object to change the innerhtml of.
	sal.SetInnerHTMLFromAjaxResponse('form', object);//using post ('form' will submit forms[0]'), object to change the innerhtml of.
	</code>
    </example>
    */
    this.SetInnerHTMLFromAjaxResponse = function (urlOrForm, obj_id)
    {	
    
      if(this.onStart != '')	                                                    {
        eval(this.OnStart);
      }
      
      var xmlhttp = new this.GetXmlHttp();
      //now we got the XmlHttpRequest object, send the request.
      if (xmlhttp)
      { 
        if(typeof obj_id == 'string')
        {
           obj_id = document.getElementById(obj_id);
        }
        
        xmlhttp = this.SetReadyStateForInnerHtml(xmlhttp, obj_id)
       
        if(this.PresendHtml != null)
        {
            obj_id.innerHTML = this.PresendHtml;
        }
        
        var bb_div_id = obj_id.id;
	    this.SubmitXmlHttp(urlOrForm, xmlhttp, 'h|'+bb_div_id);

      }
    }
    

    /**
    Browser Compatability function.
    Returns the correct XMLHttpRequest depending on the current browser.
    */
    this.GetXmlHttp = function() {	
                var xmlhttp = false;
                if (window.XMLHttpRequest)
                {
                    xmlhttp = new XMLHttpRequest();
                }
                else if (window.ActiveXObject)// code for IE
                {
                    try 
                    {
	                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                    } 
                    catch (e) 
                    {
	                    try 
	                    {
		                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	                    } catch (E) {
		                    xmlhttp=false;
	                    }
                    }
                }
                return xmlhttp;
            }

    /**
        Returns the values of the form as a Post string to add to the header of the request.
        Modified from code here: http://www.codeproject.com/Ajax/AJAXWasHere-Part1.asp
    */
    this.GetPostDataFromForm = function(theform)
    {
        var theData = '';
        var eName = '';
    	
        theData = 'ajax=true&';
        for( var i=0; i<theform.elements.length; i++ )
        {
            eName = theform.elements[i].name;
            if(eName == '')
            {
                eName = theform.elements[i].id;
            }

            if(this.Debug >= 2)
            {
                alert('FormElement:'+eName+'='+theform.elements[i]);
            }

            //Handle .NET VIEWSTATE
            if( eName && eName != '')
            {
              
              if(  eName == '__EVENTTARGET' 
                || eName == '__EVENTARGUMENT' 
                || eName == '__VIEWSTATE' )
              {
                if(eName = '__VIEWSTATE' && this.KeepDotNetViewState)
                {
                    theData += '__VIEWSTATE=' + escape(theform.__VIEWSTATE.value).replace(new RegExp('\\+', 'g'), '%2b') + '&';
                }
              }
              else
              {
                theData = theData + escape(eName) + '=' + escape(theform.elements[i].value);
                if( i != theform.elements.length - 1 )
                  theData = theData + '&';
              }
            }
            }//end for
            if(this.Debug >= 1)
            {
                alert('DataToSend:'+theData);
            }
        return theData;
        }


        /**
            Sets up the xmlhttp object to pass the responseText to a the specified callbackfunction.
            Private method.
        */
        this.SetReadyStateForFunction = function (xmlhttp, callbackFunction)
        {
            var debug = this.Debug;
            var onEnd = this.OnEnd;
            var onError = this.OnError;
            
             xmlhttp.onreadystatechange = function () 
                                            {
                                                if (xmlhttp && xmlhttp.readyState==4)
                                                {//we got something back..
                                                    if (xmlhttp.status==200)
                                                    {
	                                                    var response = xmlhttp.responseText;
	                                                    var functionToCall = callbackFunction+'(response)';
	                                                    if(debug >= 2){
		                                                    alert(response);
		                                                    alert(functionToCall);
	                                                    }
	                                                    eval(functionToCall);
    	                                                
	                                                    if(onEnd != '')
                                                        {
                                                            eval(onEnd);
                                                        }
                                                        
                                                    } 
                                                    else
                                                    {
                                                      if(onError != '')
                                                      {
                                                        eval(onError);
                                                      }
                                                      if(debug >= 1)
                                                      {
	                                                    document.write(xmlhttp.responseText);
                                                      }
                                                    }
                                                    

                                                }
                                            }
            return xmlhttp;
        }
        
         /**
            Sets up the xmlhttp object to update the innerHTML of the obj_id with the responseText.
            Private method.
        */
        this.SetReadyStateForInnerHtml = function (xmlhttp, obj_id)
        {

            var onEnd = this.OnEnd;
            var debug = this.Debug;
            var onError = this.OnError;
            var self = this;
            
                xmlhttp.onreadystatechange = function () 
                                            {
                                                if (xmlhttp && xmlhttp.readyState==4)
                                                {//we got something back..
                                                    if (xmlhttp.status==200)
                                                    {
	                                                    if(debug >= 1){
		                                                    alert(xmlhttp.responseText);
	                                                    }
		                                                obj_id.innerHTML = xmlhttp.responseText;
    	                                                
	                                                    if(self.EvalScripts)
                                                        {
                                                            self.EvaluateScripts(xmlhttp.responseText);
                                                        }
                                                        
	                                                    if(onEnd != '')
                                                        {
                                                            eval(onEnd);
                                                        }
         
                                                    } 
                                                    else
                                                    {
                                                      if(onError != '')
                                                      {
                                                        eval(onError);
                                                        obj_id.innerHTML = self.OnErrorHtml;
                                                      }
                                                      if(debug >= 1)
                                                      {
	                                                    document.write(xmlhttp.responseText);
                                                      }
                                                    }
                                                }
                                            }
            return xmlhttp;
        }

        /**
            Evaluates any javascript that is in the responseText.
            **NOTE: if you want to use functions that are in the responseText, the function must be written as a variable.
            (this can easily be achieved by swapping the name and the function declaration around and adding an '=' sign.)
            e.g.
                
                AFunctionInTheResponse = function(some, vars)
                {
                    //do stuff with some vars
                }
                NOT: function AFunctionInTheResponse(some, vars){ // this will not work. }
            Private Method.
        */            
        this.EvaluateScripts = function(responseText)
        {
            var matchAll = new RegExp('(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'img');
            var scripts = '';
            while (scripts = matchAll.exec(responseText))
            {
                eval(scripts[1]);
            }
        }
             
             
             
      
            
            
        /*
        Submits the initialised xmlhttp object to the server.
        and updates the address bar if back button is enabled.
        Private Method.
        */
        this.SubmitXmlHttp = function (urlOrForm, xmlhttp, callid)
        {
            //quick param for submitting the first form                        
            if(urlOrForm == 'form'){
                urlOrForm = document.forms[0];
            }          
            
            var bb_params;		
                                                                            
            if(typeof urlOrForm == 'string')
            { //it a get request.          
              var url = urlOrForm;
              if(url.indexOf('?') == 0)//is shortcut link
              {
                url = document.location.pathname+url;
              }
                xmlhttp.open("GET",url,true);
                xmlhttp.send(null);
    			
                bb_params = '|g|'+url+'|'+callid
            } 
            else 
            { //it is a form.... submit all the values
                var f = urlOrForm
                var theData = this.GetPostDataFromForm(f);
                if(f.action == null || f.action == "")
                {
                    f.action = document.location.pathname;
                }
                if(f.action.indexOf('?') == 0)
                {
                    f.action = document.location.pathname+f.action;
                }
                
                xmlhttp.open('POST', f.action, true);
                xmlhttp.setRequestHeader('Content-Type', 
												                    'application/x-www-form-urlencoded');
                xmlhttp.send(theData);
                bb_params = theData+'|p|'+f.action+'|'+callid
    			   
            } 
            if(_backButtonEnabled)
            {
                UpdateAddressBar(bb_params);
            }
        }
             
             
             
             

                
    /*
    Updates the address bar and adds the saved params using the hashlistenter.
    //extra vals stored as | [posttype(g=get,p=post) | url/action | f=function,h=setinnerhtml | funcname or divname
    */
    var UpdateAddressBar = function(address) {
    
        var split = address.split('|');
        //the last is the Div that was changed.
        var keyn = split[split.length-1]; //use this as the key to store the data.
        var hash = hashListener.getHash().substring(1);//remove the '#'
        var hashkeys = hash.split(':');
        var keysaved = false;
        var stateIsSavedAs = '';
        
        if(_bookmarksEnabled)
        { //check cookies to see if the state has been saved in da cookie
            var cs = document.cookie.split(';');
            for(var c=0;c<cs.length;c++)
            {
                var ckey = cs[c].substring(0,cs[c].indexOf('=')).trim()
                var ckeyn = ckey.split('@');
                ckeyn = ckeyn[0];
                var cval = cs[c].substring(cs[c].indexOf('=')+1,cs[c].length);
                //alert('cookKey'+c+':'+ckey+'\n'+'cookVal'+c+':'+cval);
                if(keyn == ckeyn && cval == address)
                {
                    var stateissaved = cs[c].split('=');
                    stateIsSavedAs = stateissaved[0].trim();
                    break;
                }
            }
        }
        
        //check in the state object
        if(stateIsSavedAs == '')
        {
            for(var i=0;i<_savedkeys.length;i++)
            {
                var skey = _savedkeys[i];
                var skeyn = skey.split('@');
                skeyn = skeyn[0];
                //alert('Checking if Saved\n'+'Key:'+_savedkeys[i]+'\n'+address + ' ==\n'+ _savedstate[_savedkeys[i]]);
                if(skeyn == keyn && address == _savedstate[skey])
                {
                    stateIsSavedAs = skey; //set to the key that has been saved.
                    break;
                }
            }
        }
        
        //work out the old key
        var oldkey = '';
        for(var i=1; i<hashkeys.length; i++)
        {
            var hashkey = hashkeys[i].split('@');
            var hashkeyn = hashkey[0];
            var hashkeye = hashkey[1];

            if(hashkeyn == keyn)//this section has been changed by an ajax request.
            {
                oldkey=hashkeys[i];
                break;
            }
        }
        
        //if the state hasn't been saved we need to create a new key.
        if(stateIsSavedAs == '')
        {
            g_eventCount++;
            key = keyn +'@'+g_eventCount;
            SaveState(key, address);
            //alert('Created New Key:'+key);
        } 
        else //just save the state
        {
            key = stateIsSavedAs;
            //alert('Key is saved:'+key);
            SaveState(key, address);
        }
        
        
        if(oldkey == '')
        {
            hash+=':'+key;
        } else {  
            hash = hash.replace(oldkey, key);
        }
        
        hashListener.setHash(hash);
    }      
    
    
    //Used for saving the state of an ajax request.
    var SaveState = function(key, data)
    {
        _savedstate[key] = data;
        _savedkeys.push(key);
         if(_bookmarksEnabled)
         {
            createCookie(key, data, self.EnableBookmarkDays);
         }
         //TODO:Store state information on server via ajax requests? Cookie is limited to 4K. (not much)
         //Or Maybe one of these methods http://www.niallkennedy.com/blog/archives/2007/01/ajax-performance-local-storage.html
    }
    
    //Gets the state of an ajax element.
    var GetState = function(key)
    {
        if(_bookmarksEnabled && _savedstate[key] == null)
        {
            return readCookie(key);
        } else {
            return _savedstate[key];
        }
        //TODO:Get state information from server via ajax requests?
    }
    
    
    
    //Private Function to update all the ajax elements 
    //from the keys that are contained in the hash of the url.
    var UpdateAjaxDivs = function()
    {
       //TODO: get key from the address bar 
       // return state information from a cookie
       // or on the server using the key as a reference.
        var hash = hashListener.getHash();
        hash = hash.substring(1);
        if(hash != '')
        {
            var savedkeys = hash.split(':');
            for(var i=1;i<savedkeys.length;i++)
            {
                //TODO: keep/find the last state of this div
                //So we don't make any uneeded ajax requests divs, ie already set.
                
                var data = GetState(savedkeys[i])
                if(data != null)
                {
                var data = data.split('|');
                if(data.length >= 4) 
                {
                    var funcdiv = data.pop();
                    var fh = data.pop();
                    var url = data.pop();
                    var postget = data.pop();
                    
                    var xmlhttp = self.GetXmlHttp();
                    //now we got the XmlHttpRequest object, send the request.
                    if (xmlhttp)
                    { 
                        if(self.onStart != '')
                        {
                            eval(self.OnStart);
                        }
                    
                        if(fh == 'h')
                        {
                           var fd = document.getElementById(funcdiv);
                           if(fd == null)
                           {
                                //setTimeout(this.PollForStateChange, this.BBPoleTime);
                                return;
                           }
                           xmlhttp =  self.SetReadyStateForInnerHtml(xmlhttp, fd)
                        } else {//set for function.
                            
                           xmlhttp = self.SetReadyStateForFunction(xmlhttp, funcdiv)
                        }
                        
                        //set the inner html if we are affecting a div.
                        if(fd)
                        {
                            if(self.PresendHtml != null)
                            {
                                fd.innerHTML = self.PresendHtml;
                            }
                        }
                        
                        //send the request via ajax
                        if(postget == 'p')
                        {
                            //reconstruct theData
                            var theData = data.pop(); 
                            
                            xmlhttp.open('POST', url, true);
                            xmlhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

                            if(self.Debug > 0){
					            alert('TheData:'+theData);
					        }
							
                            xmlhttp.send(theData);

                        } else {//g
                            xmlhttp.open('GET',url,true);
                            xmlhttp.send(null);
                        }
                    }
                }
                }//if data.length
            } //end for
        }else{//no hash
            //document.location.reload();
        } 
    }
    
    
    //if set to true will store state information in cookies
    //on the clients computer.
    this.EnableBookmarks = function(blnEnable) 
    {
        _bookmarksEnabled = blnEnable
        if(blnEnable)
        {
            setTimeout(UpdateAjaxDivs,100);
        }
    }
    
    
    
    /*
    If the back button is enabled this method will watch for changes to the hash
    and update the ajax areas when a change is detected.
    */
    this.PollForStateChange = function()
    {
        if(_backButtonEnabled)
        {
           hashListener.onHashChanged = UpdateAjaxDivs
        } 
        else 
        {//disable back button - could potentially remove other instances that are monitoring.
         //hashListener.onHashChanged = function(){}
        }
    }      
}//END salajax_class






String.prototype.trim = function() {return this.replace(/^\s+|\s+$/g,"");}
//String.prototype.ltrim = function() {return this.replace(/^\s+/g,"");}
//String.prototype.rtrim = function() {return this.replace(/\s+$/g,"");}


/* Backward compatability. */
function PassAjaxResponseToFunction(urlOrForm, callbackFunction)
{
    var sal = new salajax();
    sal.PresendHtml = null;
    sal.OnError = '';
    sal.ErrorHtml == null;
    sal.PassAjaxResponseToFunction(urlOrForm, callbackFunction);
}

/* Backward compatability. */
function SetInnerHTMLFromAjaxResponse(urlOrForm, obj_id)
{
    var sal = new salajax();
    sal.PresendHtml = null;
    sal.OnError = '';
    sal.ErrorHtml == null;
    sal.SetInnerHTMLFromAjaxResponse(urlOrForm, obj_id);
}

/*
//This ensures that bookmarks cannot be overridden by replacing the key values saved in cookies.
//NOTE: cookies do have a limitation in size of data that can be saved..
//NOTE: ints may eventually run out and cause issues
//TODO: fix these potential problems.
*/
function GetSafeEventCount()
{
    var retVal = 0;    
    var cs = document.cookie
    cs = cs.split(';');
    for(var c=0;c<cs.length;c++)
    {
        var ckey = cs[c].substring(0,cs[c].indexOf('='))
        var ckeyn = ckey.split('@');
        if(ckeyn[1] != null && ckeyn[1] > retVal)
        {
            retVal = ckeyn[1];
        }
    }
    return parseInt(retVal);
}                      
var g_eventCount = GetSafeEventCount(); 
    







/*----------------------------------------------------------------------------\
|                             Hash Listener 1.0                               |
|-----------------------------------------------------------------------------|
|                         Created by Erik Arvidsson                           |
|                  (http://webfx.eae.net/contact.html#erik)                   |
|                      For WebFX (http://webfx.eae.net/)                      |
|-----------------------------------------------------------------------------|
|   Basic object to allow updating the hash part of the document location.    |
|-----------------------------------------------------------------------------|
|                  Copyright (c) 1998 - 2005 Erik Arvidsson                   |
|-----------------------------------------------------------------------------|
| Basic object to allow updating the hash part of the document location.      |
| Mozilla always adds an entry to the history but for IE we add an optional   |
| flag whether to add an entry to the history and if this is set an iframe is |
| used to support this behavior (this is on by default).                      |
|                                                                             |
| When the hash value changes onHashChanged is called. Override this to do    |
| your own callbacks.                                                         |
|                                                                             |
| Usage: Include script                                                       |
|        Override onHashChanged: hashListener.onHashChanged = fn              |
|                                                                             |
| Known issues: Known to not work with Opera                                  |
|               Not tested with KHTML/Safari                                  |
|               Might interfere with other iframe based loading               |
|- ---------------------------------------------------------------------------|
| This software is provided "as is", without warranty of any kind, express or |
| implied, including  but not limited  to the warranties of  merchantability, |
| fitness for a particular purpose and noninfringement. In no event shall the |
| authors or  copyright  holders be  liable for any claim,  damages or  other |
| liability, whether  in an  action of  contract, tort  or otherwise, arising |
| from,  out of  or in  connection with  the software or  the  use  or  other |
| dealings in the software.                                                   |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |
| ... removed standard license part of header for now...                      |
|-----------------------------------------------------------------------------|
| 2005-05-15 | First version                                                  |
|-----------------------------------------------------------------------------|
| Created 2005-05-15 | All changes are in the log above. | Updated 2005-05-15 |
\----------------------------------------------------------------------------*/
//Note that I have made some changes to this class in order to get it to work with salajax class.
var hashListener = {
	ie:		/MSIE/.test(navigator.userAgent),
	ieSupportBack:	true,
	hash:	document.location.hash,
	initialised: false,
	check:	function () {
		var h = document.location.hash
		var h2 = this.hash

		if (h != h2) {
		    //alert(h+"\n:\n"+h2)
			this.hash = h;
			this.onHashChanged();
		}
	},
	init:	function () {

		// for IE we need the iframe state trick
		if (this.ie && this.ieSupportBack) {
			var frame = document.createElement("iframe");
			frame.id = "state-frame";
			frame.style.display = "none";
			document.body.appendChild(frame);
			this.writeFrame("");
		}

		var self = this;

		// IE
		if ("onpropertychange" in document && "attachEvent" in document) {
			document.attachEvent("onpropertychange", function () {
				if (event.propertyName == "location") {
					self.check();
				}
			});
		} else {
		// poll for changes of the hash
		    window.setInterval(function () { self.check() }, 100);
		}
		this.initialised = true;
	},
	setHash: function (s) {
	    this.hash = '#'+s;
		// Mozilla always adds an entry to the history
		//this.init();
		
		if(!this.initialised)
		{
		    this.init();
		}
		
		if (this.ie && this.ieSupportBack) {
			this.writeFrame(s);
		}
		//if (this.hash != '' && this.hash != document.location.hash) {
			document.location.hash = this.hash;
		//}
	},
	getHash: function () {
		return document.location.hash;
	},
	writeFrame:	function (s) {
		var f = document.getElementById("state-frame");
		var d = f.contentDocument || f.contentWindow.document;
		
		d.open();
		d.write("<script>window._hash = '" + s + "'; window.onload = parent.hashListener.syncHash;<\/script>");
		d.close();
	},
	syncHash:	function () {
		var s = this._hash;
		
		if (s != '' && s != document.location.hash) {
			document.location.hash = s;
		}
	},
	onHashChanged:	function () {}
};


function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


function eraseCookie(name) {
	createCookie(name,"",-1);
}

