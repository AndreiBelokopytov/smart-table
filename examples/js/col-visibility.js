(function () {
  'use strict';

  var
    Users = window.Users,
    smartTable,
    columns = [
    {
      title: 'Id',
      property: 'id'
    },
    {
      title: 'First Name',
      property: 'first_name'
    },
    {
      title: 'LastName',
      property: 'last_name'
    },
    {
      title: 'Email',
      property: 'email'
    },
    {
      title: 'Gender',
      property: 'gender',
      type: 'select',
      selectOptions: [
        {
          text: 'Male',
          value: 'Male'
        },
        {
          text: 'Female',
          value: 'Female'
        }
      ]
    },
    {
      title: 'Registered',
      property: 'registered',
      type: 'checkbox',
      width: 120
    }
  ];

  smartTable = new SmartTable({
    element: '.container',
    columns: columns,
    actions: {
      getData: getData
    }
  });
  
  addControls($('.controls'));
  
  function getData(callback) {
    callback(Users);
  }
  
  function addControls($container) {
    var
      colIndex,
      $ul = $('<ul/>'),
      $checkbox,
      $label,
      $li;

    columns.forEach(function (col, index) {
      colIndex = index + 1;
      $li = $('<li/>');
      $label = $('<label class="toggle-column"/>');
      $checkbox = $('<input type="checkbox" value="' + colIndex + '"/>');
      if (!col.hidden) {
        $checkbox.attr('checked', '');
      }
      $li.append($label.append($checkbox).append(col.title));
      $ul.append($li);
    });

    $container.on('click', 'input[type="checkbox"]', function () {
      smartTable.toggleColumns($(this).val());
    });
    $container.append($ul);
  }
})();
