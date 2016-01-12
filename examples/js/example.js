(function () {
  'use strict';

  var
    smartTable,
    columns = [
    {
      title: '#',
      type: 'index',
      width: 50
    },
    {
      title: 'Photo',
      property: 'user.picture.thumbnail',
      formatter: displayPhoto,
      noFilter: true,
      noSort: true,
      width: 96
    },
    {
      title: 'Username',
      property: 'user.username'
    },
    {
      title: 'Email',
      property: 'user.email',
      width: 230
    },
    {
      title: 'First Name',
      property: 'user.name.first'
    },
    {
      title: 'LastName',
      property: 'user.name.last'
    },
    {
      title: 'Gender',
      property: 'user.gender',
      type: 'select',
      width: 70,
      selectOptions: [
        {
          text: 'male',
          value: 'male'
        },
        {
          text: 'female',
          value: 'female'
        }
      ]
    },
    {
      title: 'Registered',
      property: 'user.registered',
      formatter: displayDate,
      type: 'range',
      width: 220,
      filter: {
        cssClass: 'datepicker',
        valueParser: parseDate
      }
    }
  ];

  function loadUsersData(success) {
    var count = 20;
    $.get('https://randomuser.me/api',
      {
        results: count
      },
      function (data) {
        success(data.results);
      });
  }

  function displayDate(val) {
    var d = new Date(val);
    if (d) {
      return moment(d).format('DD.MM.YYYY');
    }
    return '';
  }

  function displayPhoto(val) {
    return '<img src="' + val + '" /img>';
  }

  function parseDate(val) {
    if (val) {
      return +moment(val, 'DD.MM.YYYY');
    }
    return '';
  }

  function renderColumns() {
    var
      colIndex,
      $columnsContainer = $('.columns'),
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

    $columnsContainer.on('click', 'input[type="checkbox"]', function () {
      smartTable.toggleColumns($(this).val());
    });
    $columnsContainer.append($ul);
  }

  smartTable = new SmartTable({
    element: '.container',
    columns: columns,
    actions: {
      getData: loadUsersData
    }
  });

  $(".datepicker").datepicker({
    dateFormat: 'dd.mm.yy',
    onSelect: function () {
      //hack for jQuery UI datepicker widget
      var event = new Event('input', {
        bubbles: true
      });
      this.dispatchEvent(event);
    }
  });

  $('#btn-refresh').on('click', function () {
    smartTable.refresh();
  });

  renderColumns();

})();
