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
        height: null,
        position: 0,
        loadMore: false,
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
    sort: {
        field: null,
        ascend: true
    },
    sortData: function (field, setAscend) {
        var column = this.schema.filter(function (item) {
            return item.name === field;
        });
        if (!column.length || !column[0].sortable) {
            return false;
        }
        column = column[0];
        if (setAscend !== undefined) {
            this.sort.ascend = setAscend;
        } else {
            if (this.sort.field === field) {
                this.sort.ascend = !this.sort.ascend;
            }
        }
        this.sort.field = field;
        var ascend = this.sort.ascend;
        var sortLike = column.sortLike;

        var methods = {
            number: parseFloat
        };
        var key = methods[sortLike] ?
            function (x) {
                return methods[sortLike](x[field]);
            } :
            function (x) {
                return x[field];
            };

        ascend = ascend ? 1 : -1;

        this.data.sort(function (a, b) {
            a = key(a);
            b = key(b);
            return ascend * ((a > b) - (b > a));
        });
        this._renderData();
        $('.sortable.sorted-ascend, .sortable.sorted-descend').removeClass('sorted-ascend sorted-descend');
        var ascendClass = Table.sort.ascend ? 'ascend' : 'descend';
        $('[data-schema-name="' + field + '"]').addClass('sorted-' + ascendClass);
        this._saveSettings();
        return true;
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
            name: 'last_name',
            sortable: true,
            format: false
        }, {
            name: 'email',
            sortable: true,
            format: 'mailto'
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
            sortLike: 'number',
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
            sortLike: 'number',
            format: 'roundnumber'
        }
    ],
    _saveSettings: function () {
        if (window.localStorage) {
            localStorage.tableSchema = JSON.stringify(this.schema);
            localStorage.tableSort = JSON.stringify(this.sort);
        }
    },
    _readSettings: function () {
        if (window.localStorage && localStorage.tableSchema && localStorage.tableSort) {
            this.schema = JSON.parse(localStorage.tableSchema);
            this.sort = JSON.parse(localStorage.tableSort);
        }
    },
    formatTypes: {
        roundnumber: function (number) {
            return this.number(this.round(number));
        },
        round: function (number) {
            return Math.round(number);
        },
        number: function (value) {
            var color = value < 0 ? 'number-negative' : 'number-positive';
            return '<span class="' + color + '">' + value + '</span>';
        },
        hyperlink: function (link, text) {
            text = text || link;
            return '<a href="' + link + '">' + text + '</a>';
        },
        mailto: function (mail) {
            return this.hyperlink('mailto:' + mail, mail);
        },
        boolean: function (value) {
            return value ? 'Да' : 'Нет';
        }
    },
    format: function (type, value) {
        return this.formatTypes[type] ? this.formatTypes[type](value) : value;
    },
    view: null,
    loadData: function () {
        jQuery.ajax({
            url: 'data/MOCK_DATA(' + this.part + ').json',
            method: 'GET',
            success: function (data) {
                Table.data = Table.data.concat(data);
                if (Table.sort.field) {
                    Table.sortData(Table.sort.field, Table.sort.ascend);
                } else {
                    Table._renderData();
                }
                Table.part++;
                $('.show-load-more').removeClass('show-load-more');
            }
        });
    },
    columnShowChange: function (name, show) {
        var column = this.schema.filter(function (item) {
            return item.name === name;
        });
        if (!column.length) {
            return false;
        }
        column = column[0];
        column.hide = !show;
        this._saveSettings();
        //$('.settings').removeClass('open');
        this._renderHeader();
        this._renderData();
    },
    _renderMenu: function () {
        var menu = document.createElement('div');
        menu.className = 'menu';
        this.schema.forEach(function (column, index) {
            var menuItem = document.createElement('div');
            if (index === 0) {
                menuItem.innerHTML = '<div>' + column.name + '</div>';
            } else {
                var checked = column.hide ? '' : 'checked';
                menuItem.innerHTML = '<label><input class="column-show" type="checkbox" ' + checked + ' value="' + column.name + '"> ' + column.name + '</label>';
            }
            menu.appendChild(menuItem);
        });
        var settings = $('<div class="settings">&#x2630;</div>')[0];
        settings.appendChild(menu);
        this.show.header.container.appendChild(settings);
        $('.settings').on('click', function () {
            $(this).toggleClass('open').hasClass('open');
        }).children().on('click', function (e) {
            e.stopPropagation();
        }).find('.column-show').on('change', function () {
            Table.columnShowChange(this.value, this.checked);
        });
    },
    _renderHeader: function () {
        if (this.show.header.columns) {
            this.show.header.container.removeChild(this.show.header.columns);
        }
        this.show.header.columns = document.createElement('table');
        var row = this.show.header.columns.appendChild(document.createElement('tr'));
        var schema = this.schema.filter(function (item) {
            return !item.hide;
        });
        var width = 100 / schema.length;
        schema.forEach(function (column) {
            var cell = document.createElement('th');
            cell.setAttribute('data-schema-name', column.name);
            if (column.sortable) {
                cell.className = 'sortable';
            }
            cell.style.width = width + '%';
            row.appendChild(cell);
            cell = cell.appendChild(document.createElement('span'));
            cell.innerHTML = column.name;
        });
        this.show.header.container.appendChild(this.show.header.columns);
        $('.sortable').on('click', function () {
            Table.sortData(this.getAttribute('data-schema-name'));
        });
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

        var schema = this.schema.filter(function (item) {
            return !item.hide;
        });
        this.show.data.container.style.height = this.data.length * this.show.rowHeight + 'px';
        this.show.header.columns.style.width = this.show.data.container.clientWidth + 'px';
        this.show.header.container.querySelector('.settings').style.width = Table.show.header.container.clientWidth - this.show.data.container.clientWidth + 'px';
        this.show.data.before.style.height = this.show.buffer * this.show.rowHeight + 'px';
        this.show.data.after.style.height = (this.data.length - this.show.buffer - this.show.limit) * this.show.rowHeight + 'px';
        this.show.data.table.innerHTML = '';
        var rows = document.createElement('tbody');
        var width = Math.floor(this.show.data.container.clientWidth / schema.length) - 1;
        $(this.show.header.columns).find('th').css('width', width + 'px');
        for (var i = this.show.buffer; i < this.show.buffer + this.show.limit; i++) {
            if (i >= Table.data.length) {
                console.log('alert', i);
                return;
            }
            var row = document.createElement('tr');
            schema.forEach(function (value) {
                var item = document.createElement('td');

                var data = Table.data[i][value.name];
                if (/^(M|F)$/i.test(data)) {
                    data = i;
                }
                if (value.format) {
                    data = Table.format(value.format, data);
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
        if (direction === 'down' || Table.show.loadMore) {
            Table.show.loadMore = visRange.bottom > Table.data.length;
            $(Table.view).toggleClass('show-load-more', Table.show.loadMore);
        }
    },
    init: function (containerId) {
        this.view = document.getElementById(containerId);
        this.show.header.container = this.view.querySelector('.header');
        this.show.data.container = this.view.querySelector('.container');
        this.show.height = Math.floor(this.view.querySelector('.data').clientHeight / this.show.rowHeight);
        $('.data').on('scroll', this.viewScroll);
        $('.load-more').on('click',function(){
            Table.loadData.call(Table);
        });
        this.show.data.before = this.show.data.container.querySelector('.before');
        this.show.data.table = this.show.data.container.querySelector('.data-table');
        this.show.data.after = this.show.data.container.querySelector('.after');
        this._readSettings();
        this._renderMenu();
        this._renderHeader();
        this.loadData();
    }
};
