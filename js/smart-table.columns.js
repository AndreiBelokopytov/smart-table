(function (SmartTable) {
  'use strict';
  
  var 
    Utils = SmartTable.Utils,
    Filter = SmartTable.Filter;
  
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
    
    this.getCellHtml = function (rowData) {
      var cellData = rowData[this.property];
      if (typeof this.formatter === 'function') {
        return this.formatter(cellData);
      }
      return cellData;
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
  
  
  
  
  function EditCommandColumn() {
    
  }
  
  Utils.inherit(EditCommandColumn, Column);
  
  function DeleteCommandColumn() {
    
  }
  
  Utils.inherit(DeleteCommandColumn, Column);
  
  SmartTable.Column = Column;
})(SmartTable || {});