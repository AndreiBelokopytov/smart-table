;(function (SmartTable) {
  'use strict';

  var Utils = SmartTable.Utils,
      CSS = SmartTable.CSS,
      RowStates = {
        view: ViewState,
        edit: EditState
      };

  function ViewState(values, columns, rowIndex) {
    var rowElem,
        cellElem;

    //TODO: remove 'magic' identifier
    rowElem = Utils.createDomElem('tr', '', {
      'data-rowid': values.__rowId
    });

    columns.forEach(function (column, colIndex) {
      cellElem = Utils.createDomElem('td', '', {
        'data-colindex': ++colIndex
      });
      cellElem.innerHTML = column.getCellHtml(values, rowIndex);
      rowElem.appendChild(cellElem);
    });

    return rowElem;
  }

  function EditState(values, columns) {
    var td,
        editor;

    //TODO: remove 'magic' identifier
    editor = Utils.createDomElem('tr', CSS.EDIT_MODE, {
      'data-rowid': values.__rowId
    });

    columns.forEach(function (column) {
      td = Utils.createDomElem('td');
      if (column.editor) {
        td.appendChild(column.editor.getEditorElement(values));
      } else {
        td.innerHTML = column.getCellHtml(values);
      }
      editor.appendChild(td);
    });

    return editor;
  }

  function TableRow (columns) {

    function Row(values, rowIndex) {
      this._values = values;
      this._rowElem = null;
      this._rowIndex = rowIndex;

      this._setState(RowStates.view);
    }

    Row.prototype = {
      _columns: columns,
      _setState: function (state) {
        this._rowElem = state(this._values, this._columns, this._rowIndex);
      },
      edit: function () {
        this._setState(RowStates.edit);
      },
      commitChanges: function () {
        var self = this,
            cells = this._rowElem.children,
            cellInput,
            cellProp,
            column;

        Array.prototype.forEach.call(cells, function (cell) {
          cellInput = cell.querySelector('input, select');
          if (cellInput) {
            cellProp = cellInput.dataset.columnProperty;
            if (cellProp) {
              column = self._columns.filter(function (column) {
                if (column.property === cellProp) {
                  return column;
                }
              });
              column = column[0];
              self._values[cellProp] =
                column.editor.parseValue(cellInput.value);
            }
          }
        });
        this._setState(RowStates.view);
      },
      refresh: function () {
        this._setState(RowStates.view);
      },
      cancelEdit: function () {
        this._setState(RowStates.view);
      },
      getElement: function () {
        return this._rowElem;
      },
      getValues: function () {
        return this._values;
      }
    };

    return Row;
  }




  SmartTable.Row = TableRow;
})(SmartTable || {});
