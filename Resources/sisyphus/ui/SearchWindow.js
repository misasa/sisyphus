(function() {

    si.ui.createSearchWindow = function(_args) {
        var isDone = null;
        var win = Ti.UI.createWindow({
            title : 'Search',
        });

        win.buttons = {};
        win.buttons.Close = si.ui.createImageButtonView('/images/glyphicons-208-remove-2.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) { win.close() }
        });
        win.buttons.Close.left = 0;

        win.buttons.Save = si.ui.createImageButtonView('/images/glyphicons-415-disk-save.png', {
            right : 0,
            width : 90,
            height : 90,
            imgDimensions : 30,
            onclick : function(e) { win.save() }
        });
        win.buttons.Save.right = 0;

       var viewBase = Ti.UI.createView({
            top : 0,
            width : '100%',
            height : '100%',
            layout : 'vertical'
        });

        var viewHeader = Ti.UI.createView({
            height : Ti.UI.SIZE,
            width : Ti.UI.FILL,
        });

        var viewHeaderLeft = Ti.UI.createView({
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            left : 0,
            top : 0,
            layout : 'horizontal'
        });

        var viewHeaderRight = Ti.UI.createView({
            width : Ti.UI.SIZE,
            height : Ti.UI.SIZE,
            right : 0,
            top : 0,
            layout : 'horizontal'
        });

        var viewBody = Ti.UI.createView({
            height : '100%',
            layout : 'vertical'
        });


        var activityIndicator = Ti.UI.createActivityIndicator({
            style : Ti.UI.ActivityIndicatorStyle.BIG,
        });

        var server = si.ui.createScanInput(si.combine($$.TextField, {
            value: Ti.App.Properties.getString('server'),
            keyboardType : Ti.UI.KEYBOARD_URL,
            hintText : 'input URI',
            width : '100%',
        }));

        var username = si.ui.createScanInput(si.combine($$.TextField, {
            width : '100%',
            value : Ti.App.Properties.getString('username'),
            keyboardType : Ti.UI.KEYBOARD_DEFAULT,
            hintText : 'input user name'
        }));


        var password = si.ui.createScanInput(si.combine($$.TextField, {
            value : Ti.App.Properties.getString('password'),
            passwordMask : true,
            width : '100%',
            //top : '30%',
            hintText : 'input password'
        }));

        win.save = function(){
            isDone = false;
            Ti.API.info('click');
            password.blur();
            if (server.input.value == '' || username.input.value == '' || password.input.value == '') {
                si.ui.myAlert({message: 'Input URL, Username, and Password'});
                return;
            }

            var server_old = Ti.App.Properties.getString('server');
            Ti.App.Properties.setString('server',server.input.value);

            activityIndicator.show();
            si.model.medusa.getAccountInfo({
                username : username.input.value,
                password : password.input.value,
                onsuccess : function(response) {
                    Ti.App.Properties.setString('username', username.input.value);
                    Ti.App.Properties.setString('password', password.input.value);
                    si.app.clearData();
                    if (response.box_global_id){
                        Ti.App.Properties.setString('current_box_global_id', response.box_global_id);
                    } else {
                        Ti.App.Properties.setString('current_box_global_id', null);
                    }
                    activityIndicator.hide();
                    win.close();
                    isDone = true;
                    _args.onsuccess();
                },
                onerror : function(e) {
                    activityIndicator.hide();
                    isDone = true;
                    Ti.App.Properties.setString('server', server_old);
                    var _message = 'Login failed';
                    si.ui.showErrorDialog(_message);
                }
            });
        };

        // TODO: レイアウト、項目の変更
        var table = Ti.UI.createScrollView({
            contentWidth: 'auto',
            contentHeight: 'auto',
            showVerticalScrollIndicator: true,
            height : Ti.UI.SIZE,
            width : Ti.UI.FILL,
            layout : 'vertical'
        });
        table.add(si.ui.createInputRow("URL", server, {}));
        table.add(si.ui.createInputRow("Username", username, {}));
        table.add(si.ui.createInputRow("Password", password, {}));

        win.add(viewBase);
        viewBase.add(viewHeader);
        viewBase.add(viewBody);
        viewHeader.add(viewHeaderLeft);
        viewHeaderLeft.add(win.buttons.Close);
        viewHeader.add(viewHeaderRight);
        viewHeaderRight.add(win.buttons.Save);
        viewBody.add(table);
        win.add(activityIndicator);
        win.isDone = isDone;

        win.username = username;
        win.password = password;
        win.save_button = win.buttons.Save;
        win.activityIndicator = activityIndicator;

        return win;
    };
})();
