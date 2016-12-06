si.sqlite = {};
si.sqlite.Db = function(dbName, createSqlList) {
    this.dbName = dbName;

    this.open = function() {
      this.db = Titanium.Database.open(this.dbName);
    };

    this.close = function() {
      this.db.close();
    };

    this.open();
    for(var i = 0; i < createSqlList.length; i++) {
        this.db.execute(createSqlList[i])
    }
    this.close();
};

si.sqlite.sisyphus = new si.sqlite.Db('sisyphus',
    [
        'create table if not exists histories (global_id text, name text, datum_type text, loaded_at integer, description text)'
    ]
);
