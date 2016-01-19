(function (SmartTable) {
  'use strict';

  var
    Utils = SmartTable.Utils,
    CSS = SmartTable.CSS,
    Filter = SmartTable.Filter,
    Editor = SmartTable.Editor;

  function Column(options) {
    this.title = options.title;
    this.width = options.width;
    this.isHidden = options.isHidden;
  }

  Column.prototype.getCellHtml = function () {
    return '';
  };

  Column.createColumn = function (options) {
    switch (options.type) {
      case 'data': {
        return new DataColumn(options);
      }
      case 'index': {
        return new IndexColumn(options);
      }
      case 'edit': {
        return new EditCommandColumn(options);
      }
      case 'delete': {
        return new DeleteCommandColumn(options);
      }
      default: {
        return new DataColumn(options);
      }
    }
  };




  function DataColumn(options) {
    DataColumn.super.apply(this, arguments);

    this.property = options.property;
    this.formatter = options.formatter;

    if (options.filter) {
      this.filter = Filter.createFilter(options.filter);
    }

    if (options.property && options.editor) {
      options.editor.property = options.property;
      this.editor = Editor.createEditor(options.editor);
    }

    this.getCellHtml = function (rowData) {
      var cellData = rowData[this.property];
      if (typeof this.formatter === 'function') {
        return this.formatter(cellData);
      }
      if (!Utils.isNullOrUndef(cellData)) {
        return cellData;
      }
      return '';
    };
  }

  Utils.inherit(DataColumn, Column);




  function IndexColumn() {
    IndexColumn.super.apply(this, arguments);

    this.getCellHtml = function (rowData, rowIndex) {
      return rowIndex + 1;
    };
  }

  Utils.inherit(IndexColumn, Column);




  function EditCommandColumn(options) {
    EditCommandColumn.super.apply(this, arguments);

    this.text = options.text;
    this.noSort = true;
    this.editor = Editor.createEditor({
      type: 'confirm'
    });

    this.getCellHtml = function () {
      return '<a href="#" class="' + CSS.BTN_EDIT_ROW + '">' +
        this.text + '</a>';
    };
  }

  Utils.inherit(EditCommandColumn, Column);

  function DeleteCommandColumn(options) {
    DeleteCommandColumn.super.apply(this, arguments);

    this.text = options.text;
    this.noSort = true;
    this.editor = null;

    this.getCellHtml = function () {
      return '<a href="#" class="' + CSS.BTN_DELETE_ROW + '">' +
        this.text + '</a>';
    };
  }

  Utils.inherit(DeleteCommandColumn, Column);

  SmartTable.Column = Column;
})(SmartTable || {});
