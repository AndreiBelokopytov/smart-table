(function (SmartTable) {
  'use strict';
  
  var
    Utils = SmartTable.Utils,
    CSS = SmartTable.CSS,
    Column = SmartTable.Column;




  function createTableContent(columns, data) {
    var
      rowElem,
      cellElem,
      visibleColumns,
      tableRows = document.createDocumentFragment();

    if (Array.isArray(data)) {
      if (data.length) {
        data.forEach(function (item, rowIndex) {
          rowElem = Utils.createDomElem('tr', '', {
            'grid-rowindex': rowIndex
          });

          columns.forEach(function (column, colIndex) {
            if (!column.isHidden) {
              cellElem = Utils.createDomElem('td', '', {
                'data-colindex': ++colIndex
              });
              cellElem.innerHTML = column.getCellHtml(item, rowIndex);
              rowElem.appendChild(cellElem);
            }
          });

          tableRows.appendChild(rowElem);
        });
      } else {
        visibleColumns = columns.filter(function (item) {
          return !item.isHidden;
        });
        rowElem = Utils.createDomElem('tr', CSS.NO_DATA);
        cellElem = Utils.createDomElem('td', CSS.NO_DATA, {
          colspan: visibleColumns.length
        }, 'No data');
        rowElem.appendChild(cellElem);
        tableRows.appendChild(rowElem);
      }
    }

    return tableRows;
  }



  function SmartTableConstructor(options) {
    var self = this;
    
    this._tableElem = null;
    this._theadElem = null;
    this._tbodyElem = null;
    this._headersBar = null;
    this._filtersBar = null;
      
    this._cssClass = CSS.TABLE;

    this._dataset = [];
    this._filtered = [];
    this._columns = options.columns || [];

    if (options.cssClass) {
      this._cssClass += options.tableCssClass;
    }

    if (typeof options.element === 'string') {
      this.el = document.querySelector(options.element);
    } else {
      this.el = options.element;
    }

    this._columns = this._columns.map(function (columnOptions) {
      return Column.createColumn(columnOptions);
    });

    this.getTableData = function () {};

    if (options.actions) {
      this.getTableData = options.actions.getData;
    }

    this._render = function () {
      var
        el,
        tableContent = createTableContent(this._columns, this._filtered),
        contentLen = this._tbodyElem.children.length;

      while(contentLen--) {
        el = this._tbodyElem.children[contentLen];
        if (el.tagName === 'TR') {
          this._tbodyElem.removeChild(el);
        }
      }
      
      this._tbodyElem.appendChild(tableContent);
      this._setColumns(tableContent);
    };

    this._clearFilters = function () {
      var filterFields = this._theadElem.querySelectorAll('input, select');
      Array.prototype.forEach.call(filterFields, function (field) {
        field.value = '';
      });
    };

    this._clearSort = function () {
      var colHeaders = this._theadElem.querySelectorAll('th');
      Array.prototype.forEach.call(colHeaders, function (th) {
        th.classList.remove(CSS.COLUMN_SORT_ASC);
        th.classList.remove(CSS.COLUMN_SORT_DESC);
      });
    };

    this._setColumns = function () {
      var
        self = this,
        colIndex,
        display,
        setColumnVisibility = function (displayStyle, colIndex) {
          var
            colElements;

          colElements = self._tableElem.querySelectorAll(
            'col[data-colindex="' + colIndex + '"], ' +
            'td[data-colindex="' + colIndex + '"], ' +
            'th[data-colindex="' + colIndex + '"]');

          [].forEach.call(colElements, function (elem) {
            elem.style.display = displayStyle;
          });
        };

        this._columns.forEach(function (column, index) {
          colIndex = index + 1;
          if (column.hidden) {
            display = 'none';
          } else {
            display = '';
          }
          setColumnVisibility(display, colIndex);
        }, this);
    };

    (function initGrid() {
      var
        th,
        col,
        colWidth,
        columnClass = '',
        sortDataHandler = function (event) {
          var
            column,
            sortType,
            source = event.target;

          if (source.tagName === 'TH' &&
            source.classList.contains(CSS.COLUMN_SORTED)) {

            column = self._columns[source.cellIndex];
            if (source.classList.contains(CSS.COLUMN_SORT_ASC)) {
              sortType = CSS.COLUMN_SORT_DESC;
              self.sort(column, sortType);
            } else {
              sortType = CSS.COLUMN_SORT_ASC;
              self.sort(column, sortType);
            }

            [].forEach.call(self._headersBar.children, function (node) {
              if (node.tagName === 'TH') {
                node.classList.remove(CSS.COLUMN_SORT_ASC);
                node.classList.remove(CSS.COLUMN_SORT_DESC);
              }
            });

            source.classList.add(sortType);
          }
        },
        filterChangedHandler = function (event) {
          var
            td,
            column,
            source = event.target;

          if (source.tagName === 'INPUT' || source.tagName === 'SELECT') {
            td = source.closest('th');
            column = self._columns[td.cellIndex];

            if (!source.classList.contains(CSS.FILTER_RANGE)) {
              if (source.tagName === 'INPUT' && source.type === 'checkbox') {
                column.filter.setCondition(source.checked); 
              } else {
                column.filter.setCondition(source.value);
              }
            } else {
              if (source.classList.contains(CSS.FILTER_RANGE_MIN)) {
                column.filter.setCondition(source.value, 0);
              } else if (source.classList.contains(CSS.FILTER_RANGE_MAX)) {
                column.filter.setCondition(source.value, 1);
              }
            }
            self.filter();
          }
        };

      this._tableElem = Utils.createDomElem('table', this._cssClass, {
        cols: this._columns.length
      });
      this._theadElem = Utils.createDomElem('thead');
      this._tbodyElem = Utils.createDomElem('tbody');
      this._headersBar = Utils.createDomElem('tr', CSS.HEADERS_BAR);
      this._filtersBar = Utils.createDomElem('tr', CSS.FILTERS_BAR);

      this._columns.forEach(function (column, colIndex) {
        ++colIndex;

        if (!column.noSort) {
          columnClass = CSS.COLUMN_SORTED;
        }

        th = Utils.createDomElem('th', columnClass, {
          'data-colindex': colIndex
        }, column.title);
        self._headersBar.appendChild(th);

        th = Utils.createDomElem('th', '', {
          'data-colindex': colIndex
        });
        if (column.filter) {
          th.appendChild(column.filter.getFilterElement());
        }
        self._filtersBar.appendChild(th);

        col = Utils.createDomElem('col', '', {
          'data-colindex': colIndex
        });
        if (column.width) {
          colWidth = parseInt(column.width, 10);
          if (isNaN(colWidth)) {
            throw {
              message: 'Column width should be a number'
            };
          }
          colWidth += 'px';
          col.style.width = colWidth;
        }
        self._tableElem.appendChild(col);
      });

      ///TODO: throttle events
      this._filtersBar.addEventListener('input', filterChangedHandler);
      this._filtersBar.addEventListener('change', filterChangedHandler);
      this._headersBar.addEventListener('click', sortDataHandler);

      this._theadElem.appendChild(this._headersBar);
      this._theadElem.appendChild(this._filtersBar);
      this._tableElem.appendChild(this._theadElem);
      this._tableElem.appendChild(this._tbodyElem);

      this.el.appendChild(this._tableElem);

      this.refresh();
    }).apply(this);
  }

  //public api
  SmartTableConstructor.prototype = {
    refresh: function () {
      var self = this;

      this._dataset = [];
      this._filtered = [];
      this._clearFilters();
      this._clearSort();

      this.getTableData(function (data) {
        var
          cellVal,
          mappedItem;

        data.forEach(function (item) {
          mappedItem = {};
          self._columns.forEach(function (column) {
            if (column.property) {
              cellVal = Utils.getObjectProperty(item, column.property);
              mappedItem[column.property] = cellVal;
            }
          });
          self._dataset.push(mappedItem);
        });
        self._filtered = self._dataset;
        self._render();
      });
    },
    
    filter: function () {
      var
        self = this,
        checked;

      this._filtered = [];

      this._dataset.forEach(function (item) {
        checked = self._columns.every(function (column) {
          if (column.filter) {
            return column.filter.check(item[column.property]);
          }
          return true;
        });
        if (checked) {
          self._filtered.push(item);
        }
      });

      this._render();
    },

    sort: function (column, order) {
      var
        self = this,
        sortResult = 1;

      if (!order) {
        order = CSS.COLUMN_SORT_ASC;
      }

      if (order === CSS.COLUMN_SORT_DESC) {
        sortResult = -1;
      }

      self._filtered.sort(function (a, b) {
        if (a[column.property] >= b[column.property]) {
          return sortResult;
        }
        if (a[column.property] < b[column.property]) {
          return -1 * sortResult;
        }
      });

      self._render();
    },
    
    toggleColumns: function (colIndexes) {
      var
        self = this,
        column;

      if (!Array.isArray(colIndexes)) {
        colIndexes = [colIndexes];
      }

      colIndexes.forEach(function (colIndex) {
        column = self._columns[colIndex - 1];
        if (column) {
          if (typeof column.hidden === 'undefined' ||
            column.hidden === false) {
            column.hidden = true;
          } else {
            column.hidden = false;
          }
        }
      });

      this._render();
    },
    
    toggleFilters: function () {
      if (this.filtersBar.style.display !== 'none') {
        this.filtersBar.style.display = 'none';
      } else {
        this.filtersBar.style.display = '';
      }
    }
  };




  window.SmartTable = SmartTableConstructor;
})(SmartTable || {});
