(function() {

 	si.ui.createSettingsWindow = function(_args) {
	    var win = Ti.UI.createWindow({title: 'Settings',backgroundColor:'#ffffff',barColor:'#336699'});

		var data = [
			{title:'----', hasChild:false, target:'Server', header:'Medusa server'},
			{title:'----', hasChild:false, target:'LogIn', header:'account'},
			{title:'----', hasChild:false, target:'PrintServer', header:'print server'},
			{title:'----', hasChild:false, target:'PrintFormatUrl', header:'print format url'},
			{title:'----', hasChild:false, target:'ScanToLoad', header:'home'},
			{title:'----', hasChild:false, target:'ScanCamera', header: 'scan camera'}
		];
		var index_medusa_server = findIndex('Server');
		var index_account = findIndex('LogIn');
		var index_print_server = findIndex('PrintServer');
		var index_print_format_url = findIndex('PrintFormatUrl');
		var index_home = findIndex('ScanToLoad');
		var index_scan_camera = findIndex('ScanCamera');

		var tableViewOptions = {
				data:data,
				backgroundColor:'transparent',
				rowBackgroundColor:'white'
		};

        var optionDialogForScanCamera = Ti.UI.createOptionDialog({
            options : ['backward', 'front', 'cancel'],
            cancel : 2,
            title : 'Camera for scan'
        });
        optionDialogForScanCamera.addEventListener('click', function(e) {
            switch (e.index) {
                case 0:
					Ti.App.Properties.setInt('facing',e.index);        
                    break;
                case 1:
					Ti.App.Properties.setInt('facing',e.index);                
                    break;
                default:
                    break;
            };
            updateScanCameraRow();
			//tableView.data[4].rows[0].title = ScanCameraInfo();
        });


		var tableView = Ti.UI.createTableView(tableViewOptions);
		tableView.addEventListener('click', function(e){
			var rowNum = e.index;
			switch(e.rowData.target){
				case 'Server':
					var windowServerSetting = si.ui.createServerSettingWindow();
					si.app.tabGroup.activeTab.open(windowServerSetting,{animated:true});
					break;
				case 'LogIn':
					var windowLogin = si.ui.createLoginWindow();
					si.app.tabGroup.activeTab.open(windowLogin,{animated:true});
					break;
				case 'PrintServer':
					var windowPrintServerSetting = si.ui.createPrintServerSetttingWindow();
					si.app.tabGroup.activeTab.open(
						windowPrintServerSetting,
						{animated:true}
					);
					break;
				case 'PrintFormatUrl':
					var windowsPrintFormatUrlSetting = si.ui.createPrintFormatUrlSetttingWindow();
					si.app.tabGroup.activeTab.open(windowsPrintFormatUrlSetting,{animated:true});
					break;
				case 'ScanToLoad':
					si.app.tabGroup.activeTab.open(
						si.ui.createInputOrScanWindow({
	        				title: 'default box',
	        				value: Ti.App.Properties.getString('current_box_global_id'),
                			save : function(w) {
                				var global_id = w.text_field.value;
	                        	Ti.App.Properties.setString('current_box_global_id',global_id);
	                        	w.close();
                        		updateHomeRow();
                			}
	        			}),
	        			{animated:true}
					);
					//scanAndLoadDefaultBox();
					break;
				case 'ScanCamera':
				    optionDialogForScanCamera.show();
					break;
				default:
					break;
			}
		});

		win.add(tableView);

	    win.addEventListener('focus', function (e) {
	    	tableView.data[index_medusa_server].rows[0].title = serverInfo();
		   	tableView.data[index_account].rows[0].title = accountInfo();
		   	tableView.data[index_print_server].rows[0].title = printServerInfo();		   	
		   	tableView.data[index_print_format_url].rows[0].title = printFormatUrlInfo();
		   	updateHomeRow();
		   	updateScanCameraRow();
		});

		function findIndex(target) {
			Ti.API.info('findIndex: ' + target);
			var i, x;
			for (i in data) {
				x = data[i];
				if (x.target == target) {
					return i;
				}
			}
		}

		function accountInfo(){
			var username = Ti.App.Properties.getString('username');
			if (username == null){
				username = 'Click to login.';
			}
			return username;
		};

		function serverInfo(){
			txt = Ti.App.Properties.getString('server');
			return txt;
		}

		function printServerInfo(){
            var printServer = Ti.App.Properties.getString('printServer');
            return printServer;
		};

		function printFormatUrlInfo(){
            var printFormatUrl = Ti.App.Properties.getString('printFormatUrl');
            return printFormatUrl;
		};

		function ScanCameraInfo(){
			var facing = Ti.App.Properties.getInt('facing');
			if (facing == 1){
				return 'front';
			} else {
				return 'backward';
			}
		}

		function updateScanCameraRow(){
			tableView.data[index_scan_camera].rows[0].title = ScanCameraInfo();
		}

		function updateHomeRow(){
			var index = index_home;
			var row = tableView.data[index].rows[0];
		    var global_id = Ti.App.Properties.getString('current_box_global_id');
		    if (global_id != null){
				si.model.medusa.getRecordFromGlobalId({
					global_id:global_id,
                 username : Ti.App.Properties.getString('username'),
                 password : Ti.App.Properties.getString('password'),
					onsuccess:function(response){
						row.title = response.name;
						row.target = 'ScanToLoad';
					},
					onerror:function(e){
					}
				});
			} else {
				var row = tableView.data[index].rows[0];
				row.title = '----';
				row.target = 'ScanToLoad';
			}
		};

		function scanAndLoadDefaultBox(){
            if (!si.config.Medusa.debug){
                si.TiBar.scan({
                configure: si.config.TiBar,
                	success:function(data){
                    if(data && data.barcode){
                        var global_id = data.barcode;
                        Ti.App.Properties.setString('current_box_global_id',global_id);
                        updateHomeRow();
                        }
                	},
                	cancel:function(){
                	},
                	error:function(){
                	}
                });
            } else {
                var global_id = si.config.debug.box_global_id;
                Ti.App.Properties.setString('current_box_global_id',global_id);
                updateHomeRow();
            }
	   	};
		return win;
	};
})();
