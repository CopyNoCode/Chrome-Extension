// COPYRIGHTED BY CopyNoCode

// CONFIGURE
const copynocode_discover = "https://copynocode-test.bubbleapps.io/version-test/discover"
const copynocode_create = "https://copynocode-test.bubbleapps.io/version-test/create"
const copynocode_update = "https://copynocode-test.bubbleapps.io/version-test/update/{id}"
const copynocode_restore = "https://copynocode-test.bubbleapps.io/version-test/restore/{id}"

// TODOs
// Restore plugins should open dialogue
// Automate restoring related assets (see https://gist.github.com/kayamy/cb04498c3f5c9188f0d6068f5f5006a0)
// Add elementGetRelated to worker and listen to result before pushing to bubble plugin
// ADD fonts and colors to related assets // tokens font and tokens colors (2)
// ADD restore for font and colors (and navigate) (1)
// REMOVE secure keys when copy apiconnector (1)
// ADD secure without keys to apiconnector import (2)

/* FLOW

Start
1. Create discover, create, update and restore elements
2. STATE = LOADING (on load create iframe)
3. Detect PLATFORM & appname
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

const DEBUG = false;
const DEBUG_DATA = false;

// get appname
var url = new URL(window.location.href);
const APPNAME = url.searchParams.get('id');
const PLATFORM = "bubble";
var APP_INFO;
var STATE;
var NOTYF;

$(async function () {

    handler.general.create_ui();
    
});

var related_assets = {
    app_styles: {},
    app_option_sets: {},
    app_dbs: {},
    app_api_connectors: {},
    app_background_workflows: {},
    app_reusable_elements: {},
    app_default_styles: {},
    app_custom_fonts: {},
    app_custom_colors: {},
    app_default_font: {},
    app_default_colors: {}
}

top.window.addEventListener("message", function(message) {

    if(message.data['copynocode_mode']) {

        handler.general.switchState('all', 'close');
        handler.general.switchState(message.data['copynocode_mode'].type, message.data['copynocode_mode'].state, message.data['copynocode_mode']['id']);

    }

    if(message.data['copynocode_import']) {
        handler[PLATFORM].import();
    }

    if(message.data['copynocode_restore']) {
        if(DEBUG) {
            logMessage('notice', 'CopyNoCode: Got Data from CopyNoCode');
            console.log(message.data['copynocode_restore'])
        }

        handler[PLATFORM].restore(message.data['copynocode_restore'])
    }

    if(message.data['copynocode_loaded']) {
        if(DEBUG) {
            logMessage('event', 'CopyNoCode: Loaded');
        }

        handler[PLATFORM].state('LOADING');

        handler[PLATFORM].get_user();

        handler[PLATFORM].restore_cache();

        handler[PLATFORM].import();

        handler[PLATFORM].listen();

        handler[PLATFORM].state('READY');
    }

    if(message.data['copynocode_notification_success']) {
        NOTYF.success(message.data['copynocode_notification_success'])
    }
});

var handler = {
    "general": {
        create_ui: function() {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = chrome.runtime.getURL("style.css");
            document.head.appendChild(link);

            var link_notif_css = document.createElement('link')
            link_notif_css.rel = 'stylesheet'
            link_notif_css.href = chrome.runtime.getURL("notyf.min.css");
            document.head.appendChild(link_notif_css)

            var link_notif_js = document.createElement('script')
            link_notif_js.src = chrome.runtime.getURL("notyf.min.js");
            document.head.appendChild(link_notif_js)

            // Create an instance of Notyf
            NOTYF = new Notyf({
                duration: 3000,
                position: {x:'center', y:'top'},
                dismissible: true
            });

            if(DEBUG) {
                logMessage('notice', 'CopyNoCode: Creating UI');
            }
            
            let copynocodeui = setInterval(function () {
                if ($(".main-tab-bar").length) {
                    clearInterval(copynocodeui);
                    $(".main-tab-bar").append('<div class="tab discover" id="copynocode-btn"><img id="copynocode-icon" src="https://s3.amazonaws.com/appforest_uf/f1672312679295x617020231160427600/copynocode-icon.png" width=21 height=21><span>Discover</span></div>');
                    $(".main-tab-bar").append('<div class="tab create" id="copynocode-btn"><img id="copynocode-icon" src="https://s3.amazonaws.com/appforest_uf/f1672312679295x617020231160427600/copynocode-icon.png" width=21 height=21><span>Create</span></div>');
                }

                $("body").append(`<div id="copynocode-container-discover" class="loading">
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

                let create_loaded = false
                let update_loaded = false
                let discover_loaded = false

                $('#copynocode-iframe-create').on('load', function() {

                    if(create_loaded) top.window.postMessage({"copynocode_loaded": true}, "*")
                    
                    if(!create_loaded) {
                        handler.general.switchState('create', 'close')
                        $('#copynocode-container-create').removeClass('loading')
                    }
                    
                    create_loaded = true
                })

                $('#copynocode-iframe-update').on('load', function() {

                    if(update_loaded) top.window.postMessage({"copynocode_loaded": true}, "*")
                    
                    if(!update_loaded) {
                        handler.general.switchState('update', 'close')
                        $('#copynocode-container-update').removeClass('loading')
                    }
                    
                    update_loaded = true
                })

                $('#copynocode-iframe-discover').on('load', function() {

                    if(discover_loaded) top.window.postMessage({"copynocode_loaded": true}, "*")
                    
                    if(!discover_loaded) {
                        handler.general.switchState('discover', 'close')
                        $('#copynocode-container-discover').removeClass('loading')
                    }
                    
                    discover_loaded = true
                })

                let intervalId = setInterval(function() {
                    if (create_loaded && update_loaded && discover_loaded) {
                      top.window.postMessage({"copynocode_loaded": true}, "*")
                      clearInterval(intervalId)
                    }
                }, 500)
                
                handler.general.switchState('restore', 'close')

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
            if(DEBUG) {
                logMessage('info', 'CopyNoCode: Switch Mode');
                console.log({
                    mode: mode,
                    state: state,
                    id: id
                })
            }

            if(state == "show" || state == "open") {
                $('#copynocode-icons .hide').show();
                $('#copynocode-icons .show').hide();

                if(mode == "update") {
                    if(id != "") $('#copynocode-iframe-update').attr('src', copynocode_update.replace("{id}", id))
                    else $('#copynocode-iframe-update').attr('src', copynocode_update.replace("{id}", "404"))
                }
                
                if(mode == "restore") {
                    if(id != "") $('#copynocode-iframe-restore').attr('src', copynocode_restore.replace("{id}", id))
                    else $('#copynocode-iframe-restore').attr('src', copynocode_restore.replace("{id}", "404"))
                }

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
            
        }
    },

    "bubble": {

        restore_cache: function() {

            chrome.storage.local.get(['bubble_' + APPNAME + "_import"]).then((data) => {
                if(DEBUG) {
                    logMessage('notice', 'CopyNoCode: Restore import from cache');
                    console.log(data)
                }
                let importBubbleData = data['bubble_' + APPNAME + "_import"];
                if(typeof importBubbleData != {}) handler.bubble.send('import (cache)', importBubbleData);
            });

            chrome.storage.local.get(['bubble_' + APPNAME + "_related"]).then((data) => {
                if(DEBUG) {
                    logMessage('notice', 'CopyNoCode: Restore related from cache');
                    console.log(data)
                }
                let relatedBubbleData = data['bubble_' + APPNAME + "_related"];
                if(typeof relatedBubbleData != {}) related_assets = relatedBubbleData;
            });

            chrome.storage.local.get(['bubble_' + APPNAME + "_copy"]).then((data) => {
                if(DEBUG) {
                    logMessage('notice', 'CopyNoCode: Restore copy from cache');
                    console.log(data)
                }
                let copyBubbleData = data['bubble_' + APPNAME + "_copy"];
                if(copyBubbleData != {})  {
                    handler.bubble.send('copy (cache)', copyBubbleData);
                    $('#copynocode-btn.create').show();
                }
            });

        },

        get_user: async function() {
            var user_response = await fetch("https://bubble.io/api/1.1/init/data?location=https%3A%2F%2Fbubble.io%2Faccount");
            var user_json = await user_response.json()
            var email = user_json[0].data.authentication.email.email

            if(email)
                handler.bubble.send('user', {"user": {
                    email: email
                }})
            else {
                if(DEBUG) {
                    logMessage('error', 'CopyNoCode: Failed to get current user');
                    console.log(user_json)
                }
            }
        },

        import: async function() {
            // handler[PLATFORM].state('LOADING');

            let senddata = setInterval(async function () {
                clearInterval(senddata);
        
                var app_import = await fetch('https://bubble.io/appeditor/export/test/' + APPNAME + '.bubble')
                
                var json = await app_import.json()

                if(DEBUG) {
                    logMessage('notice', 'CopyNoCode: Import (refresh) of data');
                    console.log(json)
                }
        
                let sendImportData = {}
        
                if(!json.error_class) {

                    APP_INFO = {
                        paid: true,
                        name: APPNAME,
                        platform: "bubble"
                    }
                    handler.bubble.send('app', {"app": APP_INFO})

                    const app_styles  = json.styles
        
                    const app_option_sets = json.option_sets
        
                    const app_dbs = json.user_types
        
                    const app_api_connectors = json.settings.client_safe.apiconnector2

                    const app_default_styles = json.settings.client_safe.default_styles;

                    const app_custom_fonts = (json.settings.client_safe.font_tokens_user && json.settings.client_safe.font_tokens_user.default ? json.settings.client_safe.font_tokens_user.default : {});

                    const app_custom_colors = (json.settings.client_safe.color_tokens_user && json.settings.client_safe.color_tokens_user.default ? json.settings.client_safe.color_tokens_user.default : {});

                    const app_default_font = (json.settings.client_safe.font_tokens && json.settings.client_safe.font_tokens ? json.settings.client_safe.font_tokens : {
                        "default": "Lato"
                    })

                    const app_default_colors = (json.settings.client_safe.color_tokens ? json.settings.client_safe.color_tokens : {
                        "alert": {
                            "default": "rgba(250, 181, 21, 1)"
                        },
                        "background": {
                            "default": "rgba(255, 255, 255, 0)"
                        },
                        "destructive": {
                            "default": "rgba(255, 0, 0, 1)"
                        },
                        "primary": {
                            "default": "rgba(53,55,226,1)"
                        },
                        "primary_contrast": {
                            "default": "rgba(255, 255, 255, 1)"
                        },
                        "success": {
                            "default": "rgba(23, 219, 78, 1)"
                        },
                        "surface": {
                            "default": "rgba(255, 255, 255, 1)"
                        },
                        "text": {
                            "default": "rgba(9, 23, 71, 1)"
                        }
                    });

                    const app_background_workflows = json.api
        
                    const app_reusable_elements = json.element_definitions

                    related_assets = {
                        app_styles: app_styles,
                        app_option_sets: app_option_sets,
                        app_dbs: app_dbs,
                        app_api_connectors: app_api_connectors,
                        app_background_workflows: replaceKeysWithId(app_background_workflows),
                        app_reusable_elements: replaceKeysWithId(app_reusable_elements),
                        app_custom_fonts: app_custom_fonts,
                        app_custom_colors: app_custom_colors,
                        app_default_styles: app_default_styles,
                        app_default_font: app_default_font,
                        app_default_colors: app_default_colors
                    }

                    if(DEBUG) {
                        logMessage('info', 'CopyNoCode: Related assets set to:');
                        console.log(related_assets)
                    }
        
                    sendImportData = {"import": {
                        app_styles: objectToStrings('styles', app_styles),
                        app_option_sets: objectToStrings('option-sets', app_option_sets),
                        app_dbs: objectToStrings('dbs', app_dbs),
                        app_api_connectors: objectToStrings('api-connectors', app_api_connectors),
                        app_background_workflows: objectToStrings('background-workflows', replaceKeysWithId(app_background_workflows)),
                        app_reusable_elements: objectToStrings('reusable-elements', replaceKeysWithId(app_reusable_elements)),
                        app_custom_fonts: objectToStrings('custom_fonts', app_custom_fonts),
                        app_custom_colors: objectToStrings('custom_colors', app_custom_colors),
                        app_default_styles: objectToStrings('default_styles', app_default_styles),
                        app_default_font: objectToStrings('default_font', app_default_font),
                        app_default_colors: objectToStrings('default_colors', app_default_colors),
                        app_imported_at: new Date().valueOf()
                    }}
                } else {
                    APP_INFO = {
                        paid: false,
                        name: APPNAME,
                        platform: "bubble"
                    }

                    handler.bubble.send('app', {"app": APP_INFO})

                    sendImportData = {"import": {
                        related_assets
                    }}
                }
        
                var local_storage_import_obj = {};
                
                local_storage_import_obj["bubble_" + APPNAME + "_import"] = sendImportData;
        
                chrome.storage.local.set(local_storage_import_obj).then(() => {
                    if(DEBUG) {
                        logMessage('info', 'CopyNoCode: Import (cache) set to');
                        console.log(local_storage_import_obj)
                    }
                });

                var local_storage_related_obj = {};
                
                local_storage_related_obj["bubble_" + APPNAME + "_related"] = related_assets;
        
                chrome.storage.local.set(local_storage_related_obj).then(() => {
                    if(DEBUG) {
                        logMessage('info', 'CopyNoCode: Related (cache) set to:');
                        console.log(related_assets)
                    }
                });
        
                handler.bubble.send('import (refresh)', sendImportData);

                // handler[PLATFORM].state('READY');

                function objectToStrings(type, obj) {
                    switch(type) {
                        case 'styles':
                            return Object.entries(obj).map(([key, value]) => `style#copynocode#style#copynocode#${key}#copynocode#${value.display}#copynocode#${JSON.stringify(value)}`);
                        case 'dbs':
                            return Object.entries(obj).map(([key, value]) => {
                                let db = value;
                                db.name = key;
                                return `type#copynocode#db#copynocode#${key}#copynocode#${value.display}#copynocode#${JSON.stringify(db)}`;
                            });
                        case 'option-sets':
                            return Object.entries(obj).map(([key, value]) => {
                                let option_set = value;
                                option_set.name = key;
                                return `type#copynocode#option-set#copynocode#${key}#copynocode#${value.display}#copynocode#${JSON.stringify(option_set)}`;
                            });
                        case 'api-connectors':
                            return Object.entries(obj).map(([key, value]) => `apiconnector#copynocode#apiconnector#copynocode#${key}#copynocode#${value.human}#copynocode#${JSON.stringify({pub: value})}`);
                        case 'background-workflows':
                            return Object.entries(obj).map(([key, value]) => `action#copynocode#background-workflows#copynocode#${key}#copynocode#${value.properties.wf_name}#copynocode#${JSON.stringify({data: value, is_action: false, page: "api", token_width: 140})}`);
                        case 'reusable-elements':
                            return Object.entries(obj).map(([key, value]) => `element#copynocode#reusable-element#copynocode#${key}#copynocode#${value.name}#copynocode#${JSON.stringify(value)}`);
                        default:
                            // TODO fix other types
                            if(DEBUG) {
                                logMessage('error', 'CopyNoCode: Missing ' + type + ' to convert to string');
                                console.log(obj)
                            }
                    }
                }

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
        },

        restore: function(data) {

            handler[PLATFORM].state('LOADING');
            
            var restore = parseString(data);

            if(DEBUG) {
                logMessage('info', 'CopyNoCode: restoring');
                console.log(restore)
            }

            localStorage.setItem("bubble_" + restore.type + "_clipboard", restore.content)
            localStorage.setItem("_this_session_clipboard_bubble_" + restore.type + "_clipboard", new Date())
            
            switch (restore.type) {
                case 'element':
                case 'element_with_workflow':
                    $('.tabs-1').click();
                    NOTYF.success(restore.kind + ' to your clipboard');
                    break;
                case 'type':
                    $('.tabs-3').click();
                    if(restore.kind == "option-set") $('.tab-caption.option.sets').click();
                    NOTYF.success(restore.kind + ' to your clipboard');
                    break;
                case 'style':
                    $('.tabs-4').click();
                    NOTYF.success(restore.kind + ' to your clipboard');
                    break;
                case 'plugin':
                    $('.tabs-5').click();
                    NOTYF.success(restore.kind + ' to your clipboard');
                    break;
                case 'apiconnector':
                    $('.tabs-5').click();
                    NOTYF.success(restore.kind + ' to your clipboard');
                    break;
                case 'action':
                    if(APP_INFO.paid) {
                        $('.context-menu-item.backend_workflows').click();
                        NOTYF.success(restore.kind + ' to your clipboard');
                    } else NOTYF.error('You need to be on a paid plan to use Backend Workflows')
                    break;
            }

            handler[PLATFORM].state('READY');

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

        send: function(display, data) {
            try{
                var send = {
                    "copynocode": data
                }
                if(DEBUG) {
                    logMessage('notice', 'CopyNoCode: Send ' + display + ' to CopyNoCode');
                    console.log(send)
                }
                var iframe_create = document.getElementById("copynocode-iframe-create");
                if(iframe_create != null) iframe_create.contentWindow.postMessage(send, "*");
        
                var iframe_update = document.getElementById("copynocode-iframe-update");
                if(iframe_update != null) iframe_update.contentWindow.postMessage(send, "*");

                var iframe_discover = document.getElementById("copynocode-iframe-discover");
                if(iframe_discover != null) iframe_discover.contentWindow.postMessage(send, "*");
            } catch(e) {
                alert(e);
            }
        },

        listen: function() {
            top.window.addEventListener('storage', handleListenEvent)

            async function handleListenEvent(event) {
                if (!event.key) { return; }
                if (event.key.indexOf('global_clipboard_message_') != 0) { return; }
                if (!event.newValue) { return; }

                if(DEBUG) {
                    logMessage('event', 'CopyNoCode: LocalStorage changed for ' + event.key);
                }

                let json;
                try {
                    if(event.newValue) json = JSON.parse(event.newValue);
                } catch (e) {
                    if(DEBUG) {
                        logMessage('error', "CopyNoCode: Can't parse localstorage for " + event.key);
                    }
                }

                if(json.key && typeof json.data === "object") {
                    if(DEBUG) {
                        logMessage('event', 'CopyNoCode: LocalStorage data found');
                        console.log(json)
                    }

                    handler[PLATFORM].state('LOADING');

                    var sendData = {}

                    sendData['type'] = json.key.replace('bubble_', '').replace('_clipboard', '')
                    sendData['data'] = JSON.stringify(json.data);

                    $('#copynocode-btn.create').show();

                    await handler.bubble.send('copy (refresh)', {"copy": sendData});

                    await handler[PLATFORM].state('READY');

                    extractData(sendData);
                } else {
                    if(DEBUG) {
                        logMessage('error', 'CopyNoCode: LocalStorage no data found');
                    }
                }
            }

            async function extractData(sendData) {
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
                        sendData['related_styles'] = related.styles
                        sendData['related_plugins'] = related.plugins
                        sendData['related_dbs'] = related.dbs
                        sendData['related_option_sets'] = related.option_sets
                        sendData['related_backend_workflows'] = related.background_workflows
                        sendData['related_api_connectors'] = related.api_connectors
                        sendData['related_reusable_elements'] = related.reusable_elements

                        sendData['related_fonts'] = []

                        sendData['related_colors'] = []
            
                        sendData['related_count'] = 0;
            
                        if (typeof sendData['related_styles'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_styles'].length;
                        }
                        if (typeof sendData['related_plugins'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_plugins'].length;
                        }
                        if (typeof sendData['related_dbs'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_dbs'].length;
                        }
                        if (typeof sendData['related_option_sets'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_option_sets'].length;
                        }
                        if (typeof sendData['related_backend_workflows'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_backend_workflows'].length;
                        }
                        if (typeof sendData['related_api_connectors'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_api_connectors'].length;
                        }
                        if (typeof sendData['related_reusable_elements'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_reusable_elements'].length;
                        }
                        if (typeof sendData['related_fonts'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_fonts'].length;
                        }
                        if (typeof sendData['related_colors'] !== 'undefined') {
                        sendData['related_count'] += sendData['related_colors'].length;
                        }

                        sendData['stats_element_types'] = related.element_types;
                        sendData['stats_element_types_count'] = related.element_types.length;

                        sendData['stats_element_types_unique'] = related.element_types_unique;
                        sendData['stats_element_types_unique_count'] = related.element_types_unique.length;

                        sendData['stats_workflows'] = related.workflows;
                        sendData['stats_workflows_count'] = related.workflows.length;

                        sendData['stats_db_fields'] = related.db_fields;
                        sendData['stats_db_fields_count'] = related.db_fields.length;

                        sendData['stats_option_set_attributes'] = related.option_set_attributes;
                        sendData['stats_option_set_attributes_count'] = related.option_set_attributes.length;
                    }

                    var local_storage_copy_obj = {};
                
                    local_storage_copy_obj["bubble_" + APPNAME + "_copy"] = {"copy": sendData};
            
                    chrome.storage.local.set(local_storage_copy_obj).then(() => {
                        if(DEBUG) {
                            logMessage('event', 'CopyNoCode: Copy cache set to');
                            console.log(local_storage_copy_obj)
                        }
                    });
    
                    handler.bubble.send('copy (refresh)', {"copy": sendData});

                    handler[PLATFORM].state('READY');
                }
            
                return sendData;
            }
            
            function elementGetRelated(json) {
                const dbs = new Set();
                const option_sets = new Set();
                const backend_workflows = new Set();
                const api_connectors = new Set();
                const styles = new Set();
                const plugins = new Set();
                const element_types = new Array();
                const element_types_unique = new Set();
                const reusable_elements = new Set();
                const workflows = new Set();
                const db_fields = new Set();
                const option_set_attributes = new Set();
                const fonts = new Set();
                const colors = new Set();
                const ids = new Set();
                const recursive_ids = new Set();
            
                function checkForCustomValues(json, path, parent) {
                    let new_path = "";
                    if(path != "" && parent != "") new_path = path + '.' + parent;
                    else if(path == "" && parent != "") new_path = parent;

                    if(DEBUG_DATA) {
                        logMessage('info', 'CopyNoCode: Check path ' + new_path);
                        console.log(json)
                    }
            
                    for (const [key, value] of Object.entries(json)) {
                        if (parent == "workflows") {
                            workflows.add(value.id)
                        }

                        // PLUGIN
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
                                        if(DEBUG_DATA) {
                                            logMessage('info', 'CopyNoCode: Plugin data');
                                            console.log(data)
                                        }
                                        return data[1].data.name_text + " (" +(data[1].data.licence_text == "commercial" ? "paid" : "free" ) + ")";
                                        }
                                    } catch (error) {
                                        if(DEBUG_DATA) {
                                            logMessage('error', 'CopyNoCode: Cant get plugin details of ' + pluginId);
                                        }
                                    }
                                }

                                name = getTitle(plugin_id);

                                plugins.add(createString('plugin', 'plugin', plugin_id, name, plugin_id));
                                
                                element_types.push(plugin_id);
                                element_types_unique.add(plugin_id);
                            } else {
                                element_types.push(value);
                                element_types_unique.add(value);
                            }

                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: Type found' + value);
                            }
                        }
                        
                        // STYLE
                        if (typeof value === 'string' && key == "style") {
                            if(APP_INFO.paid && related_assets.app_styles[value])
                                styles.add(createString('style', 'style', value, related_assets.app_styles[value].display, related_assets.app_styles[value]))
                            else if(!APP_INFO.paid)
                                styles.add(createString('style', 'style', value, 'unknown', 'empty'))

                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: Style found' + value);
                            }
                        }
                        
                        // DB
                        if (typeof value === 'string' && value.startsWith('custom.')) {
                            let thing_id = value.replace('custom.', '')
                            if(APP_INFO.paid && related_assets.app_dbs[thing_id]) {
                                var thing = related_assets.app_dbs[thing_id]
                                thing.name = thing_id;
                                dbs.add(createString('type', 'db', thing_id, related_assets.app_dbs[thing_id].display, thing))
                                let fields = []
                                try { fields = Object.keys(related_assets.app_dbs[thing_id].fields).map(f => thing_id + "." + f) } catch(e) {if(DEBUG) {logMessage('error', 'CopyNoCode: Cant extract fields from db ' + thing_id); console.log(related_assets.app_dbs[thing_id])}}
                                fields.forEach(item => db_fields.add(item))
                            } else if(!APP_INFO.paid)
                                dbs.add(createString('type', 'db', thing_id, 'unknown', 'empty'))
 
                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: DB found' + value);
                            }
                        }
                        
                        // DB
                        if (typeof value === 'string' && value.startsWith('list.custom.')) {
                            let thing_id = value.replace('list.custom.', '')
                            if(APP_INFO.paid && related_assets.app_dbs[thing_id]) {
                                var thing = related_assets.app_dbs[thing_id]
                                thing.name = thing_id;
                                dbs.add(createString('type', 'db', thing_id, related_assets.app_dbs[thing_id].display, thing))
                                let fields = []
                                try { fields = Object.keys(related_assets.app_dbs[thing_id].fields.map(f => thing_id + "." + f)) } catch(e) {if(DEBUG) {logMessage('error', 'CopyNoCode: Cant extract fields from db ' + thing_id); console.log(related_assets.app_dbs[thing_id])}}
                                fields.forEach(item => db_fields.add(item))
                            } else if(!APP_INFO.paid)
                                dbs.add(createString('type', 'db', thing_id, 'unknown', 'empty'))

                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: Option Set found' + value);
                            }
                        }
                        
                        // OPTION SET
                        if (typeof value === 'string' && value.startsWith('option.')) {
                            let option_id = value.replace('option.', '')
                            if(APP_INFO.paid && related_assets.app_option_sets[option_id]) {
                                var option = related_assets.app_option_sets[option_id]
                                option.name = option_id;
                                option_sets.add(createString('type', 'option-set', option_id, related_assets.app_option_sets[option_id].display, option))
                                let attributes = []
                                if(related_assets.app_option_sets[option_id].attributes) {
                                    try { attributes = Object.keys(related_assets.app_option_sets[option_id].attributes).map(a => option_id + "." + a) } catch(e) {if(DEBUG) {logMessage('error', 'CopyNoCode: Cant extract values from option sets ' + option_id); console.log(related_assets.app_option_sets[option_id])}}
                                    attributes.forEach(item => option_set_attributes.add(item))
                                }
                            } else if(!APP_INFO.paid)
                                option_sets.add(createString('type', 'option-set', option_id, 'unknown', 'empty'))

                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: Option Set found' + value);
                            }
                        }
                        
                        // OPTION SET
                        if (typeof value === 'string' && value.startsWith('list.option.')) {

                            let option_id = value.replace('list.option.', '')
                            if(APP_INFO.paid && related_assets.app_option_sets[option_id]) {
                                var option = related_assets.app_option_sets[option_id]
                                option.name = option_id;
                                option_sets.add(createString('type', 'option-set', option_id, related_assets.app_option_sets[option_id].display, option))
                                let attributes = []
                                if(related_assets.app_option_sets[option_id].attributes) {
                                    try { attributes = Object.keys(related_assets.app_option_sets[option_id].attributes).map(a => option_id + "." + a) } catch(e) {if(DEBUG) {logMessage('error', 'CopyNoCode: Cant extract values from option sets ' + option_id); console.log(related_assets.app_option_sets[option_id])}}
                                    attributes.forEach(item => option_set_attributes.add(item))
                                }
                            } else if(!APP_INFO.paid)
                                option_sets.add(createString('type', 'option-set', option_id, 'unknown', 'empty'))

                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: Option Set found' + value);
                            }
                        }
                        
                        // API CONNECTOR
                        if (typeof value === 'string' && value.startsWith('apiconnector2-')) {
                            let api_id = value.replace('apiconnector2-', '').split(".")[0]
                            if(APP_INFO.paid && related_assets.app_api_connectors[api_id])
                                api_connectors.add(createString('apiconnector', 'apiconnector', api_id, related_assets.app_api_connectors[api_id].human, {pub: related_assets.app_api_connectors[api_id]}))
                            else if(!APP_INFO.paid)
                                api_connectors.add(createString('apiconnector   ', 'apiconnector', api_id, 'unknown', 'empty'))

                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: ApiConnector found' + api_id);
                            }
                        }
                        
                        // BACKEND WORKFLOW
                        if (typeof value === 'string' && key == "api_event") {
                            if(APP_INFO.paid && related_assets.app_background_workflows[value])
                                backend_workflows.add(createString('action', 'backend-workflow', value, related_assets.app_background_workflows[value].properties.wf_name, {data: related_assets.app_background_workflows[value], is_action: false, page: "api", token_width: 140}))
                            else if(!APP_INFO.paid)
                                backend_workflows.add(createString('action', 'backend-workflow', value, 'unknown', 'empty'))
                                
                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: Backend workflow found' + value);
                            }
                        }
                        
                        // REUSABLE ELEMENT
                        if (key == "type" && value == "CustomElement" && json.properties && json.properties.custom_id) {
                            let element_id = json.properties.custom_id;
                            if(APP_INFO.paid && related_assets.app_reusable_elements[element_id]) {
                                reusable_elements.add(createString('element', 'reusable-element', element_id, related_assets.app_reusable_elements[element_id].name, related_assets.app_reusable_elements[element_id]))
                                if(!recursive_ids.has(element_id)) {
                                    recursive_ids.add(element_id);
                                    checkForCustomValues(related_assets.app_reusable_elements[element_id], new_path, element_id);
                                }
                            } else if(!APP_INFO.paid)
                                reusable_elements.add(createString('element', 'reusable-element', element_id, 'unknown', 'empty'))
                            
                            if(DEBUG_DATA) {
                                logMessage('info', 'CopyNoCode: Reusable element found' + element_id);
                            }
                        }
                        
                        if (typeof value === 'object' && value !== null) {
                            checkForCustomValues(value, new_path, key);
                        }
                    }
                }
            
                checkForCustomValues(json, "", "");
            
                return {element_types: element_types, element_types_unique: Array.from(element_types_unique), workflows: Array.from(workflows), db_fields: Array.from(db_fields), option_set_attributes: Array.from(option_set_attributes), styles: Array.from(styles), plugins: Array.from(plugins), dbs: Array.from(dbs), option_sets: Array.from(option_sets), api_connectors: Array.from(api_connectors), background_workflows: Array.from(backend_workflows), reusable_elements: Array.from(reusable_elements)};
            }
            
            function createString(type, kind, id, display, content) {
                return type + "#copynocode#" + kind + "#copynocode#" + id + "#copynocode#" + display + "#copynocode#" + JSON.stringify(content)
            }
        },

        state: async function(state) {
            if(STATE != state) {
                STATE = state
                handler.bubble.send('state', {'state': state});
            }
        }
    }
}

function logMessage(type, message) {
    let color;
    switch (type) {
      case 'error':
        color = 'red';
        break;
      case 'info':
        color = 'darkseagreen';
        break;
      case 'notice':
        color = 'green';
        break;
      case 'event':
        color = 'darkgreen';
        break;
      case 'result':
        color = 'olive';
        break;
      default:
        color = 'black';
        break;
    }
    console.log('%c' + message, 'color: ' + color);
  }
  