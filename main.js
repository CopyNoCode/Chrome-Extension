// CONFIGURE
const copynocode_discover = "https://copynocode-test.bubbleapps.io/version-test/discover"
const copynocode_create = "https://copynocode-test.bubbleapps.io/version-test/create"
const copynocode_update = "https://copynocode-test.bubbleapps.io/version-test/create/{id}"
const copynocode_restore = "https://copynocode-test.bubbleapps.io/version-test/create/{id}"

// TODOs
// Add state (1)
// Convert import to strings (2)
// Add dialogue / modal (2)
// Change urls when restore (2)
// ADD fonts and colors // tokens font and tokens colors (2)
// Add restore for font and colors (2)
// Remove secure keys when copy apiconnector (1)
// Add secure without keys to apiconnector import (2)
// Filter default styles from used (1)
// count fields for things, listing (2)
// count properties for option sets, listing (2)
// count workflows, listing (2)

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
var app_info;

$(async function () {

    handler.general.create_ui(platform, appname);
    
});

var related_assets;

top.window.addEventListener("message", function(message) {

    if(message.data['copynocode_mode']) {

        handler.general.switchState('all', 'close');
        handler.general.switchState(message.data['copynocode_mode'].type, 'open', message.data['copynocode_mode']['id']);

    }

    if(message.data['copynocode_import']) {
        handler[platform].import();
    }

    if(message.data['copynocode_restore']) {
        if(DEBUG) console.log('Got Data from CopyNoCode' + JSON.stringify(message.data.copynocode));

        handler[platform].restore(message.data['copynocode_restore'])
    }

    if(message.data['copynocode_loaded']) {
        if(DEBUG) console.log('copynocode is loaded')

        handler[platform].get_app(appname);

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

                $("body").append(`<div id="copynocode-container-create" class="loading">
                    <div id="copynocode-icons">
                        <span class="show"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"><path fill-rule="evenodd" d="M13.28 3.97a.75.75 0 010 1.06L6.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6 0a.75.75 0 010 1.06L12.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clip-rule="evenodd" /></svg></span>
                        <span class="hide"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFF" class="w-6 h-6"> <path fill-rule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 010-1.06zm6 0a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg></span>
                        <span class="close"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FFF" class="w-6 h-6"> <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg></span>
                    </div>
                    <iframe id="copynocode-iframe-create" src="` + copynocode_create + `"></iframe>
                </div>`);

                $("body").append(`<div id="copynocode-container-update" class="loading">
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
                if(typeof importBubbleData === "object")  {
                    handler.bubble.send(importBubbleData);
                    $('#copynocode-btn.create').show();
                }
            });

        },

        get_app: async function(appname) {
            let app_response = await fetch("https://bubble.io/appeditor/get_app_plan", {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "content-type": "application/json"
                },
                "body": `{\"appname\":\"` + appname +`\",\"check_admin\":false}`,
                "method": "POST"
            });

            let app_json = await app_response.json();

            var user_response = await fetch("https://bubble.io/api/1.1/init/data?location=https%3A%2F%2Fbubble.io%2Faccount");
            var user_json = await user_response.json()
            var email = user_json[0].data.authentication.email.email

            if(app_json) {
                app_info = {
                    app_paid: app_json.export_app_json,
                    app_name: appname,
                    app_platform: "bubble"
                }
                handler.bubble.send({"app": app_info})
            } else {
                console.log('failed to get app info')
                console.log(app_json)
            }

            if(email)
                handler.bubble.send({"user": {
                    app_current_user: email
                }})
            else {
                console.log('failed to get current user')
                console.log(user_json)
            }
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

                    const app_default_font = json.settings.client_safe.font_tokens;

                    const app_default_colors = json.settings.client_safe.color_tokens;
        
                    const app_background_workflows = json.api
        
                    const app_element_definitions = json.element_definitions
        
                    sendImportData = {"import": {
                        app_styles: app_styles,
                        app_option_sets: app_option_sets,
                        app_things: app_things,
                        app_apis: app_apis,
                        app_background_workflows: replaceKeysWithId(app_background_workflows),
                        app_element_definitions: replaceKeysWithId(app_element_definitions),
                        app_default_styles: app_default_styles,
                        app_custom_fonts: app_custom_fonts,
                        app_default_font: app_default_font,
                        app_default_colors: app_default_colors,
                        app_custom_colors: app_custom_colors,
                        app_imported_at: new Date().valueOf(),
                    }}
                } else {
                    sendImportData = {"import": {
                        app_styles: [],
                        app_option_sets: [],
                        app_things: [],
                        app_apis: [],
                        app_background_workflows: [],
                        app_element_definitions: [],
                        app_imported_at: new Date().valueOf(),
                    }}
                }

                related_assets = sendImportData;
        
                var local_storage_import_obj = {};
                
                local_storage_import_obj["bubble_" + appname + "_import"] = sendImportData;
        
                chrome.storage.local.set(local_storage_import_obj).then(() => {
                    console.log("Import is set to " + local_storage_import_obj);
                });
        
                handler.bubble.send(sendImportData);

                function replaceKeysWithId(json) {
                    const newJson = {};
                    for (const key in json) {
                        if (json.hasOwnProperty(key) && json[key]) {
                            newJson[json[key].id] = json[key];
                        }
                    }
                    return newJson;
                }
            })

            function objectToArray(obj) {
                if (Object.keys(obj).length === 0 || Object.values(obj).includes(undefined)) {
                    return [];
                }
                return Object.entries(obj).map(([key, value]) => `${key}#copynocode#${JSON.stringify(value)}`);
            }
        },

        restore: function(data) {
            
            var restore = parseString(data);

            localStorage.setItem("bubble_" + restore.type + "_clipboard_", restore.content)
            localStorage.setItem("_this_session_clipboard_bubble_" + restore.type + "_clipboard_", new Date())

            function parseString(input) {
                const parts = input.split('#copynocode#');
                return {
                    type: parts[0],
                    kind: parts[1],
                    id: parts[2],
                    name: parts[3],
                    content: parts[4],
                };
            }
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
            
            console.log('listening for changes in local storage')

            top.window.addEventListener('storage', (event) => {
                if (!event.key) { return; }
                if (event.key.indexOf('global_clipboard_message_') != 0) { return; }
                if (!event.newValue) { return; }

                console.log('processing storage event ' + event.key)

                let json;
                try {
                    console.log('try to parse')
                    console.log(event)
                    if(event.newValue) json = JSON.parse(event.newValue);
                } catch (e) {
                    console.log('cant parse')
                }

                if(json.key && typeof json.data === "object") {
                    console.log('LocalStorage: data found')
                    console.log(json);

                    var sendData = {}

                    sendData['type'] = json.key.replace('bubble_', '').replace('_clipboard', '')
                    sendData['data'] = JSON.stringify(json.data);

                    $('#copynocode-btn.create').show();

                    sendData['appname'] = appname;

                    extractData(sendData);
                } else console.log('LocalStorage: no data found')
            })

            function extractData(sendData) {
                if(sendData['data']) {   
                    let content;
            
                    sendData['content_json'] = JSON.parse(sendData['data']);
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

                            if(sendData['content_json'].id) sendData['id'] = sendData['content_json'].id
                            if(sendData['content_json'][0] && sendData['content_json'][0].id) sendData['id'] = sendData['content_json'][0].id
                            break;
                        case 'element_with_workflows':
                            content = sendData['content_json'];
                            sendData['kind'] = sendData['content_json']['elements'][0].type;

                            if(sendData['content_json']['elements'][0].name)
                                sendData['name'] = sendData['content_json']['elements'][0].name;
                            else
                                sendData['name'] = sendData['content_json']['elements'][0].default_name;

                            if(sendData['content_json']['elements'][0].id) sendData['id'] = sendData['content_json']['elements'][0].id
                            break;
                        case 'type':
                            content = sendData['content_json'];
                            sendData['name'] = sendData['content_json'].display;
                            sendData['id'] = sendData['content_json'].name;
                            if(sendData['content_json'].fields)
                                sendData['kind'] = "db"
                            else
                                sendData['kind'] = "option-set"
                            break;
                        case 'action':
                            content = sendData['content_json'];
                            if(sendData['content_json'].data.properties && sendData['content_json'].data.properties.wf_name) {
                                sendData['name'] = sendData['content_json'].data.properties.wf_name;
                                sendData['id'] = sendData['content_json'].data.id;
                                sendData['kind'] = "backend-workflow"
                            } else if(sendData['content_json'].data.type) {
                                sendData['name'] = sendData['content_json'].data.type;
                                sendData['id'] = sendData['content_json'].data.id;
                                sendData['kind'] = "workflow"
                            }
                            break;
                        case 'apiconnector':
                            sendData['name'] = sendData['content_json'].pub.human
                            sendData['id'] = sendData['content_json'].pub.id
                            sendData['kind'] = "apiconnector"
                            sendData['content_json'].sec
                            break;
                        case 'style':
                            sendData['name'] = sendData['content_json'].display
                            sendData['kind'] = sendData['content_json'].type
                            sendData['id'] = sendData['content_json'].id;
                            break;
            
                    }

                    sendData['content'] = createString(sendData['type'], sendData['kind'], sendData['id'], sendData['name'], sendData['content_json'])
            
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
                                let plugin_id = value.split('-')[0];
                                var name = "unknown"

                                function getTitle(pluginId) {
                                    try {
                                        const xhr = new XMLHttpRequest();
                                        xhr.open('GET', `https://bubble.io/api/1.1/init/data?location=https%3A%2F%2Fbubble.io%2Fplugin%2F${pluginId}`, false);
                                        xhr.send();
                                        if (xhr.status === 200) {
                                        const data = JSON.parse(xhr.responseText);
                                        console.log(data);
                                        return data[1].data.name_text + " (" +(data[1].data.licence_text == "commercial" ? "paid" : "free" ) + ")";
                                        }
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }

                                name = getTitle(plugin_id);

                                plugins.add(createString('plugin', 'plugin', plugin_id, name, plugin_id));
                                
                                types.push(plugin_id);
                            } else types.push(value);
                            if(DEBUG) console.log('Type: ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && key == "style") {
                            if(app_info.app_paid && related_assets.import.app_styles[value])
                                styles.add(createString('style', 'style', value, related_assets.import.app_styles[value].display, related_assets.import.app_styles[value]))
                            else
                                styles.add(createString('style', 'style', value, 'unknown', 'empty'))

                            if(DEBUG) console.log('Style: ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('custom.')) {
                            let thing_id = value.replace('custom.', '')
                            if(app_info.app_paid && related_assets.import.app_things[thing_id])
                                customThings.add(createString('type', 'db', thing_id, related_assets.import.app_things[thing_id].display, related_assets.import.app_things[thing_id]))
                            else
                                customThings.add(createString('type', 'db', thing_id, 'unknown', 'empty'))
 
                            if(DEBUG) console.log('Thing: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('list.custom.')) {
                            let thing_id = value.replace('list.custom.', '')
                            if(app_info.app_paid && related_assets.import.app_things[thing_id])
                                customThings.add(createString('type', 'db', thing_id, related_assets.import.app_things[thing_id].display, related_assets.import.app_things[thing_id]))
                            else
                                customThings.add(createString('type', 'db', thing_id, 'unknown', 'empty'))
 
                            if(DEBUG) console.log('Thing: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('option.')) {
                            let option_id = value.replace('option.', '')
                            if(app_info.app_paid && related_assets.import.app_option_sets[option_id])
                                customOptions.add(createString('type', 'option-set', option_id, related_assets.import.app_option_sets[option_id].display, related_assets.import.app_option_sets[option_id]))
                            else
                                customOptions.add(createString('type', 'option-set', option_id, 'unknown', 'empty'))

                            if(DEBUG) console.log('Option: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('list.option.')) {

                            let option_id = value.replace('list.option.', '')
                            if(app_info.app_paid && related_assets.import.app_option_sets[option_id])
                                customOptions.add(createString('type', 'option-set', option_id, related_assets.import.app_option_sets[option_id].display, related_assets.import.app_option_sets[option_id]))
                            else
                                customOptions.add(createString('type', 'option-set', option_id, 'unknown', 'empty'))

                            if(DEBUG) console.log('Option: ' + key + ' with value ' + value + ' found')
                        }
                        
                        if (typeof value === 'string' && value.startsWith('apiconnector2-')) {
                            let api_id = value.replace('apiconnector2-', '').split(".")[0]
                            if(app_info.app_paid && related_assets.import.app_apis[api_id])
                                ApiConnectors.add(createString('apiconnector', 'apiconnector', api_id, related_assets.import.app_apis[api_id].human, {pub: related_assets.import.app_apis[api_id]}))
                            else
                                ApiConnectors.add(createString('apiconnector', 'apiconnector', api_id, 'unknown', 'empty'))

                            if(DEBUG) console.log('Option: ' + key + ' with value ' + value + ' found')

                            if(DEBUG) console.log('ApiConnector: ' + value + ' with value ' + api_id + ' found')
                        }
                        
                        if (typeof value === 'string' && key == "api_event") {
                            if(app_info.app_paid && related_assets.import.app_background_workflows[value])
                                backendWorkflows.add(createString('action', 'backend-workflow', value, related_assets.import.app_background_workflows[value].properties.wf_name, {data: related_assets.import.app_background_workflows[value], is_action: false, page: "api", token_width: 140}))
                            else
                                backendWorkflows.add(createString('action', 'backend-workflow', value, 'unknown', 'empty'))
                                
                            if(DEBUG) console.log('Backend Workflow: ' + value + ' found')
                        }
                        
                        if (key == "type" && value == "CustomElement" && json.properties && json.properties.custom_id) {
                            let element_id = json.properties.custom_id;
                            if(app_info.app_paid && related_assets.import.app_element_definitions[element_id]) {
                                reusableElement.add(createString('element', 'reusable-element', element_id, related_assets.import.app_element_definitions[element_id].name, related_assets.import.app_element_definitions[element_id]))
                                checkForCustomValues(related_assets.import.app_element_definitions[element_id], new_path, element_id);
                            } else
                                reusableElement.add(createString('element', 'reusable-element', element_id, 'unknown', 'empty'))
                            
                            if(DEBUG) console.log('Reusable element: ' + json.properties.custom_id + ' found')
                        }
                        
                        if (typeof value === 'object' && value !== null) {
                            checkForCustomValues(value, new_path, key);
                        }
                    }
                }
            
                checkForCustomValues(json, "", "");
            
                return {types: types, styles: Array.from(styles), plugins: Array.from(plugins), things: Array.from(customThings), options: Array.from(customOptions), apis: Array.from(ApiConnectors), backendworkflows: Array.from(backendWorkflows), reusables: Array.from(reusableElement)};
            }
            
            function createString(type, kind, id, display, content) {
                return type + "#copynocode#" + kind + "#copynocode#" + display + "#copynocode#" + id + "#copynocode#" + JSON.stringify(content)
            }
        }
    }
}