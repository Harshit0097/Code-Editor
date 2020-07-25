const $ = jQuery = require("jquery");
require("jstree");
require('jquery-ui-dist/jquery-ui');
const nodePath=require("path")
let fs=require("fs");
const { jstree } = require("jquery");
var os = require('os');
var pty = require('node-pty');
const { electron } = require("process");
var Terminal = require('xterm').Terminal;
const { FitAddon } = require("xterm-addon-fit");

$(document).ready(async function(){
    const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });

    // Initialize xterm.js and attach it to the DOM
    const xterm = new Terminal({
        
        fontSize: 12
        // default is canvas
    });
    xterm.setOption('theme', {
        background: "#764ba2",
        foreground: "white",
    });
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.open(document.getElementById('terminal'));
    fitAddon.fit();
    // Setup communication between xterm.js and node-pty
    xterm.onData(data => ptyProcess.write(data));
    ptyProcess.on('data', function (data) {
        xterm.write(data);
    });


    let editor= await createEditor();
    console.log(editor);

    let currPath=process.cwd();
    console.log(currPath);

    let tabs = $( "#tabs" ).tabs();
    tabs.on( "click", "span.ui-icon-close", function() {
        var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
        $( "#" + panelId ).remove();
        tabs.tabs( "refresh" );
        $( "#tabs" ).tabs('option','active',0);
        if($('#tabs ul li a').length==0)
         {   editor.setValue("Hello");
            return;
            
        }
        updateEditor($('#tabs ul li a').attr('unique'));
      });
    tabs.on('click','.ui-tabs-tab a',function(){
        let path=$(this).attr('href');
        console.log(tabs);
        clicked(path);
    })
    let data=[];
    let baseobj={
        id:currPath,
        parent:'#',
        text: getNameFrompath(currPath)
    }
    data.push(baseobj);
    
    let rootchildren=getChildren(currPath)
    data=data.concat(rootchildren);
    
    $('#jstree').jstree({
        "core":{
            "check_callback": true,
            "data":data,
            "themes":{
                "icons": false
            }
        }
    }).on('open_node.jstree',function(e,data){
        //console.log(data.node.children);
        
        data.node.children.forEach(function(child){
            
            let childDirectories=getChildren(child);
            
            childDirectories.forEach(function(directory){
                if($('#jstree').jstree(true).get_node(directory.id)==false) 
                {
                    $("#jstree").jstree().create_node(child,directory,"last");                    
                }
                else{
                    return;
                }
                
            })
        })
    }).on("select_node.jstree",function(e,data){
        console.log(data.node.id);
        openFile(data.node.id);
        
        // tabs.click();
    });
    
    function clicked(path){
        updateEditor(path.substring(1));
        // console.log();
        console.log('clicked');
    }
    function updateEditor(path)
    {
        if(fs.lstatSync(path).isDirectory())   
            return;
        let fileName=getNameFrompath(path);
        let fileExtension= fileName.split('.')[1];
        if(fileExtension==='js')
            fileExtension='javascript';
        let data= fs.readFileSync(path).toString();
        editor.setValue(data);
        monaco.editor.setModelLanguage(editor.getModel(),fileExtension);        
    }

    
    function openFile(path){
        if(fs.lstatSync(path).isDirectory())   
            return;
        let allpath=$('#tabs ul li a');
        console.log(path);
        for(let i=0;i<allpath.length;i++)
        {
            if($(allpath[i]).attr('unique')===path) {
                $( "#tabs" ).tabs('option','active',i);
                updateEditor(path);
                return;
            }
        }
        let fileName= getNameFrompath(path);
        let label= fileName;
        let id=fileName;

        let tabTemplate = "<li><a href='#{href}'  unique='#{qwerty}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation' >Remove Tab</span></li>";
        let li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ).replace(/#\{qwerty\}/g, path));
        tabs.find( ".ui-tabs-nav" ).append( li );
        tabs.append( "<div id='" + id + "'><p>" +  "</p></div>" );
        tabs.tabs( "refresh" ); 
        let x=$('#tabs li').length-1;
        $( "#tabs" ).tabs('option','active',x); 
        updateEditor(path);      
    }

})
function getNameFrompath(path)
{
   return nodePath.basename(path);
}
function getChildren(path)
{
    if(fs.lstatSync(path).isFile()){
        return [];
    }
    let files=fs.readdirSync(path);
    let rv=[];
    for(let i=0;i<files.length;i++)
    {
        let file=files[i];
        rv.push({
            id:nodePath.join(path,file),
            parent: path,
            text:file
        })
    }
    return rv;
}

function createEditor(){
    return new Promise(function(resolve,reject){
       let monacoLoader=require('./node_modules/monaco-editor/min/vs/loader.js');

        monacoLoader.require.config({ paths: { 'vs': './node_modules/monaco-editor/min/vs' }});

	    monacoLoader.require(['vs/editor/editor.main'], function() {
            monaco.editor.defineTheme('myTheme', {
                base: 'vs-dark',
                inherit: true,
                rules: [{ background: '#1e2024' }],
                "colors": {
                    "editor.foreground": "#F8F8F8",
                    "editor.background": "#1e2024",
                    "editor.selectionBackground": "#DDF0FF33",
                    "editor.lineHighlightBackground": "#FFFFFF08",
                    "editorCursor.foreground": "#A7A7A7",
                    "editorWhitespace.foreground": "#FFFFFF40"
                }
            });
            monaco.editor.setTheme('myTheme');
            var editor = monaco.editor.create(document.getElementById('editor'), {
			value: [
				'function x() {',
				'\tconsole.log("Hello world!");',
				'}'
			].join('\n'),
            language: 'javascript',
            theme:"myTheme"
        });
        
        resolve(editor);
	});
    })
}