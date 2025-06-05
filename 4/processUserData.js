function processUserData(data: any) {
    var users = [];
  
    for (var i = 0; i < data.length; i++) {
      var user = {
        id: data[i].id,
        name: data[i].name,
        email: data[i].email,
        active: data[i].status === 'active' ? true : false
      };
      users.push(user);
    }
    console.log("Processed " + users.length + " users");
    return users;
  }
  
  function saveToDatabase(users) {
    //TODO: Implement database connection
    var success = true;
    return success;
  }