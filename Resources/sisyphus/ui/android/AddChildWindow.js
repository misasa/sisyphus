(function() {

    si.ui.createAddChildWindow = function() {
        var parent = null;
        //var isMultiScan = !si.config.Medusa.debug;

        var win = Ti.UI.createWindow({
            title : 'Main',
            //backgroundColor : 'orange',
            barColor : '#336699',
            orientationModes : [Ti.UI.PORTRAIT],
            backButtonTitle : 'Back',
            //layout : 'vertical'
        });


        win.buttons = {};
        win.functions = {};
        //event
        Ti.App.addEventListener('app:logged', function(e){
            // Ti.API.info('app:logged fired');
            // Ti.API.info(e);
            var _row = Ti.UI.createTableViewRow({
                height : Ti.UI.SIZE
            });
            var _label = Ti.UI.createLabel(si.combine($$.logText, {
                text : e.message,
                bottom : 0,
                width : '100%',
                height : 'auto',
                textAlign : 'left'
            }));
            if (e.level === 'error'){
                si.sound_mailerror.play();
                _label.color = 'red';
            }
            _row.add(_label);
            logTable.insertRowBefore(0,_row);
            logTable.scrollToIndex(0);
        });

        win.addEventListener('open', function(e) {
            Ti.API.info('opened');
        });

        win.addEventListener('focus', function(e) {
            Ti.API.info('focused.');
            if (si.app.is_network_available()){
                si.app.getAccountInfo({
                    onsuccess : function(account){
                        Ti.API.info(account);
                        Ti.App.Properties.setObject('account', account);
                        //Ti.API.info(si.app.classifications());
                        if (Ti.App.Properties.getString('current_box_global_id') == null){
                            if (account.box_global_id){
                                Ti.App.Properties.setString('current_box_global_id', account.box_global_id);
                                //win.buttons.Home.setEnabled(true);
                            }
                        }
                        if (si.app.groups() == null){
                            si.app.getGroups();
                        }
                        if (si.app.classifications() == null){
                            si.app.getClassifications();
                        }
                        //Ti.API.info(si.app.physical_forms());
                        if (si.app.physical_forms() == null){
                            si.app.getPhysicalForms();
                        }
                        if (si.app.box_types() == null){
                            si.app.getBoxTypes();
                        }

 
                        win.functions.refresh();
                    },
                    onerror : function(e){
                        //var _message = 'Login failed';
                        changeMode('error','logging into ' + si.app.getUserName() + ' on ' + si.app.getSiteName() + '...' );
                        //si.ui.showErrorDialog(_message);
                        //si.ui.alert_simple('print error : ' + e.error);
                        var windowLogin = si.ui.createLoginWindow({
                            onsuccess : function(){
                                si.ui.myAlert({message: 'Login successfully'});
                            }
                        });
                        si.app.tabGroup.activeTab.open(windowLogin,{animated:true});
                    }
                });
            } else {
                var _message = 'No network is available'
                changeMode('error','network checking...');
                si.ui.showErrorDialog(_message);
                changeMode('unavailable');
            }

        });

        var activityIndicator = Ti.UI.createActivityIndicator({
            style : Ti.UI.ActivityIndicatorStyle.BIG,
        });
        //view
        var viewBase = Ti.UI.createView({
            //backgroundColor : 'red',
            top : 0,
            width : '99%',
            height : '100%',
            layout : 'vertical'
        });

        var viewUpper = Ti.UI.createView({
            //backgroundColor : 'red',
            //top : 0,
            layout : 'vertical',
            //height : '15%'
            height : '55%'
        });

        var viewToolBar = Ti.UI.createView({
            //backgroundColor : 'red',
            //top : 0,
            //layout : 'horizontal',
            //height : '15%'
            height : Ti.UI.SIZE
        });

        var viewToolLeft = Ti.UI.createView({
            //backgroundColor : 'yellow',
            left : 0,
            layout : 'horizontal',
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE
        });        
        var viewToolRight = Ti.UI.createView({
            //backgroundColor : 'white',
            right : 0,
            layout : 'horizontal',
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE
        });
        var viewHeader = Ti.UI.createView({
            //backgroundColor : 'red',
            //top : 0,
            //height : '20%'
            height : Ti.UI.SIZE
        });

        var viewButton = Ti.UI.createView({
            //backgroundColor : 'green',
            //top : 0,
            height : '45%',
            layout : 'vertical'
        });

        var viewHeaderLeft = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : '100%',
            //width : Ti.UI.FILL,
            top : 0,
            left : 0,
        //    backgroundColor : 'white',
            layout : 'horizontal'
        });

        var viewHeaderRight = Ti.UI.createView({
            //height : '100%',
            height : Ti.UI.SIZE,
            width : '0%',
            top : 0,
            right : 0,
            //backgroundColor : 'white',
            layout : 'horizontal'
        });

        var viewParent = si.ui.createViewParent(null, {
            width : '100%',
            //backgroundColor : 'yellow',
            height : Ti.UI.SIZE,
            imgDimensions : 120,
        });

        var logTable = Ti.UI.createTableView({
            data: [],
            separatorColor : null
        });

        var labelStatus = Ti.UI.createLabel(si.combine($$.smallText, {
            text : '',
            textAlign : 'left',
            //top : '95%',
            left : 0,
            width : '100%',
            borderWidth : 1,
        }));

        win.buttons.ScanParent = si.ui.createImageButtonView('/images/glyphicons-86-repeat.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) { win.functions.clickScanParentButton() }
        });

        win.buttons.Search = si.ui.createImageButtonView('/images/glyphicons-28-search.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) {
                var windowLogin = win.functions.clickSearchButton();
                si.app.tabGroup.activeTab.open(windowLogin,{animated:true});
            }
        });

        win.buttons.History = si.ui.createImageButtonView('/images/glyphicons-352-book-open.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) {
                var windowLogin = win.functions.clickHistoryButton();
                si.app.tabGroup.activeTab.open(windowLogin,{animated:true});
            }
        });

        win.buttons.Home = si.ui.createImageButtonView('/images/glyphicons-21-home.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick: function(e){ win.functions.clickHomeButton() }
        });

        win.buttons.FelicaLogin = si.ui.createImageButtonView('/images/189-plant.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick: function(e){ win.functions.clickFelicaLoginButton() }
        });

        win.buttons.Menu = si.ui.createImageButtonView('/images/glyphicons-137-cogwheel.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e){ win.functions.clickMenuButton() }
        });

        win.buttons.Print = si.ui.createImageButtonView('/images/glyphicons-16-print.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) { win.functions.clickPrintButton(e) }
        });

        win.buttons.Camera = si.ui.createImageButtonView('/images/glyphicons-12-camera.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) { win.functions.clickCameraButton() }
        });

        win.buttons.Clip = si.ui.createImageButtonView('/images/glyphicons-63-paperclip.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) { win.functions.clickClipButton() }
        });

        var buttonfont = {fontSize: 36};
        win.buttons.NewStone = si.ui.createButton(si.combine($$.NormalButton, {    
            top : '2%',
            title : 'New stone',
            font : buttonfont,
            width : '100%',
            borderRadius : 10,
            height : '30%',
            onclick : function(e){ win.functions.clickNewStoneButton() }
        }));

        win.buttons.NewBox = si.ui.createButton(si.combine($$.NormalButton, {
            top : '2%',
            title : 'New box',
            font : buttonfont,
            borderRadius : 10,
            width : '100%',
            height : '30%',
            onclick : function(e){ win.functions.clickNewBoxButton() }
        }));

        win.buttons.ScanChild = si.ui.createButton(si.combine($$.NormalButton, {
            title : 'Scan barcode',
            font : buttonfont,
            borderRadius : 10,
            top : '2%',
            width : '100%',
            height : '30%',
            onclick : function(e){ win.functions.clickScanChildButton() }
        }));

        viewToolLeft.add(win.buttons.Home);
        viewToolLeft.add(win.buttons.FelicaLogin);
        viewToolLeft.add(win.buttons.ScanParent);
        viewToolRight.add(win.buttons.Search);
        viewToolRight.add(win.buttons.History);
        viewToolRight.add(win.buttons.Print);
        viewToolRight.add(win.buttons.Camera);        
        //viewToolRight.add(win.buttons.Clip);
        viewToolRight.add(win.buttons.Menu);
        viewToolBar.add(viewToolLeft);
        viewToolBar.add(viewToolRight);        
        viewHeader.add(viewParent);

        viewUpper.add(viewToolBar);        
        viewUpper.add(viewHeader);
        viewUpper.add(labelStatus);
        viewUpper.add(logTable);
        viewButton.add(win.buttons.NewStone);
        viewButton.add(win.buttons.NewBox);        
        viewButton.add(win.buttons.ScanChild);

        viewBase.add(viewUpper);
        viewBase.add(viewButton);
        win.add(viewBase);
        win.add(activityIndicator);

        var mode;
        function changeMode(_mode, _message) {
            Ti.API.info('changeMode...');
            //Ti.API.info(activityIndicator);
            mode = _mode;
            var isEnabled = true;
            if (_mode == 'loading') {
                activityIndicator.show();
                labelStatus.text = _message || 'loading...';
                isEnabled = false;
                for(var prop in win.buttons){
                    win.buttons[prop].setEnabled(false);
                }
                return;
            } else if (_mode == 'unavailable'){
                for(var prop in win.buttons){
                    win.buttons[prop].setEnabled(false);
                }
                return;
            } else if (_mode == 'error'){
                si.sound_mailerror.play();                
                si.app.log.error(_message + 'error');
            } else if (_mode == 'ok'){
                si.app.log.info(_message + 'ok')
            }
            
            activityIndicator.hide();
            labelStatus.text = 'Ready for another stone';
            for(var prop in win.buttons){
                win.buttons[prop].setEnabled(true);
            }

            if (Ti.App.Properties.getString('current_box_global_id') == null){
                win.buttons.Home.setEnabled(false);
            }

            if (parent == null) {
                win.buttons.ScanChild.setEnabled(false);
                win.buttons.Camera.setEnabled(false);
                //win.buttons.Clip.setEnabled(false);
                win.buttons.Print.setEnabled(false);
                win.buttons.Menu.setEnabled(false);
            }

            if (!Ti.App.Properties.getBool('printLabel')){
                win.buttons.Print.setEnabled(false);
            }
        };

        win.functions.refresh = function(){
            Ti.API.info("functions.refresh...");
            //changeMode('ready');
            if (mode !== 'loading') {
                changeMode('refresh');
            } 
            current_global_id = Ti.App.Properties.getString('current_global_id');
            default_global_id = Ti.App.Properties.getString('current_box_global_id');            
            if (!(parent && parent.global_id === current_global_id)) {
                 // Ti.API.info('parent:' + parent);                
                 // Ti.API.info('current_global_id:' + current_global_id);
                if (current_global_id !== null ){
                     // Ti.API.info('current_global_id:' + current_global_id);
                    loadParent(current_global_id);
                } else if (default_global_id !== null){
                     // Ti.API.info('default_global_id:' + default_global_id);                    
                    loadParent(default_global_id);
                } else {
                    parent = null;
                    viewParent.update(null);
                }
            }
            // if (parent == null) {
            //     if (current_global_id != null) {
            //         loadParent(current_global_id);
            //     }
            // } else {
            //     if (parent.global_id != current_global_id) {
            //         loadParent(current_global_id);
            //     }
            // }
        };

        win.functions.clickHomeButton = function(){
            Ti.API.info('clickHomeButton');
            default_global_id = Ti.App.Properties.getString('current_box_global_id');
            if (default_global_id === null){
                si.ui.myAlert({message:'Set your home first', title:''});
            } else {
                loadParent(default_global_id);
            }
        };

        win.functions.clickMenuButton = function(){
            var options = ['Open with browser', 'Add a local file', 'Edit'];
            if (si.nfc.isEnabled()) {
                options = options.concat(['NFC read', 'NFC write']);
            }
            
            var optionDialogForMenu = Ti.UI.createOptionDialog({
                options : options,
                title : ''
            });
            optionDialogForMenu.addEventListener('click', function(e) {
                switch (e.index) {
                    case 0:
                        var url = si.model.medusa.getResourceURLwithAuth(parent);
                        Ti.Platform.openURL(url);
                        break;
                    case 1:
                        if (parent == null){
                            si.ui.alert_no_parent();
                            return;
                        }
                        uploadImageFromAlbum();
                        break;
                    case 2:
                        var windowEdit = si.ui.createEditWindow({
                            obj: parent,
                            // var _message = _new.global_id + '...' + _new.name + '...';
                            onsuccess: function(_obj){
                            // var _message = _obj.global_id + '...' + _obj.name + '...updating...';
                                loadParent(_obj.global_id);
                            }
                        });
                        si.app.tabGroup.activeTab.open(windowEdit, {
                            animated : true
                        });
                        break;
                    case 3:
                        var windowScan = si.nfc.createScanWindow({
                            obj: parent,
                            success : function(global_id) {
                                if (global_id) {
                                    loadParent(global_id);
                                }
                                windowScan.close();
                            },
                        });
                        si.app.tabGroup.activeTab.open(windowScan, {
                            animated : true
                        });
                        break;
                    case 4:
                        win.functions.printProcess(parent);
                        break;
                    default:
                        break;
                };
            });
            optionDialogForMenu.show();
        };

        win.functions.clickPrintButton = function(e) {
            if (!Ti.App.Properties.getBool('printLabel')){
                si.ui.myAlert({message: 'Turn label on'});
                return;
            }
            if (parent == null){
                si.ui.alert_no_parent();
                return;
            }
            
            if (Ti.App.Properties.getInt('tagWriter') === 1) {
                win.functions.printProcess(parent);
            } else {
                win.functions.printLabelfor(parent);
            }
        }

        win.functions.clickCameraButton = function(){
            Ti.API.info('clickCameraButton...');
            Ti.API.info(parent);
            if (parent == null){
                si.ui.alert_no_parent();
                return;
            }
            uploadImageFromCamera();
            //optionDialog.show();
        };

        win.functions.clickClipButton = function(){
            Ti.API.info('clickClipButton...');
            Ti.API.info(parent);
            if (parent == null){
                si.ui.alert_no_parent();
                return;
            }
            uploadImageFromAlbum();
        };

        win.functions.clickNewStoneButton = function(){
            var windowNewStone = si.ui.createNewStoneWindow({
                //var _message = _new.global_id + '...' + _new.name + '...';
                onsuccess: function(_new, e){
                    var _message = _new.global_id + '...' + _new.name + '...creating...';
                    si.sound_created.play();
                    //si.app.log.info(labelStatus.text + 'creating...ok');
                    //labelInfo.text = labelStatus.text + 'created\n' + labelInfo.text;
                    changeMode('ok', _message);
                    //labelStatus.text = 'Ready for scan'
                    if (parent){
                        addChild(_new.global_id, false);
                    }
                    if (Ti.App.Properties.getInt('tagWriter') === 1) {
                        win.functions.printProcess(_new);
                    } else {
                        win.functions.printLabelfor(_new);
                    }
                }
            });
            if (parent && parent._className === 'Specimen'){
                windowNewStone.name_field.value = parent.name;
            }
            si.app.tabGroup.activeTab.open(windowNewStone, {
                animated : true
            });            
        }

        win.functions.clickNewBoxButton = function(){
            var windowNewBox = si.ui.createNewBoxWindow({
                onsuccess: function(_new, e){
                    var _message = _new.global_id + '...' + _new.name + '...creating...';
                    si.sound_created.play();
                    //labelInfo.text = labelStatus.text + 'creating' + labelInfo.text;
                    //si.app.log.info(labelStatus.text + 'creating...ok');
                    //labelStatus.text = 'Ready for scan'
                    changeMode('ok', _message);
                    if (parent){
                        addChild(_new.global_id, false);
                    }
                    if (Ti.App.Properties.getInt('tagWriter') === 1) {
                        win.functions.printProcess(_new);
                    } else {
                        win.functions.printLabelfor(_new);
                    }
                }
            });
            si.app.tabGroup.activeTab.open(windowNewBox, {
                animated : true
            });            
        }

        win.functions.clickScanChildButton = function(){
            if (parent){
                scanChild();
            } else {
                si.ui.alert_no_parent();                
                //si.ui.myAlert({message:'Load parent first.', title:''});
            }            
        }

        win.functions.clickScanParentButton = function () {
            if (!si.config.Medusa.debug) {
                var _win = null;
                if (Ti.App.Properties.getInt('tagReader') === 2) {
                    _win = si.nfc.createScanWindow({
                        success : function() {
                            if (si.nfc.tagDataValue) {
                                loadParent(si.nfc.tagDataValue);
                            }
                            _win.close();
                        },
                        cancel : function() { _win.close(); },
                        error : function() { _win.close(); }
                    });
                } else {
                    _win = si.BarcodeReader.createScanWindow({
                        success : function(_data) {
                            if (_data && _data.barcode) {
                                loadParent(_data.barcode);
                            }
                            _win.close();
                        },
                        cancel : function() { _win.close(); },
                        error : function() { _win.close(); }
                    });
                }
                si.app.tabGroup.activeTab.open(
                    _win, {animated: true}
                );
            } else {
                setTimeout(function() {
                    loadParent(si.config.debug.parent_global_id);
                }, 1000);
            }
        };

        win.functions.clickSearchButton = function () {
            if (!si.config.Medusa.debug) {
                var _win = null;
                _win = si.ui.createSearchWindow({
                    type: 'Search',
                    onsuccess : function(_obj){
                        loadParent(_obj.global_id);
                    }
                });
                return _win;
            } else {
                setTimeout(function() {
                    loadParent(si.config.debug.parent_global_id);
                }, 1000);
            }
        };

        win.functions.clickHistoryButton = function () {
            if (!si.config.Medusa.debug) {
                var _win = null;
                _win = si.ui.createSearchWindow({
                    type: 'History',
                    onsuccess : function(_obj){
                        loadParent(_obj.global_id);
                    }
                });
                return _win;
            } else {
                setTimeout(function() {
                    loadParent(si.config.debug.parent_global_id);
                }, 1000);
            }
        };

        win.functions.printLabelfor = function(_record){
            Ti.API.info('printLabelfor...');
            var _message = _record.global_id + '...' + _record.name + '...label...';
            si.app.log.info(_message + 'sending...ok');
            _message += 'creating...';
            si.ui.android.printLabel(_record.global_id, _record.name, {
                onsuccess: function(e){
                    si.sound_label.play();
                    si.app.log.info(_message + 'ok');
                },
                onerror: function(e){
                    changeMode('error',_message);
                    //si.ui.showErrorDialog('No label created');
                }
            });
        };


        win.functions.printProcess = function(_record){
            Ti.API.info('printProcess...');
            var _message = _record.global_id + '...';
            si.app.log.info(_message + 'print...ok');
            _message += 'printcreating...';
            var win = si.nfc.createWriteWindow(_record.global_id, {
                onsuccess: function(){
                    si.sound_label.play();
                    si.app.log.info(_message + 'ok');
                },
                onerror: function(){
                    changeMode('error',_message);
                }
            });
            win.open();
        };


        function uploadImageFromAlbum() {
            Ti.Media.openPhotoGallery({
                success : function(event) {
                    if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                        setImageView(event.media);
                    }
                },
                cancel : function() {
                },
                error : function(error) {
                },
                allowEditing : true,
                mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
            });
        }

        function uploadImageFromCamera() {
            Ti.Media.showCamera({
                success : function(event) {
                    if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                        setImageView(event.media);
                    }
                },
                cancel : function() {
                },
                error : function(error) {
                },
                saveToPhotoGallery : true,
                allowEditing : true,
                mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
            });
        }

        function setImageView(_image) {
            Ti.API.info('image:' + _image);
            Ti.API.info('getFile:' + _image.getFile());
            Ti.API.info('getMimeType:' + _image.getNativePath());

//            labelStatus.text = 'Path:' + _image.getNativePath();

//            viewBody.remove(buttonScanChild);
//            imageView.setImage(_image);
//            viewBody.add(imageView);

            if (parent) {
                handleImageEvent(_image);
            }
        };

        function handleImageEvent(_image) {
            var username = Ti.App.Properties.getString('username');
            var password = Ti.App.Properties.getString('password');

            var _message = _image.getNativePath() + '...uploading...';
            //labelStatus.text = message;
            changeMode('loading', _message);

            si.model.medusa.uploadImage({
                data : _image,
                record : parent,
                username : username,
                password : password,
                onsuccess : function(_response) {
                    si.sound_created.play();
                    //labelStatus.text = message + '...\n';
                    //labelInfo.text = labelStatus.text + labelInfo.text;
                    //si.app.log.info(_message + 'ok');
                    changeMode('ok', _message)
                    loadParent(parent.global_id);
                },
                onerror : function(e) {
                    var dialog = Ti.UI.createAlertDialog({
                        message: e.error,
                        title: 'No image uploaded',
                    });
                    dialog.show();
                    //si.sound_error.play();
                    //labelStatus.text += 'ERROR\n';
                    //labelInfo.text = labelStatus.text + labelInfo.text;
                    //si.app.log.error(_message + 'error');                    
                    //labelStatus.text = 'Ready for scan';
                    changeMode('error', _message);
                }
            });
        }


        win.set_parent = function(_parent){
            parent = _parent;
        };

        function loadParent(_global_id) {
            Ti.API.info('loadParent...');
            var HISTORY_MAX_COUNT = 256;
            var username = Ti.App.Properties.getString('username');
            var password = Ti.App.Properties.getString('password');

            var _message = _global_id + '...loading...'
            changeMode('loading', _message);
            si.model.medusa.getRecordFromGlobalId({
                global_id : _global_id,
                username : username,
                password : password,
                onsuccess : function(_response) {
                    parent = _response;
                    viewParent.update(parent);
                    if (_global_id != Ti.App.Properties.getString('current_global_id')) {
                        Ti.App.Properties.setString('current_global_id', _global_id);
                        try {
                            si.sqlite.sisyphus.open();
                            si.sqlite.sisyphus.db.execute(
                                'delete from histories where global_id = ?',
                                parent.global_id
                            );
                            si.sqlite.sisyphus.db.execute(
                                'insert into histories (global_id, name, datum_type, description, loaded_at) values (?, ?, ?, ?, ?)',
                                parent.global_id,
                                parent.name,
                                parent._className,
                                parent['description'],
                                Date.now()
                            );
                            var histories = si.sqlite.sisyphus.db.execute('select * from histories order by loaded_at desc');
                            for (var i = 1; histories.isValidRow(); i++) {
                                if (i > HISTORY_MAX_COUNT) {
                                    si.sqlite.sisyphus.db.execute(
                                        'delete from histories where global_id = ?',
                                        histories.fieldByName('global_id')
                                    );
                                }
                                histories.next();
                            }
                            si.sqlite.sisyphus.close();
                        } catch (e) {
                            alert(e.message);
                        }
                    }
                    si.sound_reminder.play();
                    changeMode('ok', _message);
                },
                onerror : function(e) {
                    changeMode('error', _message);
                }
            });
        };

        function scanChild() {
            if (!si.config.Medusa.debug) {
                var _win = null;
                if (Ti.App.Properties.getInt('tagReader') === 2) {
                    _win = si.nfc.createScanWindow({
                        success: function() {
                            if (si.nfc.tagDataValue) {
                                addChild(si.nfc.tagDataValue, true);
                            }
                        }
                    });
                } else {
                    _win = si.BarcodeReader.createScanWindow({
                        success : function(_data) {
                            if (_data && _data.barcode) {
                                addChild(_data.barcode, true);
                            }
                        },
                        cancel : function() { },
                        error : function() { }
                    });
                }
                si.app.tabGroup.activeTab.open(
                    _win, {animated: true}
                );
            } else {
                // At debug, use static(dummy) global_id
                setTimeout(function() {
                    addChild(si.config.debug.child_global_id, false);
                }, 1000);
            }
        };

        function addChild(_global_id, isMultiScan) {
            var username = Ti.App.Properties.getString('username');
            var password = Ti.App.Properties.getString('password');
            var _message = _global_id + '...';
            changeMode('loading', _message);

            si.model.medusa.getRecordFromGlobalId({
                global_id : _global_id,
                username : username,
                password : password,
                onsuccess : function(_response) {
                    _message += _response.name + '...storing...';
                    si.model.medusa.createLink(parent, _response, {
                        username : username,
                        password : password,
                        onsuccess : function(_response2) {
                            //labelStatus.text += 'stored\n';
                            si.sound_newmail.play();
                            changeMode('ok', _message);
                            //si.app.log.info(labelStatus.text + 'ok');
                            //labelInfo.text = labelStatus.text + labelInfo.text;

                              //if (isMultiScan) {
                                //win.buttons.ScanChild.setEnabled(true);
                                //win.buttons.ScanChild.fireEvent('click');
                            //}
                            // else {
                            //     labelStatus.text = 'Ready for scan';
                            //     changeMode('ready');
                            // }
                        },
                        onerror : function(e) {
                            //labelStatus.text = labelStatus.text + 'ERROR\n';
                            changeMode('error', _message);
                            // si.app.log.error(labelStatus.text + 'error');
                            //si.sound_mailerror.play();
                            // changeMode('ready');
                        }
                    });
                },
                onerror : function(e) {
                    changeMode('error', _message);
                    //si.app.log.error(labelStatus.text + 'error');
                    //labelStatus.text = labelStatus.text + 'ERROR\n';
                    //si.sound_mailerror.play();
                    //changeMode('ready');
                }
            });
        };

        win.functions.clickFelicaLoginButton = function () {
            if (!si.config.Medusa.debug) {
                var _win = null;
                var staffId = "";
                var cardId = "";
                _win = si.nfc.createScanFelicaWindow({
                    onsuccess : function() {
                        if (si.nfc.tagDataValue) {
                            staffId = readFelicaData();
                            cardId = si.nfc.scannedTag.getId()
                            felicaLogin(cardId, staffId);
                            _win.close();
                        } else {
                            alert('si.nfc.tagDataValue is null');
                            _win.close();
                        }
                    },
                    cancel : function() { _win.close(); },
                    onerror : function() { _win.close(); },
                });
                si.app.tabGroup.activeTab.open(
                    _win, {animated: true}
                );
            } else {
                setTimeout(function() {
                    loadParent(si.config.debug.parent_global_id);
                }, 1000);
            }
        };

        var readFelicaData = function() {
            Ti.API.info('readFelicaData...');

            var data = si.nfc.tagDataValue;

            // read staffId
            var staffId = "";

            try {
                for(var i = 15; i <= 22; i++) {
                    staffId += String.fromCharCode(data[i]);
                }
            } catch(e) {
                alert('Felica data is Invalid.');
                staffId = "";
            }

            return staffId;
        };

        var felicaLogin = function(cardId, staffId) {
            isDone = false;
            Ti.API.info('Login by Felica');

            if (cardId === '' || staffId === '') {
                si.ui.myAlert({message: 'Invalid IC Card'});
                return;
            }

            var server = Ti.App.Properties.getString('server');

            activityIndicator.show();
            si.model.medusa.getToken({
                card_id : cardId,
                staff_id : staffId,
                onsuccess : function(response) {
                    Ti.App.Properties.setString('cardId', cardId);
                    Ti.App.Properties.setString('staffId', staffId);
                    Ti.App.Properties.setString('token', response.token);
                    si.app.clearData();
                    if (response.box_global_id){
                        Ti.App.Properties.setString('current_box_global_id', response.box_global_id);
                    } else {
                        Ti.App.Properties.setString('current_box_global_id', null);
                    }
                    activityIndicator.hide();
                    si.ui.alert_simple('Login successful.');
                    isDone = true;
                    win.close();
                },
                onerror : function(e) {
                    activityIndicator.hide();
                    isDone = true;
                    var _message = 'IC Card Login failed';
                    si.ui.myAlert({message: _message});
                    si.ui.showErrorDialog(_message);
                }
            });
        };

        win.addChild = addChild;
        win.loadParent = loadParent;
        win.labelStatus = labelStatus;
        return win;
    };
})();
