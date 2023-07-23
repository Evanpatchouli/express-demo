class User {
    constructor(name, passwd) {
      this.name = name;
      this.passwd = passwd;
    }
  
    toString() {
      return '(' + this.name + ', ' + this.passwd + ')';
    }
}

module.exports = User;