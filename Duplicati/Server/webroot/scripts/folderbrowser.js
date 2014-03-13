$(document).ready(function() {
    $.browseForFolder = function(config) {
        var self = {};

        self.rootel = $('<div class="modal-dialog folder-browser-dialog"></div>')
        self.treeel = $('<div></div>');

        self.rootel.append(self.treeel);

        self.rootel.attr('title', config.title);

        self.treeel.jstree({
            'json': {
                'ajax': {
                    'url': APP_CONFIG.server_url,
                    'data': function(n) {
                        return {
                            'action': 'get-folder-contents',
                            'onlyfolders': true,
                            'path': n === -1 ? "/" : n.data('id')
                        };
                    },
                    'success': function(data, status, xhr) {
                        for(var i = 0; i < data.length; i++) {
                            var o = data[i];
                            o.title = o.text;
                            o.children = !o.leaf;
                            o.data = { id: o.id, display: o.text };
                            delete o.text;
                            delete o.leaf;
                        }
                        return data;
                    }
                },
                'progressive_render' : true,
            },
            'plugins' : [ 'themes', 'json', 'ui', 'dnd', 'wholerow' ],
            'core': { 
                'check_callback': function(method, item, parent, position) { 
                    // We never allow drops in the tree itself
                    return false; 
                }
            },
            'dnd': { copy: false },
        });

        self.rootel.dialog({
            minWidth: 320, 
            width: $('body').width > 600 ? 320 : 600, 
            minHeight: 480, 
            height: 500, 
            modal: true,
            autoOpen: true,
            closeOnEscape: true,
            buttons: [
                { text: 'Close', disabled: false, click: function(event, ui) {
                    self.rootel.dialog('close');
                }},
                { text: 'OK', disabled: true, click: function(event, ui) {
                    var node = self.selected_node;
                    if (node != null) {
                        config.callback(node.data('id'), node.data('display'));
                        self.rootel.dialog('close');
                    }
                }}
            ]
        });

        self.dlg_buttons = self.rootel.parent().find('.ui-dialog-buttonpane').find('.ui-button');

        self.rootel.on('dialogclose', function() {
            self.rootel.remove();
        });

        self.treeel.bind("dblclick.jstree", function (event) {
            var node = $(event.target).closest("li");
            config.callback(node.data('id'), node.data('display'));
            self.rootel.dialog('close');
        });

        self.treeel.bind('select_node.jstree', function (event, data) {
            self.selected_node = data.node;
            self.dlg_buttons.last().button('option', 'disabled', self.selected_node == null);
        });


    };
});