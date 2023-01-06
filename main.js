// CONFIGURE
const copynocode_discover = "https://copynocode-test.bubbleapps.io/version-test/discover"
const copynocode_create = "https://copynocode-test.bubbleapps.io/version-test/create"
const copynocode_update = "https://copynocode-test.bubbleapps.io/version-test/create/{id}"
const copynocode_restore = "https://copynocode-test.bubbleapps.io/version-test/create/{id}"

// TODOs
// count fields for things, listing
// count properties for option sets, listing
// count workflows, listing
// add fonts and colors
// fix naming
// tokens font and tokens colors
// get default styles

/* FLOW

Start
1. Create discover, create, update and restore elements
2. STATE = LOADING (on load create iframe)
3. Detect platform & appname
4. Check cache for import and copy, and send it
5. Start listening for copy
5. Refresh IMPORT
6. STATE = READY

RESTORE (to bubble)
1. STATE = RESTORE
2. Add to localstorage
3. STATE = READY

COPY (from bubble)
1. STATE = COPY
2. Analyse component tree
3. Add imported to it
4. STATE = READY

*/

const DEBUG = true;

// get appname
var url = new URL(window.location.href);
const appname = url.searchParams.get('id');
const platform = "bubble"

$(async function () {

    handler.general.create_ui(platform, appname);
    
});

var related_assets;

var clipboard = {}

var changed = {}

top.window.addEventListener("message", function(message) {

    if(message.data['copynocode_mode']) {

        handler.general.switchState('all', 'close');
        handler.general.switchState(message.data['copynocode_mode'].type, 'open', message.data['copynocode_mode']['id']);

    }

    if(message.data['copynocode_import']) {
        handler[platform].import();
    }

    if(message.data['copynocode_copy']) {
        if(DEBUG) console.log('Got Data from CopyNoCode' + JSON.stringify(message.data.copynocode));

        handler[platform].restore(message.data['copynocode_copy'])
    }

    if(message.data['copynocode_loaded']) {
        if(DEBUG) console.log('copynocode is loaded')

        handler[platform].restore_cache(appname);

        handler[platform].import();

        handler[platform].listen();
    }
});

var handler = {
    "general": {
        create_ui: function(platform, type) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = chrome.runtime.getURL("style.css");
            document.head.appendChild(link);

            if(DEBUG) console.log('loading CopyNoCode')
            
            let copynocodeui = setInterval(function () {
                if ($(".main-tab-bar").length) {
                    clearInterval(copynocodeui);
                    $(".main-tab-bar").append('<div class="tab discover" id="copynocode-btn"><img id="copynocode-icon" src="https://s3.amazonaws.com/appforest_uf/f1672312679295x617020231160427600/copynocode-icon.png" width=21 height=21><span>Discover</span></div>');
                    $(".main-tab-bar").append('<div class="tab create" id="copynocode-btn"><img id="copynocode-icon" src="https://s3.amazonaws.com/appforest_uf/f1672312679295x617020231160427600/copynocode-icon.png" width=21 height=21><span>Create</span></div>');
                }

                $("body").append(`<div id="copynocode-container-discover">
                    <iframe id="copynocode-iframe-discover" src="` + copynocode_discover + `"></iframe>
                </div>`);

                $("body").append(`<div id="copynocode-container-create">
                    <div id="copynocode-icons">
                        <span class="show"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"><path fill-rule="evenodd" d="M13.28 3.97a.75.75 0 010 1.06L6.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6 0a.75.75 0 010 1.06L12.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clip-rule="evenodd" /></svg></span>
                        <span class="hide"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"> <path fill-rule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 010-1.06zm6 0a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg></span>
                        <span class="close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FFF" class="w-6 h-6"> <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg></span>
                    </div>
                    <iframe id="copynocode-iframe-create" src="` + copynocode_create + `"></iframe>
                </div>`);

                $("body").append(`<div id="copynocode-container-update">
                    <div id="copynocode-icons">
                        <span class="show"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"><path fill-rule="evenodd" d="M13.28 3.97a.75.75 0 010 1.06L6.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6 0a.75.75 0 010 1.06L12.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clip-rule="evenodd" /></svg></span>
                        <span class="hide"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"> <path fill-rule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 010-1.06zm6 0a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg></span>
                        <span class="close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FFF" class="w-6 h-6"> <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg></span>
                    </div>
                    <iframe id="copynocode-iframe-update" src="` + copynocode_update + `"></iframe>
                </div>`);

                $("body").append(`<div id="copynocode-container-restore">
                    <div id="copynocode-icons">
                        <span class="show"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"><path fill-rule="evenodd" d="M13.28 3.97a.75.75 0 010 1.06L6.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6 0a.75.75 0 010 1.06L12.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clip-rule="evenodd" /></svg></span>
                        <span class="hide"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"> <path fill-rule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 010-1.06zm6 0a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg></span>
                        <span class="close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FFF" class="w-6 h-6"> <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg></span>
                    </div>
                    <iframe id="copynocode-iframe-restore" src="` + copynocode_restore + `"></iframe>
                </div>`);

                $('#copynocode-iframe-create').on('load', function() {
                    
                    handler.general.switchState('create', 'close');
                    
                    top.window.postMessage({"copynocode_loaded": true}, "*")
                })

                $('#copynocode-iframe-update').on('load', function() {
                    
                    handler.general.switchState('update', 'close');
                    
                })

                handler.general.switchState('discover', 'close');
                handler.general.switchState('restore', 'close');

            }, 500);

            // sidebar restore
            $(document).on('click', '#copynocode-container-restore #copynocode-icons .close', function () {
                handler.general.switchState('restore', 'close');
            });

            $(document).on('click', '#copynocode-container-restore #copynocode-icons .hide', function () {
                handler.general.switchState('restore', 'hide');
            });

            $(document).on('click', '#copynocode-container-restore #copynocode-icons .show', function () {
                handler.general.switchState('restore', 'show');
            });

            // sidebar create
            $(document).on('click', '#copynocode-btn.create', function () {
                handler.general.switchState('all', 'close');
                handler.general.switchState('create', 'open');
            });

            $(document).on('click', '#copynocode-container-create #copynocode-icons .close', function () {
                handler.general.switchState('create', 'close');
            });

            $(document).on('click', '#copynocode-container-create #copynocode-icons .hide', function () {
                handler.general.switchState('create', 'hide');
            });

            $(document).on('click', '#copynocode-container-create #copynocode-icons .show', function () {
                handler.general.switchState('create', 'show');
            });

            // sidebar update
            $(document).on('click', '#copynocode-container-update #copynocode-icons .close', function () {
                handler.general.switchState('update', 'close');
            });

            $(document).on('click', '#copynocode-container-update #copynocode-icons .hide', function () {
                handler.general.switchState('update', 'hide');
            });

            $(document).on('click', '#copynocode-container-update #copynocode-icons .show', function () {
                handler.general.switchState('update', 'show');
            });

            // discover
            $(document).on('click', '#copynocode-btn.discover', function () {
                handler.general.switchState('discover', 'open');
            });

            $(document).on('click', '#copynocode-container-discover', function() {
                handler.general.switchState('discover', 'close');
            });

            $(document).on('click', '#copynocode-iframe', function() {
                e.stopPropagation();
            });
        },

        switchState: function(mode, state, id="") {
            if(state == "show" || state == "open") {
                $('#copynocode-icons .hide').show();
                $('#copynocode-icons .show').hide();

                if(mode == "discover") $('#copynocode-container-discover').css('display', 'flex');
                if(mode == "discover") $('#copynocode-container-discover').removeClass('hide');
                if(mode == "create") $('#copynocode-container-create').css('display', 'flex');
                if(mode == "create") $('#copynocode-container-create').removeClass('hide');
                if(mode == "update") $('#copynocode-container-update').css('display', 'flex');
                if(mode == "update") $('#copynocode-container-update').removeClass('hide');
                if(mode == "restore") $('#copynocode-container-restore').css('display', 'flex');
                if(mode == "restore") $('#copynocode-container-restore').removeClass('hide');
            }

            if(state == "hide") {
                $('#copynocode-icons .hide').hide();
                $('#copynocode-icons .show').show();

                if(mode == "discover") $('#copynocode-container-discover').addClass('hide');
                if(mode == "create") $('#copynocode-container-create').addClass('hide');
                if(mode == "update") $('#copynocode-container-update').addClass('hide');
                if(mode == "restore") $('#copynocode-container-restore').addClass('hide');
            }

            if(state == "close") {
                if(mode == "discover" || mode == "all") $('#copynocode-container-discover').hide();
                if(mode == "create" || mode == "all") $('#copynocode-container-create').hide();
                if(mode == "update" || mode == "all") $('#copynocode-container-update').hide();
                if(mode == "restore" || mode == "all") $('#copynocode-container-restore').hide();
            }

            if(mode == "update")
            if(id != "") $('#copynocode-iframe.sidebar-update').attr('src', copynocode_update.replace("{id}", id))
            else $('#copynocode-iframe.sidebar-update').attr('src', copynocode_update.replace("{id}", "404"))
            
            if(mode == "restore")
            if(id != "") $('#copynocode-iframe.sidebar-restore').attr('src', copynocode_restore.replace("{id}", id))
            else $('#copynocode-iframe.sidebar-restore').attr('src', copynocode_restore.replace("{id}", "404"))
            
        }
    },

    "bubble": {

        restore_cache: function(appname) {

            chrome.storage.local.get(['bubble_' + appname + "_import"]).then((data) => {
                if(data) console.log("Restore Import from cache");
                let importBubbleData = data['bubble_' + appname + "_import"];
                if(typeof importBubbleData === "object") handler.bubble.send(importBubbleData);
                related_assets = importBubbleData;
            });

            chrome.storage.local.get(['bubble_' + appname + "_copy"]).then((data) => {
                if(data) console.log("Restore Import from cache");
                let importBubbleData = data['bubble_' + appname + "_copy"];
                if(typeof importBubbleData === "object") handler.bubble.send(importBubbleData);
            });

        },

        import: async function() {
            let senddata = setInterval(async function () {
                clearInterval(senddata);
        
                var app_import = await fetch('https://bubble.io/appeditor/export/test/' + appname + '.bubble')
                
                var json = await app_import.json()

                console.log('Loaded bubble defaults')
                console.log(json)
        
                let sendImportData = {}
        
                if(!json.error_class) {
                    const app_styles  = json.styles
        
                    const app_option_sets = json.option_sets
        
                    const app_things = json.user_types
        
                    const app_apis = json.settings.client_safe.apiconnector2

                    const app_default_styles = json.settings.client_safe.default_styles;

                    const app_custom_fonts = json.settings.client_safe.font_tokens_user.default;

                    const app_custom_colors = json.settings.client_safe.color_tokens_user.default;
        
                    const app_background_workflows = json.api
        
                    const app_element_definitions = json.element_definitions
        
                    sendImportData = {"import": {
                        app_styles: app_styles,
                        app_option_sets: app_option_sets,
                        app_things: app_things,
                        app_apis: app_apis,
                        app_background_workflows: app_background_workflows,
                        app_element_definitions: app_element_definitions,
                        app_default_styles: app_default_styles,
                        app_custom_fonts: app_custom_fonts,
                        app_custom_colors: app_custom_colors,
                        app_paid: true,
                        app_imported_at: new Date().valueOf(),
                        appname: appname
                    }}
                } else {
                    sendImportData = {"import": {
                        app_styles: [],
                        app_option_sets: [],
                        app_things: [],
                        app_apis: [],
                        app_background_workflows: [],
                        app_element_definitions: [],
                        app_paid: false,
                        app_imported_at: new Date().valueOf(),
                        appname: appname
                    }}
                }

                related_assets = sendImportData;
        
                var local_storage_import_obj = {};
                
                local_storage_import_obj["bubble_" + appname + "_import"] = sendImportData;
        
                chrome.storage.local.set(local_storage_import_obj).then(() => {
                    console.log("Import is set to " + local_storage_import_obj);
                });
        
                handler.bubble.send(sendImportData);
            })

            function objectToArray(obj) {
                if (Object.keys(obj).length === 0 || Object.values(obj).includes(undefined)) {
                    return [];
                }
                return Object.entries(obj).map(([key, value]) => `${key}#copynocode#${JSON.stringify(value)}`);
            }
        },

        restore: function(data) {
            clipboard = changed;

            clipboard[message.data.copynocode.key] = data.content;
            let timestamp = Date.now();
            clipboard["_this_session_clipboard_" + data.key] = timestamp;
            
            changed = clipboard;
            
            localStorage.setItem("bubble_" + data.key + "_clipboard_", data.content)
            localStorage.setItem("_this_session_clipboard_bubble_" + data.key + "_clipboard_", timestamp)
        },

        send: function(data) {
            try{
                var send = {
                    "copynocode": data
                }
                console.log('sending data to bubble')
                console.log(send)
                var iframe_create = document.getElementById("copynocode-iframe-create");
                if(iframe_create != null) iframe_create.contentWindow.postMessage(send, "*");
        
                var iframe_update = document.getElementById("copynocode-iframe-update");
                if(iframe_update != null) iframe_update.contentWindow.postMessage(send, "*");
            } catch(e) {
                alert(e);
            }
        },

        listen: function() {
            let iframe_interfall = setInterval(function () {
                console.log('checking localstorage')

                changed = {
                    "bubble_element_clipboard": localStorage.getItem('bubble_element_clipboard'),
                    "_this_session_clipboard_bubble_element_clipboard": localStorage.getItem('_this_session_clipboard_bubble_element_clipboard'),
            
                    "bubble_element_with_workflows_clipboard": localStorage.getItem('bubble_element_with_workflows_clipboard'),
                    "_this_session_clipboard_bubble_element_with_workflows_clipboard": localStorage.getItem('_this_session_clipboard_bubble_element_with_workflows_clipboard'),
            
                    "bubble_action_clipboard": localStorage.getItem('bubble_action_clipboard'),
                    "_this_session_clipboard_bubble_action_clipboard": localStorage.getItem('_this_session_clipboard_bubble_action_clipboard'),
            
                    "bubble_type_clipboard": localStorage.getItem('bubble_type_clipboard'),
                    "_this_session_clipboard_bubble_type_clipboard": localStorage.getItem('_this_session_clipboard_bubble_type_clipboard'),
            
                    "bubble_style_clipboard": localStorage.getItem('bubble_style_clipboard'),
                    "_this_session_clipboard_bubble_style_clipboard": localStorage.getItem('_this_session_clipboard_bubble_style_clipboard'),
            
                    "bubble_apiconnector_clipboard": localStorage.getItem('bubble_apiconnector_clipboard'),
                    "_this_session_clipboard_bubble_apiconnector_clipboard": localStorage.getItem('_this_session_clipboard_bubble_apiconnector_clipboard'),
            
                    /*
                    "bubble_composer_expression_clipboard": localStorage.getItem('bubble_composer_expression_clipboard'),
                    "_this_session_clipboard_bubble_composer_expression_clipboard": localStorage.getItem('_this_session_clipboard_bubble_composer_expression_clipboard'),
            
                    "bubble_composer_clipboard": localStorage.getItem('bubble_composer_clipboard'),
                    "_this_session_clipboard_bubble_composer_clipboard": localStorage.getItem('_this_session_clipboard_bubble_composer_clipboard'),
            
                    "bubble_element_states_clipboard": localStorage.getItem('bubble_element_states_clipboard'),
                    "_this_session_clipboard_bubble_element_states_clipboard": localStorage.getItem('_this_session_clipboard_bubble_element_states_clipboard'),
                    */
                }
    
                if(JSON.stringify(clipboard) == JSON.stringify(changed)) {
                    // console.log('related assets' + JSON.stringify(related_assets));
                } else {
                    if(!related_assets) {
                        console.log('waiting for import')
                    } else {
                        console.log('Change found in localstorage')
    
                        $('#nocodecopy-btn.create').show();
                        
                        var sendData = {}
        
                        sendData['appname'] = appname;
        
                        var recentDateKey = getMostRecentKey(changed)
                        
                        var recentContentKey = recentDateKey.replace('_this_session_clipboard_bubble_', '')
        
                        sendData['type'] = recentContentKey.replace('_clipboard', '');
        
                        sendData['content'] = changed["bubble_" + recentContentKey];
        
                        if(DEBUG) console.log('CopyNoCode found ' + sendData['type'] + ' with ' + "bubble_" + recentContentKey)
        
                        extractData(sendData);
        
                        clipboard = changed;
                    }
                }
    
            }, 1000);

            function getMostRecentKey(json) {
                // get most recent key
                let mostRecentKey = null;
                let maxTimestamp = -1;
            
                for (let [key, value] of Object.entries(json)) {
                    if (key.startsWith('_this_session_clipboard_')) {
                        let timestamp = parseInt(value);
                        if (timestamp > maxTimestamp) {
                        maxTimestamp = timestamp;
                        mostRecentKey = key;
                        }
                    }
                }
            
                return mostRecentKey;
            }

            function extractData(sendData) {
                if(sendData['content']) {   
                    let content;
            
                    sendData['content_json'] = JSON.parse(sendData['content']);
                    switch (sendData['type']) {
                        case 'element':
                            content = sendData['content_json'];
                            if(sendData['content_json'][0]) {
                                sendData['kind'] = sendData['content_json'][0].type;
                                if(sendData['content_json'][0].name)
                                    sendData['name'] = sendData['content_json'][0].name;
                                else
                                    sendData['name'] = sendData['content_json'][0].default_name;
                            } else {
                                sendData['kind'] = sendData['content_json'].type;
                                sendData['name'] = sendData['content_json'].name;
            
                                content = sendData['content_json'];
                            }
                            break;
                        case 'element_with_workflows':
                            content = sendData['content_json'];
                            sendData['kind'] = sendData['content_json']['elements'][0].type;
                            if(sendData['content_json']['elements'][0].name)
                                sendData['name'] = sendData['content_json']['elements'][0].name;
                            else
                                sendData['name'] = sendData['content_json']['elements'][0].default_name;
                            break;
                        case 'type':
                            content = sendData['content_json'];
                            sendData['name'] = sendData['content_json'].display;
                            if(sendData['content_json'].fields)
                                sendData['kind'] = "thing"
                            else
                                sendData['kind'] = "optionset"
                            break;
                        case 'action':
                            content = sendData['content_json'];
                            sendData['name'] = "Backend workflow"
                            sendData['kind'] = "action"
                            break;
                        case 'apiconnector':
                            sendData['name'] = sendData['content_json'].pub.human
                            sendData['kind'] = "apiconnector"
                            break;
                        case 'style':
                            sendData['name'] = sendData['content_json'].display
                            sendData['kind'] = sendData['content_json'].type
                            break;
            
                    }
            
                    if(content) {
                        let related = elementGetRelated(content);
                        sendData['types_used'] = related.types
                        sendData['styles_used'] = related.styles
                        sendData['plugins_used'] = related.plugins
                        sendData['things_used'] = related.things
                        sendData['options_used'] = related.options
                        sendData['backend_workflows_used'] = related.backendworkflows
                        sendData['apis_used'] = related.apis
                        sendData['reusables_used'] = related.reusables
            
                        sendData['related_count'] = 0;
            
                        if (typeof sendData['styles_used'] !== 'undefined') {
                        sendData['related_count'] += sendData['styles_used'].length;
                        }
                        if (typeof sendData['plugins_used'] !== 'undefined') {
                        sendData['related_count'] += sendData['plugins_used'].length;
                        }
                        if (typeof sendData['things_used'] !== 'undefined') {
                        sendData['related_count'] += sendData['things_used'].length;
                        }
                        if (typeof sendData['options_used'] !== 'undefined') {
                        sendData['related_count'] += sendData['options_used'].length;
                        }
                        if (typeof sendData['backend_workflows_used'] !== 'undefined') {
                        sendData['related_count'] += sendData['backend_workflows_used'].length;
                        }
                        if (typeof sendData['apis_used'] !== 'undefined') {
                        sendData['related_count'] += sendData['apis_used'].length;
                        }
                        if (typeof sendData['reusables_used'] !== 'undefined') {
                        sendData['related_count'] += sendData['reusables_used'].length;
                        }
                    }

                    var local_storage_copy_obj = {};
                
                    local_storage_copy_obj["bubble_" + appname + "_copy"] = {"copied": sendData};
            
                    chrome.storage.local.set(local_storage_copy_obj).then(() => {
                        console.log("Copy is set to " + local_storage_copy_obj);
                    });
    
                    handler.bubble.send({"copied": sendData});
                }
            
                return sendData;
            }
            
            function elementGetRelated(json) {
                const customThings = new Set();
                const customOptions = new Set();
                const backendWorkflows = new Set();
                const ApiConnectors = new Set();
                const styles = new Set();
                const plugins = new Set();
                const types = new Array();
                const reusableElement = new Set();
            
                function checkForCustomValues(json, path, parent) {
                    let new_path = "";
                    if(path != "" && parent != "") new_path = path + '.' + parent;
                    else if(path == "" && parent != "") new_path = parent;
            
                    if(DEBUG) console.log('check path ' + new_path)
            
                    for (const [key, value] of Object.entries(json)) {
                        if (typeof value === 'string' && key == "type" && !new_path.includes('states') && !new_path.includes('properties') && !new_path.includes('actions')) {
                            if(value.includes('-')) {
                                plugins.add(value.split('-')[0]);
                                types.push(value.split('-')[0]);
                            } else types.push(value);
                            if(DEBUG) console.log('Type: ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && key == "style") {
                            if(related_assets.import.app_paid && related_assets.import.app_styles[value])
                                styles.add(createString('style', value, related_assets.import.app_styles[value].display, related_assets.import.app_styles[value]))
                            else
                                styles.add(value);
                            if(DEBUG) console.log('Style: ' + value + ' found')
                            console.log(related_assets.import.app_paid && related_assets.import.app_styles[value])
                            console.log(related_assets.import.app_styles[value])
                        }
                        
                        if (typeof value === 'string' && value.startsWith('custom.')) {
                            customThings.add(value.replace('custom.', ''));
                            if(DEBUG) console.log('Thing: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('list.custom.')) {
                            customThings.add(value.replace('list.custom.', ''));
                            if(DEBUG) console.log('Thing: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('option.')) {
                            customOptions.add(value.replace('option.', ''));
                            if(DEBUG) console.log('Option: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('list.option.')) {
                            customOptions.add(value.replace('list.option.', ''));
                            if(DEBUG) console.log('Option: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('apiconnector2-')) {
                            ApiConnectors.add(value.replace('apiconnector2-', '').split(".")[0]);
                            if(DEBUG) console.log('ApiConnector: ' + value + ' with value ' + value.replace('apiconnector2-', '').split(".")[0] + ' found')
                        }
                        
                        if (typeof value === 'string' && key == "api_event") {
                            backendWorkflows.add(value);
                            if(DEBUG) console.log('Backend Workflow: ' + value + ' found')
                        }
                        
                        if (key == "type" && value == "CustomElement" && json.properties && json.properties.custom_id) {
                            reusableElement.add(json.properties.custom_id);
                            if(DEBUG) console.log('Reusable element: ' + json.properties.custom_id + ' found')
                        }
                        
                        if (typeof value === 'object' && value !== null) {
                            checkForCustomValues(value, new_path, key);
                        }
                    }
                }
            
                checkForCustomValues(json, "", "");

                function createString(type, display, id, content) {
                    return type + "#copynocode#" + display + "#copynocode#" + id + "#copynocode#" + JSON.stringify(content)
                }
            
                return {types: types, styles: Array.from(styles), plugins: Array.from(plugins), things: Array.from(customThings), options: Array.from(customOptions), apis: Array.from(ApiConnectors), backendworkflows: Array.from(backendWorkflows), reusables: Array.from(reusableElement)};
            } 
        }
    }
}