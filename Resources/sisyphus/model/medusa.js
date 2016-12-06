(function() {
    si.model = {};
    si.model.medusa = {};

    var CLASSNAME_STONE = 'Specimen';
    var CLASSNAME_BOX = 'Box';
    var CLASSNAME_PLACE = 'Place';
    var CLASSNAME_ANALYSIS = 'Analysis';
    var CLASSNAME_BIB = 'Bib';
    var CLASSNAME_ATTACHMENT_FILE = 'AttachmentFile';
    var PATH_JSON = '.json';
    var PATH_RECORED = '/records';
    var PATH_STONE = '/specimens';
    var PATH_BOX = '/boxes';
    var PATH_PLACE = '/places';
    var PATH_ANALYSIS = '/analyses';
    var PATH_BIB = '/bibs';
    var PATH_ATTACHMENT_FILE = '/attachment_files';
    var PATH_ATTACHMENT_FILE_JSON = PATH_ATTACHMENT_FILE + PATH_JSON;
    var PATH_DAUGHTERS = '/daughters';
    var PATH_RECORED_PROPERTY = '/record_property';
    var PATH_RECORED_PROPERTY_JSON = PATH_RECORED_PROPERTY + PATH_JSON;
    var PATH_ACCOUNT = '/account';
    var PATH_ACCOUNT_JSON = PATH_ACCOUNT + PATH_JSON;
    var PATH_CLASSIFICATION = '/classifications';
    var PATH_CLASSIFICATION_JSON = PATH_CLASSIFICATION + PATH_JSON;
    var PATH_INVENTORY = '/inventory';
    var PATH_INVENTORY_JSON = PATH_INVENTORY + PATH_JSON;
    var PATH_TOKEN = '/tokens' + PATH_JSON;

    si.model.medusa.getResourceURLwithAuth = function(_record, _args) {
        var _path = si.model.medusa.getResourcePath(_record);
        var server_url = si.serverURL();
        var username = Ti.App.Properties.getString('username');
        var password = Ti.App.Properties.getString('password');
        var url = si.parseURL(server_url);
        var hostname_with_port = url.protocol + '//' + username + ':' + password + '@' + url.hostname;
        if (url.port){
            hostname_with_port += ':' + url.port;
        }
        if (url.pathname){
            hostname_with_port += url.pathname.replace(/\/$/,'');            
        }
        return hostname_with_port + _path.replace(/\.json/,'');
    }

    si.model.medusa.host = function() {
        var url = Ti.App.Properties.getString('server');
        var result = url.split('\/\/');
        var result2 = result[1].split('\/');
        var host = result2[0];
        return host;
    };
    
    si.model.medusa.client = function(_args) {
        var client = Ti.Network.createHTTPClient({
            onload : function() {
                _args.onsuccess(eval('(' + this.responseText + ')'));
            },
            onerror : function(e) {
                e.status = this.status;
                _args.onerror(e);
            },
            timeout : 30000 // in milliseconds
        });
        return client;
    };

    si.model.medusa.get = function(_args) {
        var client = si.model.medusa.client(_args);
        var url = Ti.App.Properties.getString('server') + _args.path;
        client.open('GET', url);
        // var auth_text = 'Basic ' + Ti.Utils.base64encode(_args.username + ':' + _args.password);
        // client.setRequestHeader('Authorization', auth_text);
        client.send(_args.args);
    };

    si.model.medusa.getClassifications = function(_args) {
        si.model.medusa.get({
            //path : PATH_STONE + '/1' + PATH_JSON,
            path : PATH_CLASSIFICATION_JSON,
            //onsuccess : _args.onsuccess,
            onsuccess : function(_record){
                Ti.API.debug(JSON.stringify(_record));
                Ti.API.debug(_record);
                _args.onsuccess(_record);
            },
            onerror : function(e) {
                Ti.API.info(e.status);
                Ti.API.info(e.error);
                //if (e.status == 404) {
                //    _args.onsuccess();
                //} else {
                    _args.onerror(e);
                //}
            },
        });
    };


    si.model.medusa.getWithAuth = function(_args) {
        si.model.medusa.sendWithAuth(_args, 'GET');
    };

    si.model.medusa.putWithAuth = function(_args) {
        si.model.medusa.sendWithAuth(_args, 'PUT');
    };

    si.model.medusa.postWithAuth = function(_args) {
        si.model.medusa.sendWithAuth(_args, 'POST');
    };

    si.model.medusa.deleteWithAuth = function(_args) {
        Ti.API.info("deleting...");
        si.model.medusa.sendWithAuth(_args, 'DELETE');
    };

    si.model.medusa.sendWithAuth = function(_args, method) {
        var client = si.model.medusa.client(_args);
        var url = Ti.App.Properties.getString('server') + _args.path;
        Ti.API.info(url);
        client.open(method, url);
        var auth_text = '';
        var token = Ti.App.Properties.getString('token') || '';
        if(token.length > 0) {
            auth_text = 'Token ' + token;
        } else {
            auth_text = 'Basic ' + Ti.Utils.base64encode(_args.username + ':' + _args.password);
        }
        client.setRequestHeader('Authorization', auth_text);
        client.send(_args.args);
    };

    si.model.medusa.getToken = function(_args) {
        si.model.medusa.postWithAuth({
            path : PATH_TOKEN,
            args: _args,
            onsuccess : function(_record){
                _args.onsuccess(_record);
            },
            onerror : function(e) {
                _args.onerror(e);
            },
        });
    };

    si.model.medusa.getAccountInfo = function(_args) {
        si.model.medusa.getWithAuth({
            //path : PATH_STONE + '/1' + PATH_JSON,
            path : PATH_ACCOUNT_JSON,
            username : _args.username,
            password : _args.password,
            //onsuccess : _args.onsuccess,
            onsuccess : function(_record){
                //Ti.API.debug(JSON.stringify(_record));
                //Ti.API.debug(_record);
                _args.onsuccess(_record);
            },
            onerror : function(e) {
                //Ti.API.info(e.status);
                //Ti.API.info(e.error);
                //if (e.status == 404) {
                //    _args.onsuccess();
                //} else {
                    _args.onerror(e);
                //}
            },
        });
    };


    si.model.medusa.getRecordFromGlobalId = function(_args) {
        if (!_args.global_id){
            _args.onerror();
            return
        }
        var mr = _args.global_id.match(/.+=(.+)/);
        if (mr != null) {
            _args.global_id = mr[1];
        }
        var record = {
            global_id : _args.global_id,
        };
        si.model.medusa.getWithAuth({
            args : _args.args,
            path : PATH_RECORED + '/' + _args.global_id + PATH_RECORED_PROPERTY_JSON,
            username : _args.username,
            password : _args.password,
            onerror : _args.onerror,
            onsuccess : function(response) {
                record.id = response.datum_id;
                record._className = response.datum_type;
                record.user_id = response.user_id;
                record.group_id = response.group_id;

                si.model.medusa.getWithAuth({
                    args : _args.args,
                    path : si.model.medusa.getClassPath(record) + '/' + record.id + PATH_JSON,
                    username : _args.username,
                    password : _args.password,
                    onerror : _args.onerror,
                    onsuccess : function(_response) {
                        for (var attrname in _response) { record[attrname] = _response[attrname]; }
                        //record.name = _response.name;
                        //Ti.API.info(_response);
                        //Ti.API.info(record);
                        si.model.medusa.getWithAuth({
                            args : _args.args,
                            path : si.model.medusa.getClassPath(record) + '/' + record.id + PATH_ATTACHMENT_FILE_JSON,
                            username : _args.username,
                            password : _args.password,
                            onerror : _args.onerror,
                            onsuccess : function(__response) {
                                record.image_path = '';
                                if (__response.length > 0) {
                                    attachmentFile = __response[0];
                                    record.image_path = attachmentFile.thumbnail_path;
                                    record.original_path = attachmentFile.original_path;
                                    record.thumbnail_path = attachmentFile.thumbnail_path;
                                    record.tiny_path = attachmentFile.tiny_path;
                                }
                                _args.onsuccess(record);
                            }
                        });
                    }
                });
            },
        });
    };

    si.model.medusa.delete = function(_args) {
        var mr = _args.global_id.match(/.+=(.+)/);
        if (mr != null) {
            _args.global_id = mr[1];
        }
        si.model.medusa.deleteWithAuth({
            path : PATH_RECORED + '/' + _args.global_id + PATH_JSON,
            username : _args.username,
            password : _args.password,
            onerror : _args.onerror,
            onsuccess : function(response) {
                _args.onsuccess(response);
            },
        });
    };

    si.model.medusa.getResourcePath = function(_record) {
        var class_path = si.model.medusa.getClassPath(_record);
        //var path = [class_path, _record.id + JSON_PATH].join('/')
        var path = class_path + '/' + _record.id + PATH_JSON;
        return path;
    };

    si.model.medusa.className2Path = function(_className) {
        var path = '';
        switch(_className) {
            case CLASSNAME_STONE:
                path = PATH_STONE;
                break;
            case CLASSNAME_BOX:
                path = PATH_BOX;
                break;
            case CLASSNAME_PLACE:
                path = PATH_PLACE;
                break;
            case CLASSNAME_ANALYSIS:
                path = PATH_ANALYSIS;
                break;
            case CLASSNAME_BIB:
                path = PATH_BIB;
                break;
            case CLASSNAME_ATTACHMENT_FILE:
                path = PATH_ATTACHMENT_FILE;
                break;
            default:
                throw new Error(_className + ' is not supported .');
        }
        return path;
    };

    si.model.medusa.getResourcePropertyPath = function(_record) {
        var class_path = si.model.medusa.getClassPath(_record);
        //var path = [class_path, _record.id + JSON_PATH].join('/')
        return class_path + '/' + _record.id + PATH_RECORED_PROPERTY_JSON;
    };

    si.model.medusa.getCollectionPath = function(_className) {
        var class_path = si.model.medusa.className2Path(_className);
        return class_path + PATH_JSON;
    };

    si.model.medusa.getClassPath = function(_record) {
        var path = '';
        switch(_record._className) {
            case CLASSNAME_STONE:
                path = PATH_STONE;
                break;
            case CLASSNAME_BOX:
                path = PATH_BOX;
                break;
            case CLASSNAME_PLACE:
                path = PATH_PLACE;
                break;
            case CLASSNAME_ANALYSIS:
                path = PATH_ANALYSIS;
                break;
            case CLASSNAME_BIB:
                path = PATH_BIB;
                break;
            case CLASSNAME_ATTACHMENT_FILE:
                path = PATH_ATTACHMENT_FILE;
                break;
            default:
                throw new Error(_record._className + ' is not supported .');
        }
        var path = si.model.medusa.className2Path(_record._className);
        return path;
    };

    si.model.medusa.getLinkPath = function(_parent, _child) {
        var path = '';
        path += si.model.medusa.getClassPath(_parent);
        path += '/' + _parent.id;

        if ((_parent._className == CLASSNAME_STONE) && (_child._className == CLASSNAME_STONE)) {
            path += PATH_DAUGHTERS;
        } else {
            path += si.model.medusa.getClassPath(_child);
        }
        path += '/' + _child.id;
        path += PATH_JSON;
        return path;
    };

    si.model.medusa.inventoryPath = function(_parent, _child) {
        var path = '';
        path += (PATH_BOX + '/' + _parent.id);
        path += si.model.medusa.getClassPath(_child);
        path += '/' + _child.id;
        path += PATH_INVENTORY_JSON;
        return path;
    };

    si.model.medusa.createLink = function(_parent, _child, _args) {
        if (((_parent._className == CLASSNAME_BOX) && (_child._className == CLASSNAME_STONE)) || ((_parent._className == CLASSNAME_BOX) && (_child._className == CLASSNAME_BOX))) {
            si.model.medusa.postWithAuth({
                args : _args.args,
                path : si.model.medusa.inventoryPath(_parent, _child),
                username : _args.username,
                password : _args.password,
                onsuccess : function(response) {
                    _args.onsuccess(response);
                },
                onerror : _args.onerror
            });
        } else {
            si.model.medusa.putWithAuth({
                args : _args.args,
                path : si.model.medusa.getLinkPath(_parent, _child),
                username : _args.username,
                password : _args.password,
                onsuccess : function(response) {
                    _args.onsuccess(response);
                },
                onerror : _args.onerror
            });
        }
    };

    si.model.medusa.getImageUploadPath = function(_parent) {
        var path = '';
        switch(_parent._className) {
            case CLASSNAME_STONE:
                path += PATH_STONE + '/' + _parent.id;
                break;
            case CLASSNAME_BOX:
                path += PATH_BOX + '/' + _parent.id;
                break;
            case CLASSNAME_PLACE:
                path += PATH_PLACE + '/' + _parent.id;
                break;
            case CLASSNAME_ANALYSIS:
                path += PATH_ANALYSIS + '/' + _parent.id;
                break;
            case CLASSNAME_BIB:
                path += PATH_BIB + '/' + _parent.id;
                break;
//            case CLASSNAME_ATTACHMENT_FILE:
//                break;
            default:
                throw new Error(_parent._className + ' is not supported.');
        }
        path += PATH_ATTACHMENT_FILE;
        path += PATH_JSON;

        return path;
    };

    si.model.medusa.uploadImage = function(_args) {
        var params = {};
        params['attachment_file[data]'] = _args.data;
        si.model.medusa.postWithAuth({
            args : params,
            path : si.model.medusa.getImageUploadPath(_args.record),
            username : _args.username,
            password : _args.password,
            onsuccess : function(response) {
                _args.onsuccess(response);
            },
            onerror : _args.onerror
        });
    };

    si.model.medusa.update_attributes = function(_record, _args) {
        var params = {};
        var _className = _record._className;
        var _paramName = _className.toLowerCase();

        params[_paramName + '[record_property_attributes][global_id]'] = _record.global_id;
        params[_paramName + '[record_property_attributes][user_id]'] = _record.user_id;        
        params[_paramName + '[record_property_attributes][group_id]'] = _record.group_id;        
        for (var key in _args.args){
            var param_key = _paramName;
            if (key == 'global_id' || key == 'user_id' || key == "group_id"){
                param_key += '[record_property_attributes][' + key +  ']';
            } else {
                param_key += '[' + key +  ']';
            }
            params[param_key] = _args.args[key];
        }

        si.model.medusa.putWithAuth({
            args : params,
            path : si.model.medusa.getResourcePath(_record),
            username : _args.username,
            password : _args.password,
            onsuccess : function(response) {
                si.model.medusa.reload(_record,{
                    username: _args.username,
                    password: _args.password,
                    onerror : _args.onerror,
                    onsuccess : function(record){
                        _args.onsuccess(record);
                    }
                }
                );
            },
            onerror : _args.onerror
        });
    };

    si.model.medusa.reload = function(_record, _args) {
        var path = si.model.medusa.getResourcePath(_record);
        var className = _record._className;
        si.model.medusa.getWithAuth({
            args : _args.args,
            path : path,
            username : _args.username,
            password : _args.password,
            onerror : function(e) {
                _args.onerror(e);
            },
            onsuccess : function(_response) {
                _response._className = className;
                si.model.medusa.load_property(_response, _args);
            }
        });

    };

    si.model.medusa.load_property = function(_record, _args) {
        var path = si.model.medusa.getResourcePropertyPath(_record);
        si.model.medusa.getWithAuth({
            path : path,
            username : _args.username,
            password : _args.password,
            onsuccess : function(_recordProperty) {
                if (_recordProperty) {
                     //_record._className = _recordProperty.datum_type;
                     _record.user_id = _recordProperty.user_id;
                     _record.global_id = _recordProperty.global_id;
                     _record.group_id = _recordProperty.group_id;
                    _args.onsuccess(_record);
                } else {
                    _args.onerror({error : 'recored property not found'});
                }
            },
            onerror : function(e) {
                _args.onerror(e);
            },
        });
    };


    si.model.medusa.create = function(_className, _args) {
        var params = {};
        var properties = null;
        var _paramName = _className.toLowerCase();
        for (var key in _args.args){
            var param_key = _paramName;
            param_key += '[' + key +  ']';

            if (key == 'global_id' || key == 'user_id' || key == 'group_id'){
                if (!properties){
                    properties = {};
                }
                properties[key] = _args.args[key];
            } else {
                params[param_key] = _args.args[key];
            }
        }
        var path = si.model.medusa.getCollectionPath(_className);
        si.model.medusa.postWithAuth({
            args : params,
            path : path,
            username : _args.username,
            password : _args.password,
            onsuccess : function(_stone) {
                if (_stone) {
                    var record = _stone;
                    record._className = _className;
                    si.model.medusa.load_property(record, {
                        username : _args.username,
                        password : _args.password,
                        onsuccess : function(_record) {
                            if (properties){
                                // update record_properties
                                si.model.medusa.update_attributes(_record, {
                                    args: properties,
                                    username : _args.username,
                                    password : _args.password,
                                    onsuccess : function(_updated){
                                        _args.onsuccess(_updated);
                                    },
                                    onerror : function(e) { _args.onerror(e) }
                                });
                            } else {
                                _args.onsuccess(_record);
                            }
                        },
                        onerror: function(e) {_args.onerror(e)}         
                    });
                } else {
                    _args.onerror({error : 'stone not found'});
                }
            },
            onerror : _args.onerror,
        });
    };

    si.model.medusa.createNewStone = function(_args) {
        si.model.medusa.create('Specimen', _args);
    };

    si.model.medusa.createNewBox = function(_args) {
        si.model.medusa.create('Box', _args);
    };

    si.model.medusa.update = function(_className, _args) {
        var params = {};
        var properties = null;
        var _paramName = _className.toLowerCase();
        for (var key in _args.args){
            var param_key = _paramName;
            param_key += '[' + key +  ']';

            if (key == 'global_id' || key == 'user_id' || key == 'group_id'){
                if (!properties){
                    properties = {};
                }
                properties[key] = _args.args[key];
            } else {
                params[param_key] = _args.args[key];
            }
        }
        var path = si.model.medusa.getResourcePath(_args.args);

        si.model.medusa.putWithAuth({
            args : params,
            path : path,
            username : _args.username,
            password : _args.password,
            onsuccess : function(_obj) {
                var record = _args.args;
                record._className = _className;
                Ti.API.info(record);
                si.model.medusa.load_property(record, {
                    username : _args.username,
                    password : _args.password,
                    onsuccess : function(_record) {
                        if (properties){
                            // update record_properties
                            si.model.medusa.update_attributes(_record, {
                                args: properties,
                                username : _args.username,
                                password : _args.password,
                                onsuccess : function(_updated){
                                    _args.onsuccess(_updated);
                                },
                                onerror : function(e) { _args.onerror(e) }
                            });
                        } else {
                            // si.model.medusa.reload(_record,{
                            //     username: _args.username,
                            //     password: _args.password,
                            //     onerror : _args.onerror,
                            //     onsuccess : function(record){
                                Ti.API.info(_record);
                                    _args.onsuccess(_record);
                             //   }
                            // });
                            //_args.onsuccess(_record);
                        }
                    },
                    onerror: function(e) {_args.onerror(e)}         
                });
            },
            onerror : function(e){ 
                Ti.API.info(e);
                _args.onerror(e) 
            }
        });
    };

    si.model.medusa.getRecords = function(_args) {
        var params = "?";
        var queries = [];
        var keys = Object.keys(_args.query);
        for(var i in keys) {
            var key = keys[i];
            var value = _args.query[key];
            if(value) {
                if(Array.isArray(value)) {
                    for(var j in value) {
                        queries.push("q[" + key + "][]=" + value[j]);
                    }
                } else {
                    queries.push("q[" + key + "]=" + value);
                }
            }
        }
        params += queries.join('&');
        params += "&page=" + _args.page;
        params += "&per_page=" + _args.per_page;
        si.model.medusa.getWithAuth({
            path : PATH_RECORED + PATH_JSON + params,
            username : Ti.App.Properties.getString('username'),
            password : Ti.App.Properties.getString('password'),
            onsuccess : function(_record){
                _args.onsuccess(_record);
            },
            onerror : function(e) {
                _args.onerror(e);
            },
        });
    };
})();
