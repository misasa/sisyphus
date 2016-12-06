var si = {};
(function() {
    si.app = {};

    si.app.log = {};
    si.app.log.list = [];
    si.app.log.clear = function(){
        si.app.log.list = [];
    }
    si.app.log.newObj = function(_level, _message){
        var _date = new Date();        
        var _obj = {level: _level, message: _message, data: _date };
        return _obj;
    };
    si.app.log.append = function(_log){
        si.app.log.list.push(_log);
        Ti.App.fireEvent('app:logged', _log);
    };
    si.app.log.info = function(_message){
        var _log = si.app.log.newObj('info', _message);
        si.app.log.append(_log);
    };
    si.app.log.error = function(_message){
        var _log = si.app.log.newObj('error', _message);
        si.app.log.append(_log);
    };
    si.app.log.warn = function(_message){
        var _log = si.app.log.newObj('warn', _message);
        si.app.log.append(_log);
    };
    si.app.log.fatal = function(_message){
        var _log = si.app.log.newObj('fatal', _message);
        si.app.log.append(_log);
    };

    si.app.is_network_available = function(){
        //Ti.API.info(Ti.Network.networkTypeName);
        if (Ti.Network.networkType == Ti.Network.NETWORK_NONE){
            return false;
        } else {
            return true;
        }
    };

    si.app.getUserName = function(){
        return Ti.App.Properties.getString('username');
    };

    si.app.getSiteName = function(){
        return Ti.App.Properties.getString('server');
    };


    si.app.getAccountInfo = function(_args){
        //Ti.API.info('si.app.getAccountInfo');
        var _message = 'account info getting...';
        si.model.medusa.getAccountInfo({
            username : Ti.App.Properties.getString('username'),
            password : Ti.App.Properties.getString('password'),
            onsuccess : function(response) {
                //si.app.log.info(_message + 'ok');
                _args.onsuccess(response);
            },
            onerror : function(e) {
                //si.app.log.error(_message + 'error ' + "[" + e.message + "]");
                _args.onerror(e);
            }
        });

    };


    si.app.clearData = function(){
        Ti.App.Properties.setString('current_global_id', null);        
        Ti.App.Properties.setString('current_box_global_id', null);
        Ti.App.Properties.setList("classifications", null);        
        Ti.App.Properties.setList("physical_forms", null);
        Ti.App.Properties.setList("box_types", null);
        Ti.App.Properties.setList("groups", null);                
    };

    si.app.account = function(){
        return Ti.App.Properties.getObject("account", {});
    };

    si.app.groups = function(){
        return Ti.App.Properties.getList("groups", null);
    };
    si.app.getGroups = function(){
        Ti.API.info('si.app.getGroups');
        var _message = 'groups getting...';
        si.model.medusa.getWithAuth({
            path : '/account/groups.json',
            username : Ti.App.Properties.getString('username'),
            password : Ti.App.Properties.getString('password'),
            onsuccess : function(_array) {
                si.app.log.info(_message + 'ok');
                for(var i=0; i<_array.length; i++){
                //    Ti.API.info("---");
                    var _obj = _array[i];
                    _obj.title = _obj.name;
                }
                Ti.App.Properties.setList("groups", _array);
            },
            onerror : function(e) {
                //si.app.log.error(_message + 'error ' + "[" + e.message + "]");
                //_args.onerror(e);
            }
        });
    };

    si.app.classifications = function(){
        return Ti.App.Properties.getList("classifications", null);
    };
    si.app.getClassifications = function(){
        Ti.API.info('si.app.getClassifications');
        var _message = 'classifications getting...';
        si.model.medusa.getWithAuth({
            path : '/classifications.json',
            username : Ti.App.Properties.getString('username'),
            password : Ti.App.Properties.getString('password'),
            onsuccess : function(_array) {
                si.app.log.info(_message + 'ok');
                for(var i=0; i<_array.length; i++){
                //    Ti.API.info("---");
                    var _obj = _array[i];
                    _obj.title = _obj.full_name;
                }
                Ti.App.Properties.setList("classifications", _array);
            },
            onerror : function(e) {
                //si.app.log.error(_message + 'error ' + "[" + e.message + "]");
                //_args.onerror(e);
            }
        });
    };

    si.app.physical_forms = function(){
        return Ti.App.Properties.getList("physical_forms", null);
    };
    si.app.getPhysicalForms = function(){
        Ti.API.info('si.app.getPhysicalforms');
        var _message = 'physical_forms getting...';
        si.model.medusa.getWithAuth({
            path : '/physical_forms.json',
            username : Ti.App.Properties.getString('username'),
            password : Ti.App.Properties.getString('password'),
            onsuccess : function(_array) {
                si.app.log.info(_message + 'ok');
                for(var i=0; i<_array.length; i++){
                    //Ti.API.info("---");
                    var _obj = _array[i];
                    _obj.title = _obj.name;
                }
                Ti.App.Properties.setList("physical_forms", _array);
            },
            onerror : function(e) {
                si.app.log.error(_message + 'error ' + "[" + e.message + "]");
                //_args.onerror(e);
            }
        });
    };

    si.app.box_types = function(){
        return Ti.App.Properties.getList("box_types", null);
    };
    si.app.getBoxTypes = function(){
        Ti.API.info('si.app.getBoxTypes');
        var _message = 'box_types getting...';
        si.model.medusa.getWithAuth({
            path : '/box_types.json',
            username : Ti.App.Properties.getString('username'),
            password : Ti.App.Properties.getString('password'),
            onsuccess : function(_array) {
                si.app.log.info(_message + 'ok');
                for(var i=0; i<_array.length; i++){
                    //Ti.API.info("---");
                    var _obj = _array[i];
                    _obj.title = _obj.name;
                }
                Ti.App.Properties.setList("box_types", _array);
            },
            onerror : function(e) {
                si.app.log.error(_message + 'error ' + "[" + e.message + "]");
                //_args.onerror(e);
            }
        });
    };


    var empty = {};
    function mixin(/*Object*/target, /*Object*/source) {
        var name, s, i;
        for (name in source) {
            s = source[name];
            if (!( name in target) || (target[name] !== s && (!( name in empty) || empty[name] !== s))) {
                target[name] = s;
            }
        }
        return target;
        // Object
    };
    si.mixin = function(/*Object*/obj, /*Object...*/props) {
        if (!obj) {
            obj = {};
        }
        for (var i = 1, l = arguments.length; i < l; i++) {
            mixin(obj, arguments[i]);
        }
        return obj;
        // Object
    };

    si.combine = function(/*Object*/obj, /*Object...*/props) {
        var newObj = {};
        for (var i = 0, l = arguments.length; i < l; i++) {
            mixin(newObj, arguments[i]);
        }
        return newObj;
    };

    var locale = Ti.Platform.locale;
    var osname = Ti.Platform.osname;

    /*
     Branching logic based on locale
     */
    si.locale = function(/*Object*/map) {
        var def = map.def || null;
        //default function or value
        if (map[locale]) {
            if ( typeof map[locale] == 'function') {
                return map[locale]();
            } else {
                return map[locale];
            }
        } else {
            if ( typeof def == 'function') {
                return def();
            } else {
                return def;
            }
        }
    };

    /*
     Branching logic based on OS
     */
    si.os = function(/*Object*/map) {
        var def = map.def || null;
        //default function or value
        if ( typeof map[osname] != 'undefined') {
            if ( typeof map[osname] == 'function') {
                return map[osname]();
            } else {
                return map[osname];
            }
        } else {
            if ( typeof def == 'function') {
                return def();
            } else {
                return def;
            }
        }
    };

    si.serverURL = function(){
        var _server = Ti.App.Properties.getString('server');
        var url = _server;
        if (_server.match(/^\w+:\/\//) == null) {
            url = 'http://' + url;
        }

        if (_server.match(/\/$/) == null) {
            url = url + '/';
        }
        return url;
    }


    si.imageURL = function(_path) {
        var server_url = si.serverURL();
        var url = si.parseURL(server_url);
        var hostname_with_port = url.protocol + '//' + url.hostname;
        if (url.port){
            hostname_with_port += ':' + url.port;
        }
        return hostname_with_port + _path;
    };

    si.authURL = function(_path) {
        var server_url = si.serverURL();
        var username = Ti.App.Properties.getString('username');
        var password = Ti.App.Properties.getString('password');
        var url = si.parseURL(server_url);
        var hostname_with_port = url.protocol + '//' + username + ':' + password + '@' + url.hostname;
        if (url.port){
            hostname_with_port += ':' + url.port;
        }
        return hostname_with_port + _path;
    };

    si.parseURL = function (href) {
        var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
        return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        }
    };

})();

Ti.include(
    '/sisyphus/tibar.js', 
    '/sisyphus/nfc.js',
    '/sisyphus/sqlite.js',
    '/sisyphus/BarcodeReader.js',    
    '/sisyphus/ui/ui.js', 
    '/sisyphus/model/medusa.js',
    '/sisyphus/config/config.js'
    ); 
