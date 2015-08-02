/**
 * Created by EL on 30.07.2015.
 */

var Table = {
    data: [],
    part: 0,
    show: {
        limit: 100,
        rowHeight: 30,
        buffer: 0,
        height:null,
        position:0,
        header: {
            container: null,
            columns: null
        },
        data: {
            container: null,
            before: null,
            table: null,
            after: null
        }
    },
    schema: [
        {
        name: 'gender',
        sortable: false,
        format: false
    }, {
        name: 'first_name',
        sortable: true,
        format: false
    }, {
        name: 'email',
        sortable: true,
        format: 'hyperlink'
    }, {
        name: 'country',
        sortable: true,
        format: false
    }, {
        name: 'ip_address',
        sortable: false,
        format: false
    }, {
        name: 'married',
        sortable: false,
        format: 'boolean'
    }, {
        name: 'debet',
        sortable: true,
        format: 'number'
    }, {
        name: 'geo-latitude',
        sortable: false,
        format: false
    }, {
        name: 'geo-longitude',
        sortable: false,
        format: false
    }, {
        name: 'number',
        sortable: true,
        format: 'roundnumber'
    }],
    view: null,
    loadData: function () {
        jQuery.ajax({
            url: 'data/MOCK_DATA(' + this.part + ').json',
            method: 'GET',
            success: function (data) {
                Table.data = Table.data.concat(data);
                Table._renderData();
                Table.part++;
            }
        });
    },
    _renderHeader: function () {
        this.show.header.columns = document.createElement('table');
        var row = this.show.header.columns.appendChild(document.createElement('tr'));
        var width = 100 / this.schema.length;
        this.schema.forEach(function (column) {
            var cell = document.createElement('th');
            if (column.sortable) {
                cell.className = 'sortable';
            }
            cell.style.width = width + '%';
            row.appendChild(cell);
            cell = cell.appendChild(document.createElement('span'));
            cell.innerHTML = column.name;
        });
        this.show.header.container.appendChild(this.show.header.columns);
    },
    _renderData: function (direction) {
        var downState = this.show.buffer;
        if (direction === 'up') {
            this.show.buffer = this.show.position - this.show.limit + (this.show.height * 2);
            this.show.buffer = this.show.buffer < 0 ? 0 : this.show.buffer;
            if (downState === this.show.buffer) {
                return;
            }
        } else if (direction === 'down') {
            this.show.buffer =
                this.show.position > this.data.length - this.show.limit ?
                    this.data.length - this.show.limit :
                    this.show.position - this.show.height;
            if (downState === this.show.buffer) {
                return;
            }
        }

        this.show.data.container.style.height = this.data.length * this.show.rowHeight + 'px';
        this.show.header.container.style.width = this.show.data.container.clientWidth + 'px';
        this.show.data.before.style.height = this.show.buffer * this.show.rowHeight + 'px';
        this.show.data.after.style.height = (this.data.length - this.show.buffer - this.show.limit) * this.show.rowHeight + 'px';
        this.show.data.table.innerHTML = '';
        var rows = document.createElement('tbody');
        var width = Math.floor(this.show.data.container.clientWidth / this.schema.length) -1 ;
        for (var i = this.show.buffer; i < this.show.buffer + this.show.limit; i++) {
            if (i>=Table.data.length) {
                console.log('alert', i); return;
            }
            var row = document.createElement('tr');
            this.schema.forEach(function (value) {
                var item = document.createElement('td');

                var data = Table.data[i][value.name];
                if (/^(M|F)$/i.test(data)) {
                    data = i;
                }
                item.innerHTML = '<span class="cell-data" style="width:' + width + 'px;">' + data + '</span>';
                row.appendChild(item);
            });
            rows.appendChild(row);
        }
        this.show.data.table.appendChild(rows);
    },
    viewScroll: function () {
        Table.show.position = Math.abs(Math.ceil($(Table.show.data.container).position().top / Table.show.rowHeight));
        var range = {
            top: Table.show.buffer,
            bottom: Table.show.buffer + Table.show.limit
        };
        var visRange = {
            top: Table.show.position - Table.show.height >= 0 ? Table.show.position - Table.show.height : 0,
            bottom: Table.show.position + (Table.show.height * 2)
        };
        var direction =
            visRange.bottom > range.bottom ?
                'down' :
                visRange.top < range.top ?
                    'up' :
                    false;
        if (direction) {
            Table._renderData(direction);
            console.log('loading', direction);
        }
    },
    init: function (containerId) {
        this.view = document.getElementById(containerId);
        this.show.header.container = this.view.querySelector('.header');
        this.show.data.container = this.view.querySelector('.container');
        this.show.height = Math.floor(this.view.querySelector('.data').clientHeight / this.show.rowHeight);
        $('.data').on('scroll', this.viewScroll);
        this.show.data.before = this.show.data.container.querySelector('.before');
        this.show.data.table = this.show.data.container.querySelector('.data-table');
        this.show.data.after = this.show.data.container.querySelector('.after');
        this._renderHeader();
        this.loadData();
    }
};
