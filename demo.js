const PENDING = "pending";
const REJECTED = "rejected";
const FULFILLED = "fulfilled";

class MyPromise {
  constructor(f) {
    if(!this.isFunction(f)) {
      throw "The function argument must be a function!";
    }
    this._value = null;
    this._state = PENDING;
    this._onFulfilled = null;
    this._onRejected = null;
    try{
      f(this._resolve.bind(this), this._reject.bind(this));
    }catch (e) {
      // console.log("wjefiowjeiowjifowjeoi")
      this._reject(e);
    }
  }

  static resolve(value) {
    if(value instanceof MyPromise) return value;

    return new MyPromise(function (resolve) {
      resolve(value);
    })
  }

  static reject(value) {
    if(value instanceof MyPromise) return value;

    return new MyPromise(function (resolve, reject) {
      reject(value);
    })
  }
  
  static all(list) {
    return new MyPromise((resolve, reject) => {
      let i=0,
        res=[];
      for(let val of list) {
        MyPromise.resolve(val).then(function (data) {
          i++;
          res.push(data);
          if(i === list.length){
            resolve(res);
          }
        }, function (error) {
          reject(error);
        })
      }
    })
  }

  static race(list) {
    return new MyPromise((resolve, reject) => {
      for(let val of list) {
        MyPromise.resolve(val).then(function (data) {
          resolve(data);
        }, function (error) {
          reject(error);
        })
      }
    })
  }

  finally(f) {
    try {
      f();
    }catch (e) {
      return MyPromise.reject(e);
    }
    return this.then(function (data) {
      return data;
    }, function (error) {
      return error;
    })
  }

  //catch方法
  catch(reject) {
    this.then(null, (err) => reject(err));
  }

  //接受两个函数作为参数
  then(onFulfilled, onRejected) {
    //返回一个新的promise
    return new MyPromise((resolve, reject) => {
      let fulfilled = () => {
        try {
          if(!this.isFunction(onFulfilled)) {
            resolve(this._value);
          }else {
            let res = onFulfilled(this._value);
            if(res instanceof MyPromise) {
              res.then(resolve, reject);
            }else {
              resolve(res);
            }
          }
        }catch (e) {
          console.log("catch")
          reject(e);
        }
      }
      let rejected = () => {
        try {
          if(!this.isFunction(onRejected)) {
            reject(this._value);
          }else {
            let res = onRejected(this._value);
            if(res instanceof MyPromise) {
              res.then(resolve, reject);
            }else {
              resolve(res);
            }
          }
        }catch (e) {
          reject(e);
        }
      }
      setTimeout( () => {
        switch (this._state) {
          case FULFILLED:
            fulfilled();
            break;
          case REJECTED:
            rejected();
            break;
          case PENDING:
            this._onFulfilled = fulfilled;
            this._onRejected = rejected;
            break;
        }
      })
    })
  }

  _resolve(data) {
    if(this._state === PENDING) {
      this._state = FULFILLED;
      this._value = data;

      if(this.isFunction(this._onFulfilled)) {
        this._onFulfilled(this._value);
      }
    }
  }

  _reject(error) {
    if(this._state === PENDING) {
      this._state = REJECTED;
      this._value = error;
    }
  }

  isFunction(f) {
    if(typeof f === "function") {
      return true;
    }

    return false;
  }
}