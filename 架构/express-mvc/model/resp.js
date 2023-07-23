let resp = {
    code: null,
    msg: null,
    data: null,
  
    Ok: (msg,data)=>{
      this.code = 200;
      this.msg = msg!=undefined? msg : 'success';
      this.data = data!=undefined? data : null;
    },

    Fail: (msg,data)=>{
      this.code = 400;
      this.msg = msg!=undefined? msg : 'failure';
      this.data = data!=undefined? data : null;
    }
    
  }