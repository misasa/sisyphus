(function() {

    var PER_PAGE = 25;

    si.ui.createSearchWindow = function(_args) {
        var isDone = null;
        var page = 1;
        var onSearchFlag = false;

        var SEARCH_TYPE = {
            SEARCH: 'Search',
            HISTORY: 'History',
        }

        var win = Ti.UI.createWindow({
            title : _args.type,
        });

        win.condition = "";

        win.addEventListener('open', function(e) {
            Ti.API.info('opened');
        });

        var condition = Ti.UI.createTextField({
          borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
          text: win.condition,
          top: 10,
          width: '85%',
          layout : 'horizontal'
        });

        win.buttons = {};
        win.buttons.Close = si.ui.createImageButtonView('/images/glyphicons-208-remove-2.png', {
            width : 90,
            height : 90,
            imgDimensions : 30,
            layout : 'horizontal',
            onclick : function(e) { win.close() }
        });
        win.buttons.Close.left = 0;

        win.buttons.Search = si.ui.createImageButtonView('/images/glyphicons-28-search.png', {
            right : 0,
            width : 90,
            height : 90,
            imgDimensions : 30,
            layout : 'horizontal',
            onclick : function(e) {
                onSearchFlag = true;
                page = 1;
                win.condition = condition.value;
                win.load();
            }
        });
        win.buttons.Search.right = 0;

        win.buttons.Next = Ti.UI.createButton({
            title: 'next',
            width: '75%',
            height: 100,
            bottom: 0
        });

        win.buttons.Next.addEventListener('click',function(e)
        {
            page++;
            condition.text = win.condition;
            win.load();
        });

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

        var viewBody = Ti.UI.createScrollView({
            showVerticalScrollIndicator: true,
            showHorizontalScrollIndicator: true,
            height : '100%',
            layout : 'vertical'
        });

        var activityIndicator = Ti.UI.createActivityIndicator({
            style : Ti.UI.ActivityIndicatorStyle.BIG,
        });

        win.load = function(){
            if(_args.type === 'History') {
                win.loadHistory();
            } else {
                win.search();
            }
        };

        win.loadHistory = function() {
            alert('load history');
        };

        win.search = function(){
            isDone = false;
            win.buttons.Next.enabled = true;
            Ti.API.info('click');

            activityIndicator.show();
            si.model.medusa.getRecords({
                query: { name_cont: win.condition, datum_type_in: ["Specimen", "Box"] },
                page: page,
                per_page: PER_PAGE,
                onsuccess : function(response) {
                    if (onSearchFlag) {
                        sections = [];
                        section.setItems([]);
                        sections.push(section);
                        listView.setSections(sections);
                        onSearchFlag = false;
                    }
                    win.bind(response);
                    activityIndicator.hide();
                    isDone = true;
                },
                onerror : function(e) {
                    page--;
                    alert('search onerror');
                    activityIndicator.hide();
                    isDone = true;
                    si.ui.showErrorDialog(_message);
                }
            });
        };

        // template
        var specimenTemplate = {
            childTemplates: [
                {
                    type: 'Ti.UI.Label',
                    bindId: 'name',
                    properties: {
                        color: 'gray',
                        font: { fontFamily:'Arial', fontSize: '20dp', fontWeight:'bold' },
                        left: '0dp', top: 0,
                    }
                },
                {
                    type: 'Ti.UI.Label',
                    bindId: 'description',
                    properties: {
                        color: 'gray',
                        font: { fontFamily:'Arial', fontSize: '14dp' },
                        left: '0dp', top: '25dp',
                    }
                }
            ]
        };

        var listView = Ti.UI.createListView({
            templates: { 'template': specimenTemplate },
            defaultItemTemplate: 'template'
        });

        listView.addEventListener('itemclick', function(e){
            var item = section.getItemAt(e.itemIndex);
            _args.onsuccess(item);
            win.close();
        });

        var sections = [];
        var section = Ti.UI.createListSection({ headerTitle: 'Specimens', footerView: win.buttons.Next});
        section.setItems([]);
        sections.push(section);
        listView.setSections(sections);
        win.load();

        win.bind = function(response){
            var loadDataSet = [];

            if(response.length < PER_PAGE){
                win.buttons.Next.enabled = false;
            }

            if(response.length <= 0){
                alert('There are no more specimens.');
                page--;
            } else {
                for(var i = 0; i < response.length; i++) {
                    data = response[i];
                    var name = data["name"];
                    if(name.length <= 0) {
                        name = '[no name]';
                    }
                    loadData = { name: {text: name }, description: {text: data["description"]}, global_id: data.global_id };
                    loadDataSet.push(loadData);
                }
                try{
                    section.appendItems(loadDataSet);
                } catch (e) {
                    alert(e.message);
                }
            }
        };

        //TODO: layout
        win.add(viewBase);
        viewBase.add(viewHeader);
        viewHeader.add(win.buttons.Close);
        if (_args.type === 'Search') {
            viewHeader.add(condition);
            viewHeader.add(win.buttons.Search);
        }
        viewBase.add(viewBody);
        viewBody.add(listView);
        win.add(activityIndicator);
        win.isDone = isDone;
        win.search_button = win.buttons.Search;
        win.activityIndicator = activityIndicator;

        return win;
    };
})();
