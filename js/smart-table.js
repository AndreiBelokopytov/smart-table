(function (SmartTable) {
  'use strict';

  var
    Utils = SmartTable.Utils,
    CSS = SmartTable.CSS,
    Column = SmartTable.Column,
    TableRow = SmartTable.Row,
    Row;




  function SmartTableConstructor(options) {
    var self = this;

    this._tableElem = null;
    this._theadElem = null;
    this._tbodyElem = null;
    this._headersBar = null;
    this._filtersBar = null;

    this._cssClass = CSS.TABLE;

    this._rows = [];
    this._columns = options.columns || [];

    if (options.cssClass) {
      this._cssClass += ' ' + options.cssClass;
    }

    if (typeof options.element === 'string') {
      this.el = document.querySelector(options.element);
    } else {
      this.el = options.element;
    }

    //create columns
    this._columns = this._columns.map(function (columnOptions) {
      return Column.createColumn(columnOptions);
    });

    Row = new TableRow(this._columns);

    this.getTableData = function () { };
    this.deleteRow = function () { };
    this.editRow = function () { };

    if (options.actions) {
      this.getTableData = options.actions.getData;
      this.deleteRow = options.actions.deleteRow;
      this.editRow = options.actions.editRow;
    }

    this._render = function () {
      var
        tr,
        tableContent = document.createDocumentFragment(),
        columns = this._columns,
        visibleColumns,
        rows = this._rows,
        tbody = this._tbodyElem,
        contentLen = tbody.children.length;

      while (contentLen--) {
        tr = tbody.children[contentLen];
        if (tr.tagName === 'TR') {
          this._tbodyElem.removeChild(tr);
        }
      }

      if (rows.length) {
        rows.forEach(function (row, index) {
          tr = row.getElement(columns, index);
          tableContent.appendChild(tr);
        });
      } else {
        visibleColumns = columns.filter(function (column) {
          return !column.isHidden;
        });
        tr = Utils.createDomElem('tr', {
          colspan: visibleColumns.length
        }, 'No data');
        tableContent.appendChild(tr);
      }

      tbody.appendChild(tableContent);
      this._setColumns();
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

    this._cancelEdit = function () {
      var tbody = this._tbodyElem,
          rows = this._rows,
          columns = this._columns,
          row,
          rowIndex,
          rowsInEditMode;

      rowsInEditMode = tbody.querySelectorAll('.' + CSS.EDIT_MODE);

      //close all open editors
      Array.prototype.forEach.call(rowsInEditMode, function (tr) {
        rowIndex = tr.sectionRowIndex;
        row = rows[rowIndex];
        row.cancelEdit();
        tbody.replaceChild(row.getElement(columns, rowIndex), tr);
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
        if (column.isHidden) {
          display = 'none';
        } else {
          display = '';
        }
        setColumnVisibility(display, colIndex);
      }, this);
    };

    this._sortHandler = function (event) {
      var columns = this._columns,
          headersBar = this._headersBar,
          column,
          sortType,
          source = event.target;

      if (source.tagName === 'TH' &&
        source.classList.contains(CSS.COLUMN_SORTED)) {

        column = columns[source.cellIndex];
        sortType = source.classList.contains(CSS.COLUMN_SORT_ASC) ?
          CSS.COLUMN_SORT_DESC
          : CSS.COLUMN_SORT_ASC;
        this.sort(column, sortType);

        Array.prototype.forEach.call(headersBar.children, function (node) {
          if (node.tagName === 'TH') {
            node.classList.remove(CSS.COLUMN_SORT_ASC);
            node.classList.remove(CSS.COLUMN_SORT_DESC);
          }
        });

        source.classList.add(sortType);
      }
    };

    this._filterHandler = function (event) {
      var columns = this._columns,
          td,
          column,
          source = event.target;

      if (source.tagName === 'INPUT' || source.tagName === 'SELECT') {
        td = source.closest('th');
        column = columns[td.cellIndex];

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
        this.filter();
      }
    };

    this._deleteHandler = function (evt) {
      var self = this,
          source = evt.target,
          rows = this._rows,
          tr,
          selectedRow,
          rowValues;

      evt.preventDefault();
      if (source.classList.contains(CSS.BTN_DELETE_ROW)) {
        tr = source.closest('tr');
        selectedRow = rows[tr.sectionRowIndex];
        rowValues = selectedRow.getValues();
        this.deleteRow(rowValues, function () {
          rows.splice(tr.sectionRowIndex, 1);
          self._render();
        });
      }
    };

    this._editHandler = function (evt) {
      var source = evt.target,
          rows = this._rows,
          columns = this._columns,
          editor,
          selectedRow,
          tr;

      evt.preventDefault();

      if (source.classList.contains(CSS.BTN_EDIT_ROW) &&
        !source.classList.contains(CSS.EDIT_MODE)) {

        this._cancelEdit();

        tr = source.closest('tr');
        selectedRow = rows[tr.sectionRowIndex];
        selectedRow.edit();

        editor = selectedRow.getElement(columns);
        self._tbodyElem.replaceChild(editor, tr);
      }
    };

    this._confirmEditHandler = function (evt) {
      var source = evt.target,
          rows = this._rows,
          selectedRow,
          tr,
          rowValues;

      if (source.classList.contains(CSS.EDITOR_CONFIRM)) {
        tr = source.closest('tr');
        selectedRow = rows[tr.sectionRowIndex];
        selectedRow.commitChanges();
        rowValues = selectedRow.getValues();
        self.editRow(rowValues, function () {
          self._cancelEdit();
          self._render();
        });
      }
    };

    this._cancelEditHandler = function (evt) {
      var source = evt.target;

      if (source.classList.contains(CSS.EDITOR_DECLINE)) {
        self._cancelEdit();
      }
    };

    (function initGrid() {
      var
        th,
        col,
        colWidth,
        columnClass = '';

      this._tableElem = Utils.createDomElem('table', this._cssClass, {
        cols: this._columns.length
      });
      this._theadElem = Utils.createDomElem('thead');
      this._tbodyElem = Utils.createDomElem('tbody');
      this._headersBar = Utils.createDomElem('tr', CSS.HEADERS_BAR);
      this._filtersBar = Utils.createDomElem('tr', CSS.FILTERS_BAR);

      this._columns.forEach(function (column, colIndex) {
        ++colIndex;

        columnClass = '';
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
      this._filtersBar.addEventListener('input',
        this._filterHandler.bind(this));
      this._filtersBar.addEventListener('change',
        this._filterHandler.bind(this));
      this._headersBar.addEventListener('click',
        this._sortHandler.bind(this));
      this._tbodyElem.addEventListener('click',
        this._deleteHandler.bind(this));
      this._tbodyElem.addEventListener('click',
        this._editHandler.bind(this));
      this._tbodyElem.addEventListener('click',
        this._confirmEditHandler.bind(this));
      this._tbodyElem.addEventListener('click',
        this._cancelEditHandler.bind(this));

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
      var self = this,
          rows = this._rows = [];

      this._clearFilters();
      this._clearSort();

      this.getTableData(function (data, index) {
        //create rows
        data.forEach(function (item) {
          rows.push(new Row(item, index));
        });

        self._render();
      });
    },

    filter: function () {
      var rows = this._rows,
          columns = this._columns,
          rowValues,
          rowElement,
          checked;


      rows.forEach(function (row) {
        rowValues = row.getValues();
        rowElement = row.getElement();
        checked = columns.every(function (column) {
          if (column.filter) {
            return column.filter.check(rowValues[column.property]);
          }
          return true;
        });
        if (checked) {
          rowElement.classList.remove(SmartTable.CSS.HIDDEN);
        } else {
          rowElement.classList.add(SmartTable.CSS.HIDDEN);
        }
      });
    },

    sort: function (column, order) {
      var rows = this._rows,
          sortResult = 1;

      if (!order) {
        order = CSS.COLUMN_SORT_ASC;
      }

      if (order === CSS.COLUMN_SORT_DESC) {
        sortResult = -1;
      }

      rows.sort(function (a, b) {
        var valuesA = a.getValues(),
            valuesB = b.getValues();

        if (valuesA[column.property] >= valuesB[column.property]) {
          return sortResult;
        }
        if (valuesA[column.property] < valuesB[column.property]) {
          return -1 * sortResult;
        }
      });

      this._render();
    },

    toggleColumns: function (colIndexes) {
      var self = this,
          column;

      if (!Array.isArray(colIndexes)) {
        colIndexes = [colIndexes];
      }

      colIndexes.forEach(function (colIndex) {
        column = self._columns[colIndex - 1];
        if (column) {
          if (typeof column.isHidden === 'undefined' ||
            column.isHidden === false) {
            column.isHidden = true;
          } else {
            column.isHidden = false;
          }
        }
      });

      this._setColumns();
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
