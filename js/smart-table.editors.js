(function (SmartTable) {
  'use strict';


  var
    CSS = SmartTable.CSS,
    Utils = SmartTable.Utils;

  function Editor(options) {
    this.property = options.property;
    this.placeholder = options.placeholder || '';
    this.cssClass = CSS.EDITOR;
    this.cssClass += options.cssClass ? ' ' + options.cssClass : '';
    this.parser = options.valueParser;
  }

  Editor.prototype = {
    parseValue: function (val) {
      if (this.parser) {
        return this.parser(val);
      }
      return val;
    }
  };

  Editor.createEditor = function (options) {
    switch (options.type) {
      case 'text':
        return new TextEditor(options);
      case 'select':
        return new SelectEditor(options);
      case 'confirm':
        return new ConfirmEditor(options);
      default:
        return new TextEditor(options);
    }
  };




  function TextEditor() {
    TextEditor.super.apply(this, arguments);

    this.getEditorElement = function (rowData) {
      var cellValue = rowData[this.property];
      return Utils.createDomElem(
        'input',
        this.cssClass,
        {
          type: 'text',
          placeholder: this.placeholder,
          'data-column-property': this.property,
          value: Utils.isNullOrUndef(cellValue) ? '' : cellValue
        });
    };
  }

  Utils.inherit(TextEditor, Editor);




  function SelectEditor(options) {
    SelectEditor.super.apply(this, arguments);

    this.getEditorElement = function (rowData) {
      var
        cellValue = rowData[this.property],
        selectElem = Utils.createDomElem('select', this.cssClass, {
          'data-column-property': this.property
        }),
        optionElem,
        optionData,
        optionAttributes = {},
        index = 0,
        selectOptionsLen = options.selectOptions.length;

      optionElem = Utils.createDomElem('option', '', {
        value: ''
      });
      selectElem.appendChild(optionElem);

      for (; index < selectOptionsLen; index++) {
        optionAttributes = {};
        optionData = options.selectOptions[index];
        optionAttributes.value = optionData.value;
        if (optionData.value === cellValue) {
          optionAttributes.selected = '';
        }
        optionElem = Utils.createDomElem('option', this.cssClass,
          optionAttributes, optionData.text);
        selectElem.appendChild(optionElem);
      }

      return selectElem;
    };
  }

  Utils.inherit(SelectEditor, Editor);




  function ConfirmEditor() {
    SelectEditor.super.apply(this, arguments);

    this.getEditorElement = function () {
      var
        editor = Utils.createDomElem('div'),
        confirmBtn = Utils.createDomElem('button', CSS.EDITOR_CONFIRM,
          {}, 'ok'),
        declineBtn = Utils.createDomElem('button', CSS.EDITOR_DECLINE,
          {}, 'cancel');

      editor.appendChild(confirmBtn);
      editor.appendChild(declineBtn);
      return editor;
    };
  }

  Utils.inherit(ConfirmEditor, Editor);




  SmartTable.Editor = Editor;
})(SmartTable || {});
