(function () {
  'use strict';

  var
    Users = window.Users,
    smartTable,
    columns = [
      {
        title: 'Id',
        property: 'id',
        filter: {
          type: 'text'
        }
      },
      {
        title: 'First Name',
        property: 'first_name',
        filter: {
          type: 'text'
        }
      },
      {
        title: 'LastName',
        property: 'last_name',
        filter: {
          type: 'text'
        }
      },
      {
        title: 'Email',
        property: 'email',
        width: 220,
        filter: {
          type: 'text'
        }
      },
      {
        title: 'Gender',
        property: 'gender',
        filter: {
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
        width: 110
      },
      {
        title: 'Registered',
        property: 'registered',
        filter: {
          type: 'checkbox'
        },
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

  function getData(callback) {
    callback(Users);
  }
})();
