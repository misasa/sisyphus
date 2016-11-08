(function() {
    si.ui = {};

    si.ui.myAlert = function(_args){
        var dialog = Ti.UI.createAlertDialog({
            message: _args.message,
            title: _args.title || '',
            //ok: 'OK'
        });
        //si.sound_attention.play();
        si.sound_reminder.play();      
        dialog.show();
    };

    si.ui.alert_simple = function(message){
        var dialog = Ti.UI.createAlertDialog({
            message: message,
            title: '',
            //ok: 'OK'
        });
        //si.sound_attention.play();
        si.sound_reminder.play();      
        dialog.show();
    };

    si.ui.showErrorDialog = function(message){
        var dialog = Ti.UI.createAlertDialog({
            message: message,
            title: '',
            //ok: 'OK'
        });
        si.sound_mailerror.play();
        dialog.show();
    };


    si.ui.alert_no_parent = function(){
        si.ui.myAlert({message:'Load parent first', title:''});
    };

    si.ui.error_print = function(e){
        //si.ui.myAlert({message: e.message, title:''});
        si.sound_error.play();
        var dialog = Ti.UI.createAlertDialog({
            message: e.error,
            title: 'No label created',
            //ok: 'OK'
        });
        dialog.show();
    }

    si.ui.createApplicationTabGroup = function(_args) {
        var tabGroup = Ti.UI.createTabGroup({
            height : 300
        });
        
        var tabMain = Ti.UI.createTab({
            title : 'Main',
            //icon : '/images/plus.png',
            window : si.ui.createAddChildWindow()
        });

        var tabSettings = Ti.UI.createTab({
            title : 'Settings',
            //icon : '/images/preferences.png',
            window : si.ui.createSettingsWindow()
        });

        var tabHelp = Ti.UI.createTab({
            title : 'Info',
            //icon : '/images/preferences.png',
            window : si.ui.createInfoWindow()
        });

        tabGroup.addEventListener('open', function(e) {
        Ti.API.info('window open...');
        });

        tabGroup.addTab(tabMain);
        tabGroup.addTab(tabSettings);
        tabGroup.addTab(tabHelp);
        return tabGroup;
    };

    si.ui.createInputRow = function(_title, _input, opts){
        var _row = Ti.UI.createView({
             layout : 'vertical',
             height : Ti.UI.SIZE,
        });
        var _label = Ti.UI.createLabel({left: 5, text:_title});
        _row.add(_label);
        _row.add(_input);
        return _row;
    };

    si.ui.createInputTableRow = function(_title, _input, opts){
        var _row = Ti.UI.createTableViewRow({
             layout : 'vertical',
             height : Ti.UI.SIZE,
        });
        var _label = Ti.UI.createLabel({left: 5, text:_title});
        _row.add(_label);
        _row.add(_input);
        return _row;
    };

    si.ui.createPickerInput = function(_data, _id){
        var picker = Ti.UI.createPicker({
            width: Ti.UI.FILL,
            //color: 'red'
        });
        var data = [Ti.UI.createPickerRow({title: '', id: null})];
        picker.value = null;
        picker.add(data);
        var selected_id;
        if (_data){
            for(var i=0; i<_data.length; i++){
                var _obj = _data[i];
                row = Ti.UI.createPickerRow(_obj);
                picker.add(row);
                if (_obj.id == _id){
                    Ti.API.info("find default selection!");
                    Ti.API.info(_obj);
                    selected_id = i + 1;
                }
            }
        }

        picker.selectionIndicator = true;
        if (selected_id){
            picker.setSelectedRow(0, selected_id,false);
            picker.value = _id;
        }


        picker.addEventListener('change', function(e){
            picker.value = e.row.id;
        });

        return picker;  
    };

    si.ui.createInputPrint = function(opts){
        var view = Ti.UI.createView({
            height : Ti.UI.SIZE,
            //backgroundColor : 'red',
            layout : 'horizontal'
        });

        var imgDimensions = 30;
        var text = Ti.UI.createTextField(opts);


        var imageButtonView = Ti.UI.createView({
            width : 60,
            height : 60
        });
        var imageView = Ti.UI.createImageView({
            image : '/images/glyphicons-16-print.png',
            width : imgDimensions,
            height : imgDimensions            
        });


        var button = Ti.UI.createButton({
            title : '',
            width : 60,
            height : 60
        });

        button.addEventListener('click', function(e) {
            if (!Ti.App.Properties.getBool('printLabel')){
                si.ui.alert_simple('Turn label on');
                return;
            }
 
            var string = 'hello world';
            if (text.value == '') {
                string = 'print test';
            } else {
                string = text.value;
            }
            si.ui.android.printLabel(string, string);
        });
        imageView.addEventListener('click', function(e) {
            button.fireEvent('click', e);
        });


        var view_left = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : '90%',
            left : 0,
            //backgroundColor : 'orange',
            //layout : 'vertical'
        });
        var view_right = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : '10%',
            left : 0,
            //backgroundColor : 'yellow',
            layout : 'horizontal'
        });

        view.add(view_left);
        view.add(view_right);
        view_left.add(text);
        view_right.add(imageButtonView);
        imageButtonView.add(button);
        imageButtonView.add(imageView);
        //view_right.add(button);
        //view_right.add(imageView);

        view.set_value = function(value){
            text.value = value;
        }
        view.input = text;

        return view;
    }

    si.ui.createScanInput = function(opts){
        var view = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
        });

        var text = Ti.UI.createTextField(opts);


        var imageButton = si.ui.createImageButtonView('/images/glyphicons-259-qrcode.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
        });
        imageButton.button.addEventListener('click', function(e) {
            if (!si.config.Medusa.debug) {
                var _win = null;
                if (Ti.App.Properties.getInt('tagReader') === 2) {
                    _win = si.nfc.createScanWindow({
                        success : function() {
                            if (si.nfc.tagDataValue) {
                                text.value = si.nfc.tagDataValue;
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
                                text.value = _data.barcode;
                            }
                            _win.close();
                        },
                        cancel : function() { _win.close(); },
                        error : function() { _win.close(); }
                    });
                }
                _win.open();                
            }
        });


        var view_left = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            right : imageButton.width,
        });
        var view_right = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : Ti.UI.SIZE,
            right : 0,
        });

        view.add(view_left);
        view.add(view_right);
        view_left.add(text);
        view_right.add(imageButton);

        view.set_value = function(value){
            text.value = value;
        }
        view.input = text;

        return view;
    }

    si.ui.createMyImageView = function(opts){
        if ( typeof opts == 'undefined') {
            opts = {};
        };
        if (!('width' in opts)) {
            opts.width = '100%';
        }
        if (!('height' in opts)) {
            opts.height = '100%';
        }

        var view = Ti.UI.createView({
            width : opts.width,
            height : Ti.UI.SIZE,
            layout : 'horizontal',
            //backgroundColor : 'yellow'        
        });

        var optionDialog = Ti.UI.createOptionDialog({
            options : ['Add snap shot', 'Add local file'],
            //cancel : 2,
            title : ''
        });
        optionDialog.addEventListener('click', function(e) {
            switch (e.index) {
                case 0:
                    Ti.Media.showCamera({
                        success : function(event) {
                            if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                                view.set_image(event.media);
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
                    break;
                case 1:
                    Ti.Media.openPhotoGallery({
                        success : function(event) {
                            if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                                view.set_image(event.media);
                            }
                        },
                        cancel : function() {
                        },
                        error : function(error) {
                        },
                        allowEditing : true,
                        mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
                    });
                    break;
                default:
                    break;
            };
        });

        if (!opts.image){
            var selectPhotoView = si.ui.createImageButtonView('/images/glyphicons-63-paperclip.png', {
                width : 90,
                height : 90,
                imgDimensions : 30
            });

            selectPhotoView.button.addEventListener('click', function(e) {
                //optionDialog.show();
                    Ti.Media.openPhotoGallery({
                        success : function(event) {
                            if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                                view.set_image(event.media);
                            }
                        },
                        cancel : function() {
                        },
                        error : function(error) {
                        },
                        allowEditing : true,
                        mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
                    });
            });

            var takePhotoView = si.ui.createImageButtonView('/images/glyphicons-12-camera.png', {
                width : 90,
                height : 90,
                imgDimensions : 30
            });

            takePhotoView.button.addEventListener('click', function(e) {
                    Ti.Media.showCamera({
                        success : function(event) {
                            if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                                view.set_image(event.media);
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
            });

            view.add(takePhotoView);
            view.add(selectPhotoView);
        } else {
            view.set_image(opts.image);
        }

        view.set_image = function(_image){
            Ti.API.info("set_image...");
            Ti.API.info(_image);
            view.removeAllChildren();
            // var flame = Ti.UI.createView({
            //     height : '95%',
            //     width : '95%',
            //     backgroundColor : 'black'
            // });
            var imageView = Ti.UI.createImageView({
                height : 90,
                //center : { x: '50%', y : '50%'},
                image : _image
            });
            imageView.addEventListener('click', function(e) {
                //optionDialog.show();
                var w = si.ui.createImageWindow(_image);
                w.open({
                      modal : true
                });                
            });
            //view.add(flame);
            //flame.add(imageView);
            view.add(imageView);
            view.add(takePhotoView);
            view.add(selectPhotoView);

            view.image = _image;
        }

        return view;
    };

    si.ui.createImageWindow = function(_image, opts){
        var win = Ti.UI.createWindow({
            title : 'Image',
            backgroundColor : 'black',
            barColor : '#336699',
            orientationModes : [Ti.UI.PORTRAIT],
            backButtonTitle : 'Back',
            //layout : 'vertical'
        });
        Ti.API.info(_image);
        var imageView = Ti.UI.createImageView({
            image : _image
        });
        win.add(imageView);
        return win;
    };

    si.ui.createButton = function(_opts){
        var _button = Ti.UI.createButton(_opts);
        if ('onclick' in _opts){
            _button.addEventListener('click', function(e){
                _opts.onclick();
            });            
        }
        return _button;
    }

    si.ui.createImageButtonView = function(_image, opts) {
        if ( typeof opts == 'undefined') {
            opts = {};
        };
        if (!('width' in opts)) {
            opts.width = '100%';
        }
        if (!('height' in opts)) {
            opts.height = '100%';
        }
        if (!('imgDimensions' in opts)) {
            opts.imgDimensions = 45;
        }


        var view = Ti.UI.createView({
            width: opts.width,
            height: opts.height,
            //backgroundColor : 'red'
        });
        //return view;
        var button = Ti.UI.createButton({
            title : '',
            //backgroundColor : 'white',
            width : opts.width,
            height : opts.height,
        });
        if ('onclick' in opts){
            button.addEventListener('click', function(e){
                opts.onclick();
            });            
        }

        view.add(button);

        var imageView = Ti.UI.createImageView({
            image : _image,
            //backgroundColor : 'blue',
            width : opts.imgDimensions,
            height : opts.imgDimensions            
        });
        imageView.addEventListener('click', function(e) {
            Ti.API.info('image clicked');
            if (button.enabled){
                button.fireEvent('click', e);
            }
        });
        view.add(imageView);

        var self = view;
        self.button = button;
        self.imageView = imageView;
        self.setEnabled = function(value) {
            self.button.setEnabled(value);
            self.imageView.setTouchEnabled(value);
        };
        return self;
    };

    si.ui.createInputOrScanWindow = function(opts){
        if ( typeof opts === 'undefined') {
            opts = {};
        }

        var win = Ti.UI.createWindow({
            title : opts.title || 'ScanInput',
//            backgroundColor : 'white'
        });

       var viewBase = Ti.UI.createView({
//            backgroundColor : 'white',
            top : 0,
            width : '100%',
            height : '100%',
            layout : 'vertical'
        });

        var viewHeader = Ti.UI.createView({
//            backgroundColor : 'white',
            height : '25%'
        });

        var viewBody = Ti.UI.createView({
//            backgroundColor : 'white',
            top : 0,
            top : 0,
            height : '85%'
        });


        var scan_input = si.ui.createScanInput(si.combine($$.TextField, {
            value : opts.value || '',
            keyboardType : opts.keyboardType || Ti.UI.KEYBOARD_DEFAULT,
            hintText : opts.hintText || ''
        }));

        var cancel_button = Ti.UI.createButton(si.combine($$.LeftBottomButton, {
            top : 0,
            title : 'Cancel',
        }));

        cancel_button.addEventListener('click', function() {
            win.close();
        });


        var save_button = Ti.UI.createButton(si.combine($$.RightBottomButton, {
            top : 0,
            title : 'OK',
        }));

        save_button.addEventListener('click', function() {
            opts.save(scan_input.input.value);
        });

        win.save_button = save_button;

        win.add(viewBase);
        viewBase.add(viewHeader);
        viewBase.add(viewBody);

        viewHeader.add(scan_input);
        viewBody.add(cancel_button);
        viewBody.add(save_button);

        win.set_value = function(value) {
            scan_input.set_value(value);
        }
        win.input = scan_input.input;

        return win;        
    };

    si.ui.createViewParent = function(_record, opts) {
        if ( typeof opts === 'undefined') {
            opts = {};
        }
        if (!('width' in opts)) {
            opts.width = '100%';
        }
        if (!('height' in opts)) {
            opts.height = '100%';
        }
        if (!('imgDimensions' in opts)) {
            opts.imgDimensions = 100;
        }

        spacing = 0;
        nameHeight = 90;
        metaHeight = 14;
        var view = Ti.UI.createView({
            width : opts.width,
            height : opts.height,
            //layout : 'horizontal',
//            backgroundColor: 'white'
        });
        // var left = Ti.UI.createView({
        //     width : '70%',
        //     height : Ti.UI.SIZE,
        //     //layout : 'vertical',
        //     backgroundColor: 'yellow'
        // });

        // var right = Ti.UI.createView({
        //     width : '30%',
        //     height : Ti.UI.SIZE,
        //     backgroundColor: 'blue'
        // });
        //view.add(left);
        //view.add(right);
        var image_path;
        var imageView = Ti.UI.createImageView({
//            top : spacing,
//            left : spacing,
            right : 0,
            height : opts.imgDimensions,
//            width : opts.imgDimensions,
            //backgroundColor : '#000000',
            image : null
        });
        imageView.addEventListener('click', function(e) {
            //optionDialog.show();
            if (image_path){
                var w = si.ui.createImageWindow(image_path);
                w.open({
                      modal : true
                });
            }
        });

        view.add(imageView);
        //right.add(imageView);

        var avatarOffset = spacing * 2 + opts.imgDimensions;

        var labelMeta = Ti.UI.createLabel(si.combine($$.smallText, {
            text : '',
            top : spacing,
            //left : avatarOffset,
            left : spacing,
            right : spacing,
            height : 'auto',
            textAlign : 'left'
        }));
        //left.add(labelMeta);
        view.add(labelMeta);
        var labelName = Ti.UI.createLabel(si.combine($$.boldHeaderText, {
            text : '',
            top : metaHeight + 10,
            left : spacing,
            height : nameHeight
        }));
        //left.add(labelName);
        view.add(labelName);

        update = function(_record) {
            if (_record == null) {
                labelMeta.text = '';
                labelName.text = '';
                imageView.image = '';
                return;
            }
            labelMeta.text = _record.global_id;
            labelName.text = _record.name;
            //!!!!!!!!!画像のパスの取得は要検討!!!!!!!!!!!!!!!!!!!!!!
            if (_record.image_path) {
                //Ti.API.info("image_path");
                //Ti.API.info(_record);
                //Ti.API.info(_record.image_path);
                //var _path = Ti.App.Properties.getString('server') + '/' + _record.image_path;
                var _url = si.imageURL(_record.image_path);
                //Ti.API.info(_url);
                imageView.image = si.imageURL(_record.thumbnail_path);
                image_path = si.imageURL(_record.original_path);
            } else {
                imageView.image = '';
                image_path = null;
            }
        };

        var self = view;
        self.imageView = imageView;
        self.labelMeta = labelMeta;
        self.labelName = labelName;
        self.update = update;
        self.update(_record);
        return self;
    };

    si.ui.android = {};

    si.ui.android.printServerURL = function(){
        var printServer = Ti.App.Properties.getString('printServer');
        var url = printServer;
        if (printServer.match(/^\w+:\/\//) == null) {
            url = 'http://' + url;
        }

        if (printServer.match(/\/$/) == null) {
            url = url + '/';
        }

        return url;
    };

    si.ui.android.printLabel = function(_global_id, _name,_args) {
        if (!Ti.App.Properties.getBool('printLabel')){
            return;
        }
        Ti.API.info('printLabel in ');
        var client = Ti.Network.createHTTPClient({
            onload : function(e) {
                Ti.API.info('print global_id : ' + _global_id + ' name : ' + _name);
                Ti.API.info('onload'); 
                _args.onsuccess(e);
            },
            onerror : function(e) {
                Ti.API.info('onerror');
                //si.ui.alert_simple('print error : ' + e.error);
                _args.onerror(e);
            },
            timeout : 15000 // in milliseconds
        });
        //Ti.API.info(client);
        //var printServer = Ti.App.Properties.getString('printServer');
        var formatArchiveUrl = Ti.App.Properties.getString('printFormatUrl');
        var myAppDir = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory);
        var sdcardDir = myAppDir.getParent();
        //Ti.API.info('sdcardDir : ' + sdcardDir.nativePath);
        //var url = 'http://localhost:8080/Format/Print?';
        //var url = printServer;
        var url = si.ui.android.printServerURL();
        url += 'Format/Print?';
        url += '__format_archive_url=' + formatArchiveUrl;
        url += '&__format_id_number=1';
        url += '&UID=' + _global_id;
//        url += '&UID_QRCODE=' + _global_id;
        url += '&NAME=' + _name;
        url += '&SET=1';
//        url += '&(発行枚数)=1';
        Ti.API.info('url:' + url);

        client.open('GET', url);
        client.send();
    };

})();

Ti.include('/sisyphus/ui/styles.js');
Ti.include('/sisyphus/ui/InfoWindow.js');
Ti.include('/sisyphus/ui/LoginWindow.js');
Ti.include('/sisyphus/ui/SettingsWindow.js');
Ti.include('/sisyphus/ui/LabelPrintSettingWindow.js');
//Ti.include('/sisyphus/ui/PrintServerSettingWindow.js');
//Ti.include('/sisyphus/ui/PrintFormatUrlSettingWindow.js');
//Ti.include('/sisyphus/ui/ServerSettingWindow.js');
Ti.include('/sisyphus/ui/NewStoneWindow.js');
Ti.include('/sisyphus/ui/NewBoxWindow.js');
Ti.include('/sisyphus/ui/EditWindow.js');
Ti.include('/sisyphus/ui/SearchWindow.js');
//if (Ti.Platform.name == 'iPhone OS') {
//        Ti.include('/sisyphus/ui/AddChildWindow.js');
//}

if (Ti.Platform.osname == 'android') {
    Ti.include('/sisyphus/ui/android/AddChildWindow.js');
}
