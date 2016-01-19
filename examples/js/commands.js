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
      },
      editor: {
        type: 'text'
      }
    },
    {
      title: 'LastName',
      property: 'last_name',
      filter: {
        type: 'text'
      },
      editor: {
        type: 'text'
      }
    },
    {
      title: 'Email',
      property: 'email',
      width: 220,
      filter: {
        type: 'text'
      },
      editor: {
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
        ],
      },
      editor: {
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
        ],
      },
      width: 110
    },
    {
      title: 'Registered',
      property: 'registered',
      filter: {
        type: 'checkbox',
        width: 120
      }
    },
    {
      type: 'edit',
      text: 'Edit',
      width: 80
    },
    {
      type: 'delete',
      text: 'Delete',
      width: 80
    }
  ];

  smartTable = new SmartTable({
    element: '.container',
    columns: columns,
    actions: {
      getData: getData,
      deleteRow: deleteUser,
      editRow: editUser
    }
  });

  function getUserIndexById(userId) {
    var userIndex = -1,
        usersLen = Users.length;

    while (usersLen--) {
      userIndex = usersLen;
      if (Users[userIndex].id === userId) {
        break;
      }
    }

    return userIndex;
  }

  function deleteUser(user, success) {
    var userIndex,
        actionApproved = window.confirm('Delete this row?');

    if (actionApproved) {
      userIndex = getUserIndexById(user.id);
      if (userIndex >= 0) {
        Users.splice(userIndex, 1);
        success();
      }
    }
  }

  function editUser(user, success) {
    var userIndex;

    userIndex = getUserIndexById(user.id);
    if (userIndex >= 0) {
      Users.splice(userIndex, 1, user);
      success();
    }
  }

  function getData(success) {
    success(Users);
  }
})();
