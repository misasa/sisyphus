(function() {
    si.ui.android = {};

    si.ui.android.printLabel = function(_global_id, _name) {
        Ti.API.info('printLabel in ');
        var client = Ti.Network.createHTTPClient({
            onload : function() {
                Ti.API.info('print global_id : ' + _global_id + ' name : ' + _name);
            },
            onerror : function(e) {
                alert('print error : ' + e.error);
            },
            timeout : 30000 // in milliseconds
        });

        var formatArchiveUrl = Ti.App.Properties.getString('printFormatUrl');
        var myAppDir = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory);
        var sdcardDir = myAppDir.getParent();
        Ti.API.info('sdcardDir : ' + sdcardDir.nativePath);
        var url = 'http://localhost:8080/Format/Print?';
        url += '__format_archive_url=' + formatArchiveUrl;
        url += '&__format_id_number=1';
        url += '&UID=' + _global_id;
        url += '&UID_QRCODE=' + _global_id;
        url += '&NAME=' + _name;
        url += '&(発行枚数)=1';
        Ti.API.info('url:' + url);

        client.open('GET', url);
        client.send();
    };

    si.ui.createAddChildWindow = function() {
        var parent = null;
        var isMultiScan = !si.config.Medusa.debug;

        var win = Ti.UI.createWindow({
            title : 'Main',
            backgroundColor : 'orange',
            barColor : '#336699',
            orientationModes : [Ti.UI.PORTRAIT],
            backButtonTitle : 'Back',
            layout : 'vertical'
        });
        win.addEventListener('focus', function(e) {

            current_global_id = Ti.App.Properties.getString('current_global_id');
            if (parent == null) {
                if (current_global_id != null) {
                    loadParent(current_global_id);
                }
            } else {
                if (parent.global_id != current_global_id) {
                    loadParent(current_global_id);
                }
            }
        });

        var viewBase = Ti.UI.createView({
            backgroundColor : 'blue',
            top : 0,
            width : '100%',
            height : '100%',
            layout : 'vertical'
        });

        var viewHeader = Ti.UI.createView({
            backgroundColor : 'red',
            top : 0,
            height : '15%'
        });

        var viewBody = Ti.UI.createView({
            backgroundColor : 'white',
            top : 0,
            top : 0,
            height : '85%'
        });

        var viewHeaderLeft = Ti.UI.createView({
            height : '100%',
            width : '70%',
            top : 0,
            left : 0,
            backgroundColor : 'white',
        });

        var viewHeaderRight = Ti.UI.createView({
            height : '100%',
            width : '30%',
            top : 0,
            right : 0,
            backgroundColor : 'white',
            layout : 'horizontal'
        });

        var imageButtonViewAdd = si.ui.createImageButtonView('/images/plus.png', {
            Top : '5%',
            width : '30%',
            height : '90%'
        });
        imageButtonViewAdd.button.addEventListener('click', function(e) {
            var windowSNewStone = si.ui.createNewStoneWindow();
            si.app.tabGroup.activeTab.open(windowSNewStone, {
                animated : true
            });
        });

        var imageButtonViewHome = si.ui.createImageButtonView('/images/home.png', {
            Top : '5%',
            width : '30%',
            height : '90%'
        });
        imageButtonViewHome.button.addEventListener('click', function(e) {
            default_global_id = Ti.App.Properties.getString('current_box_global_id');
            loadParent(default_global_id);
        });

        var optionDialogForMenu = Ti.UI.createOptionDialog({
            options : ['print label', 'add a snap shot', 'add a local file', 'cancel'],
            cancel : 3,
            title : ''
        });
        optionDialogForMenu.addEventListener('click', function(e) {
            switch (e.index) {
                case 0:
                    if (parent) {
                        si.ui.android.printLabel(parent.global_id, parent.name);
                    } else {
                        alert('please load parent first');
                    }
                    break;
                case 1:
                    if (parent) {
                        uploadImageFromCamera();
                    } else {
                        alert('please load parent first');
                    }
                    break;
                case 2:
                    if (parent) {
                        uploadImageFromAlbum();
                    } else {
                        alert('please load parent first');
                    }
                    break;
                default:
                    break;
            };
        });

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

            labelStatus.text = 'Path:' + _image.getNativePath();

            viewBody.remove(buttonScanChild);
            imageView.setImage(_image);
            viewBody.add(imageView);

            if (parent) {
                handleImageEvent(_image);
            }
        };

        function handleImageEvent(_image) {
            var username = Ti.App.Properties.getString('username');
            var password = Ti.App.Properties.getString('password');

            labelStatus.text = 'uploading ' + _image.getNativePath() + ' ...';
            changeMode('loading');

            si.model.medusa.uploadImage({
                data : _image,
                record : parent,
                username : username,
                password : password,
                onsuccess : function(_response) {
                    labelStatus.text += ' OK';

                    viewBody.remove(imageView);
                    viewBody.add(buttonScanChild);
                    loadParent(parent.global_id);
                },
                onerror : function(e) {
                    labelStatus.text += 'ERROR\n';
                    labelInfo.text = labelStatus.text + labelInfo.text;

                    viewBody.remove(imageView);
                    viewBody.add(buttonScanChild);

                    labelStatus.text = 'ready for scan';
                    changeMode('ready');
                }
            });
        }

        var imageButtonViewMenu = si.ui.createImageButtonView('/images/19-gear.png', {
            Top : '5%',
            width : '30%',
            height : '90%'
        });
        imageButtonViewMenu.button.addEventListener('click', function(e) {
            optionDialogForMenu.show();
        });

        var imageButtonViewScanParent = si.ui.createImageButtonView('/images/01-refresh.png', {
            Top : '5%',
            width : '100%',
            height : '90%'
        });
        imageButtonViewScanParent.button.addEventListener('click', function(e) {
            scanAndLoadParent();
        });

        var viewParent = si.ui.createViewParent(null, {
            width : '100%',
            height : '100%',
            imgDimensions : 80,
        });
        viewParent.addEventListener('click', function(e) {
            scanAndLoadParent();
        });

        var scrollView = Ti.UI.createScrollView({
            top : '2%',
            contentHeight : 'auto',
            contentWidth : 'auto',
            backgroundColor : 'white',
            width : '80%',
            left : '10%',
            height : '25%',
            borderWidth : 1,
            borderRadius : 0,
            scrollType : 'vertical'
        });

        var labelInfo = Ti.UI.createLabel(si.combine($$.smallText, {
            text : '',
            top : 0,
            left : 0,
            width : '100%',
            height : 'auto',
            textAlign : 'left'
        }));

        var imageView = Ti.UI.createImageView({
            backgroundColor : 'black',
            top : '30%',
            width : '80%',
            height : '63%',
        });

        var buttonScanChild = Ti.UI.createButton(si.combine($$.NormalButton, {
            title : '+',
            width : '100%',
            backgroundColor : 'white',
            borderWidth : 1,
            borderColor : 'black',
            borderRadius : 10,
            top : '30%',
            width : '80%',
            height : '63%',
        }));
        buttonScanChild.addEventListener('click', function() {
            scanChild();
        });

        var labelStatus = Ti.UI.createLabel(si.combine($$.smallText, {
            text : '',
            textAlign : 'left',
            top : '95%',
            left : '3%',
            width : '90%',
            borderWidth : 1,
        }));

        function scanAndLoadParent() {
            if (!si.config.Medusa.debug) {
                si.TiBar.scan({
                    configure : si.config.TiBar,
                    success : function(_data) {
                        if (_data && _data.barcode) {
                            loadParent(_data.barcode);
                        }
                    },
                    cancel : function() {
                    },
                    error : function() {
                    }
                });
            } else {
                setTimeout(function() {
                    loadParent(si.config.debug.parent_global_id);
                }, 1000);
            }
        };

        function loadParent(_global_id) {
            var username = Ti.App.Properties.getString('username');
            var password = Ti.App.Properties.getString('password');
            changeMode('loading');

            labelInfo.text = '';
            labelStatus.text = 'interacting with ' + Ti.App.Properties.getString('server');

            si.model.medusa.getRecordFromGlobalId({
                global_id : _global_id,
                username : username,
                password : password,
                onsuccess : function(_response) {
                    parent = _response;
                    viewParent.update(parent);

                    if (_global_id != Ti.App.Properties.getString('current_global_id')) {
                        Ti.App.Properties.setString('current_global_id', _global_id);
                    }
                    if (viewHeaderLeft.children.contains(imageButtonViewScanParent)) {
                        viewHeaderLeft.remove(imageButtonViewScanParent);
                    }
                    if (!viewHeaderLeft.children.contains(viewParent)) {
                        viewHeaderLeft.add(viewParent);
                    }
                    si.sound_newmail.play();
                    labelStatus.text = 'ready for scan';
                    changeMode('ready');
                },
                onerror : function(e) {
                    if (!viewHeaderLeft.children.contains(imageButtonViewScanParent)) {
                        viewHeaderLeft.add(imageButtonViewScanParent);
                    }
                    if (viewHeaderLeft.children.contains(viewParent)) {
                        viewHeaderLeft.remove(viewParent);
                    }
                    labelStatus.text = 'ERROR';
                }
            });
        };

        function scanChild() {
            if (!si.config.Medusa.debug) {
                si.TiBar.scan({
                    configure : si.config.TiBar,
                    success : function(_data) {
                        if (_data && _data.barcode) {
                            addChild(_data.barcode);
                        }
                    },
                    cancel : function() {
                    },
                    error : function() {
                    }
                });
            } else {
                setTimeout(function() {
                    addChild(si.config.debug.child_global_id);
                }, 1000);
            }
        };

        function addChild(_global_id) {
            var username = Ti.App.Properties.getString('username');
            var password = Ti.App.Properties.getString('password');

            changeMode('loading');
            labelStatus.text = _global_id + '...';

            si.model.medusa.getRecordFromGlobalId({
                global_id : _global_id,
                username : username,
                password : password,
                onsuccess : function(_response) {
                    labelStatus.text += _response.name + '...';
                    si.model.medusa.createLink(parent, _response, {
                        username : username,
                        password : password,
                        onsuccess : function(_response2) {
                            labelStatus.text += 'OK\n';
                            si.sound_newmail.play();
                            labelInfo.text = labelStatus.text + labelInfo.text;

                            if (isMultiScan) {
                                buttonScanChild.setEnabled(true);
                                buttonScanChild.fireEvent('click');
                            } else {
                                labelStatus.text = 'ready for scan';
                                changeMode('ready');
                            }
                        },
                        onerror : function(e) {
                            labelStatus.text = labelStatus.text + 'ERROR\n';
                            si.sound_mailerror.play();
                        }
                    });
                },
                onerror : function(e) {
                    labelStatus.text = labelStatus.text + 'ERROR\n';
                    si.sound_mailerror.play();
                }
            });
        };

        function changeMode(_mode) {
            var isEnabled = true;
            if (_mode == 'loading') {
                isEnabled = false;
            } else if (_mode == 'ready') {
                isEnabled = true;
            } else {
                Ti.API.warn('changeMode unkown mode : ' + _mode );
            }
            viewParent.setEnabled(isEnabled);
            buttonScanChild.setEnabled(isEnabled);

            imageButtonViewHome.setEnabled(isEnabled);
            imageButtonViewMenu.setEnabled(isEnabled);
            viewParent.setEnabled(isEnabled);
        };

        win.add(viewBase);
        viewBase.add(viewHeader);
        viewHeader.add(viewHeaderLeft);
        viewHeaderLeft.add(imageButtonViewScanParent);
        viewHeader.add(viewHeaderRight);
        viewHeaderRight.add(imageButtonViewAdd);
        viewHeaderRight.add(imageButtonViewHome);
        viewHeaderRight.add(imageButtonViewMenu);
        viewBase.add(viewBody);
        viewBody.add(scrollView);
        scrollView.add(labelInfo);
        viewBody.add(buttonScanChild);
        viewBody.add(labelStatus);

        return win;
    };
})();
