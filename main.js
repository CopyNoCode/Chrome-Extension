// CONFIGURE
const copynocode_discover = "https://copynocode-test.bubbleapps.io/version-test/discover"
const copynocode_create = "https://copynocode-test.bubbleapps.io/version-test/create"
const copynocode_update = "https://copynocode-test.bubbleapps.io/version-test/update/{id}"
const copynocode_restore = "https://copynocode-test.bubbleapps.io/version-test/restore/{id}"

// TODOs
// count fields for things, listing
// count properties for option sets, listing
// count workflows, listing
// add fonts and colors
// fix naming
// tokens font and tokens colors
// get default styles

const DEBUG = true;

// get appname
var url = new URL(window.location.href);
const appname = url.searchParams.get('id');

$(async function () {

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("style.css");
    document.head.appendChild(link);

    if(DEBUG) console.log('loading CopyNoCode')
    
    let copynocodeui = setInterval(function () {
        if ($(".main-tab-bar").length) {
            clearInterval(copynocodeui);
            $(".main-tab-bar").append('<div class="tab discover" id="nocodecopy-btn"><img id="copynocode-icon" src="https://s3.amazonaws.com/appforest_uf/f1672312679295x617020231160427600/copynocode-icon.png" width=21 height=21><span>Discover</span></div>');
            $(".main-tab-bar").append('<div class="tab create" id="nocodecopy-btn"><img id="copynocode-icon" src="https://s3.amazonaws.com/appforest_uf/f1672312679295x617020231160427600/copynocode-icon.png" width=21 height=21><span>Create</span></div>');
        }

        $("body").append(`<div id="copynocode-container-fullscreen">
            <iframe id="copynocode-iframe-fullscreen" src="` + copynocode_discover + `"></iframe>
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
            
            $('#copynocode-container-create').hide()
            
            top.window.postMessage({"copynocode_loaded": true}, "*")
        })

        $('#copynocode-iframe-update').on('load', function() {
            
            $('#copynocode-container-update').hide()
            
        })

        $('#copynocode-container-fullscreen').hide()
        $('#copynocode-container-restore').hide()
        $('#copynocode-container-update').hide()

    }, 500);

    importBubbleData();

    // sidebar restore
    $(document).on('click', '#copynocode-icons .close', function () {
        sidebarRestoreClose()
    });

    $(document).on('click', '#copynocode-icons .hide', function () {
        $('#copynocode-container-restore').addClass('hide');
        $('#copynocode-icons .hide').hide();
        $('#copynocode-icons .show').show(1);
    });

    $(document).on('click', '#copynocode-icons .show', function () {
        $('#copynocode-container-restore').removeClass('hide');
        $('#copynocode-icons .hide').show(1);
        $('#copynocode-icons .show').hide();
    });

    // sidebar create
    $(document).on('click', '#nocodecopy-btn.create', function () {
        discoverClose()
        sidebarRestoreClose()
        sidebarCreateOpen()
    });

    $(document).on('click', '#copynocode-icons .close', function () {
        sidebarCreateClose()
    });

    $(document).on('click', '#copynocode-icons .hide', function () {
        $('#copynocode-container-create').addClass('hide');
        $('#copynocode-icons .hide').hide();
        $('#copynocode-icons .show').show();
    });

    $(document).on('click', '#copynocode-icons .show', function () {
        $('#copynocode-container-create').removeClass('hide');
        $('#copynocode-icons .hide').show();
        $('#copynocode-icons .show').hide();
    });

    // sidebar update
    $(document).on('click', '#copynocode-icons .close', function () {
        sidebarUpdateClose()
    });

    $(document).on('click', '#copynocode-icons .hide', function () {
        $('#copynocode-container-update').addClass('hide');
        $('#copynocode-icons .hide').hide();
        $('#copynocode-icons .show').show();
    });

    $(document).on('click', '#copynocode-icons .show', function () {
        $('#copynocode-container-update').removeClass('hide');
        $('#copynocode-icons .hide').show();
        $('#copynocode-icons .show').hide();
    });

    // discover
    $(document).on('click', '#nocodecopy-btn.discover', function () {
        discoverOpen()
    });

    $(document).on('click', '#copynocode-container-fullscreen', function() {
        discoverClose()
    });

    $(document).on('click', '#copynocode-iframe', function() {
        e.stopPropagation();
    });
});

var clipboard = {}

top.window.addEventListener("message", function(message) {

    if(message.data['copynocode_mode']) {
        switch(message.data['copynocode_mode'].type) {
            case 'discover':
                sidebarCreateClose()
                sidebarRestoreClose()
                sidebarUpdateClose()
                discoverOpen()
                break;
            case 'create':
                sidebarRestoreClose()
                discoverClose()
                sidebarUpdateClose()
                sidebarCreateOpen()
                break;
            case 'update':
                sidebarRestoreClose()
                discoverClose()
                sidebarCreateClose()
                if(message.data['copynocode_mode']['id']) $('#copynocode-iframe.sidebar-update').attr('src', copynocode_update.replace("{id}", message.data['copynocode_mode']['id']))
                else $('#copynocode-iframe.sidebar-update').attr('src', copynocode_update.replace("{id}", "404"))
                sidebarUpdateOpen()
                break;
            case 'restore':
                sidebarCreateClose()
                sidebarUpdateClose()
                discoverClose()
                if(message.data['copynocode_mode']['id']) $('#copynocode-iframe.sidebar-restore').attr('src', copynocode_restore.replace("{id}", message.data['copynocode_mode']['id']))
                else $('#copynocode-iframe.sidebar-restore').attr('src', copynocode_restore.replace("{id}", "404"))
                sidebarRestoreOpen()
                break;
        }
    }

    if(message.data['copynocode_import']) {
        importBubbleData();
    }

    if(message.data['copynocode_copy']) {
        if(DEBUG) console.log('Got Data from CopyNoCode' + JSON.stringify(message.data.copynocode));

        clipboard[message.data.copynocode.key] = message.data.copynocode.content;
        let timestamp = Date.now();
        clipboard["_this_session_clipboard_" + message.data.copynocode.key] = timestamp;
        changed = clipboard;
        
        localStorage.setItem("bubble_" + message.data.copynocode.key + "_clipboard_", message.data.copynocode.content)
        localStorage.setItem("_this_session_clipboard_bubble_" + message.data.copynocode.key + "_clipboard_", timestamp)
    }

    if(message.data['copynocode_loaded']) {
        if(DEBUG) console.log('copynocode is loaded')

        let iframe_interfall = setInterval(function () {

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
                // console.log('same objects' + JSON.stringify(clipboard));
            } else {

                $('#nocodecopy-btn.create').show();
                
                var sendData = {}

                sendData['appname'] = appname;

                var recentDateKey = getMostRecentKey(changed)
                
                var recentContentKey = recentDateKey.replace('_this_session_clipboard_bubble_', '')

                sendData['type'] = recentContentKey.replace('_clipboard', '');

                sendData['content'] = changed["bubble_" + recentContentKey];

                if(DEBUG) console.log('CopyNoCode found ' + sendData['type'] + ' with ' + "bubble_" + recentContentKey)

                sendData = extractData(sendData);

                if(DEBUG) console.log('Send data to CopyNoCode');

                let post_message = {"copied": sendData}

                if(DEBUG) console.log(post_message);

                sendToBubble(post_message);

                clipboard = changed;
            }

        }, 1000);
    }
});

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
                styles.add(value);
                if(DEBUG) console.log('Style: ' + value + ' found')
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

    return {types: types, styles: Array.from(styles), plugins: Array.from(plugins), things: Array.from(customThings), options: Array.from(customOptions), apis: Array.from(ApiConnectors), backendworkflows: Array.from(backendWorkflows), reusables: Array.from(reusableElement)};
} 

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

function sidebarRestoreClose() {
    // sendToBubble({"copynocode_mode_open": "discover"})
    $('#copynocode-container-restore').hide();
    $('#copynocode-icons .hide').show();
    $('#copynocode-icons .show').hide();
}

function sidebarCreateClose() {
    // sendToBubble({"copynocode_mode_open": "discover"})
    $('#copynocode-container-create').hide();
    $('#copynocode-icons .hide').show();
    $('#copynocode-icons .show').hide();
}

function sidebarUpdateClose() {
    // sendToBubble({"copynocode_mode_open": "discover"})
    $('#copynocode-container-update').hide();
    $('#copynocode-icons .hide').show();
    $('#copynocode-icons .show').hide();
}

function discoverClose() {
    // sendToBubble({"copynocode_mode_open": "discover"})
    $('#copynocode-container-fullscreen').hide();
}

function discoverOpen() {
    $('#copynocode-container-fullscreen').css('display', 'flex');
    // sendToBubble({"copynocode_mode_open": "discover"})
}

function sidebarRestoreOpen() {
    // sendToBubble({"copynocode_mode_open": "discover"})
    $('#copynocode-container-restore').css('display', 'flex');
    $('#copynocode-container-restore').removeClass('hide');
    $('#copynocode-icons .hide').show();
    $('#copynocode-icons .show').hide();
}

function sidebarCreateOpen() {
    // sendToBubble({"copynocode_mode_open": "discover"})
    $('#copynocode-container-create').css('display', 'flex');
    $('#copynocode-container-create').removeClass('hide');
    $('#copynocode-icons .hide').show();
    $('#copynocode-icons .show').hide();
}

function sidebarUpdateOpen() {
    // sendToBubble({"copynocode_mode_open": "discover"})
    $('#copynocode-container-update').css('display', 'flex');
    $('#copynocode-container-update').removeClass('hide');
    $('#copynocode-icons .hide').show();
    $('#copynocode-icons .show').hide();
}

function importBubbleData() {
    let senddata = setInterval(async function () {
        clearInterval(senddata);

        var app_import = await fetch('https://bubble.io/appeditor/export/test/' + appname + '.bubble')
        
        var json = await app_import.json()

        let sendImportData = {}

        if(!json.error_class) {
            const app_styles  = json.styles

            const app_option_sets = json.option_sets

            const app_things = json.user_types

            const app_apis = json.settings.client_safe.apiconnector2

            const app_background_workflows = json.api

            const app_element_definitions = json.element_definitions

            sendImportData = {"import": {
                app_styles: objectToArray(app_styles),
                app_option_sets: objectToArray(app_option_sets),
                app_things: objectToArray(app_things),
                app_apis: objectToArray(app_apis),
                app_background_workflows: objectToArray(app_background_workflows),
                app_element_definitions: objectToArray(app_element_definitions),
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

        sendToBubble(sendImportData);
    })
}

function sendToBubble(data) {
    try{
        var send = {
            "copynocode": data
        }
        console.log(send)
        var iframe_create = document.getElementById("copynocode-iframe-create");
        if(iframe_create != null) iframe_create.contentWindow.postMessage(send, "*");

        var iframe_update = document.getElementById("copynocode-iframe-update");
        if(iframe_update != null) iframe_update.contentWindow.postMessage(send, "*");
    } catch(e) {
        alert(e);
    }
}

function objectToArray(obj) {
    if (Object.keys(obj).length === 0 || Object.values(obj).includes(undefined)) {
        return [];
    }
    return Object.entries(obj).map(([key, value]) => `${key}#copynocode#${JSON.stringify(value)}`);
}
  