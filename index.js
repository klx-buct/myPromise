/***
 * 1. 实现了基本的状态改变
 * 2. resolve有参数时，如果参数是promise，应该等待该promsie完成并且将状态替换为该promsie的状态
 * 3. 实现then
 * ***/

//promise有三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function myPromise(f) {
  this.state = PENDING;
  this.data = null;
  this.err = null;
  this.onFulfilled = null;
  this.onRejected = null;
  if(typeof f === "function") {
    try {
      f(this._resolve.bind(this), this._reject.bind(this));
    }catch (e) {
      this._reject(e);
    }
  }else {
    throw new Error('myPromise must accept a function as a parameter')
  }
}

myPromise.prototype._reject = function (error) {
  // console.log(error);
  // console.log(this);
  if(this.state === PENDING) {
    this.state = REJECTED;
    this.err = error;
    if(typeof this.onRejected === "function") {
      this.onRejected(this.err);
    }
  }
  // console.log("reject");
}

myPromise.prototype._resolve = function (data) {
  // console.log(this);
  if(this.state === PENDING) {
    //如果传入了一个promise作为参数，应该由promise的状态决定当前promise的状态
    let that = this;
    if(data instanceof myPromise) {
      setTimeout(function () {
        if(data.state === PENDING) {
          setTimeout(arguments.callee)
        }else{
          that.state = data.state;
          that.data = data.data;
          //状态改变以后再执行对应的回调函数,如果有的话
          if(that.state === FULFILLED && typeof that.onFulfilled === "function") {
            that.onFulfilled(that.data);
          }else if(typeof that.onREjected === "function"){
            that.onRejected(that.err);
          }
        }
      })
    }else {
      this.state = FULFILLED;
      // console.log(Object.getPrototypeOf(data) === myPromise.prototype);
      this.data = data;
      // console.log(this.onFulfilled)
      if (typeof this.onFulfilled === "function") {
        // console.log("fewfwefw")
        this.onFulfilled(this.data);
      }
    }
  }
}

//then方法异步执行,返回一个新的Promise
myPromise.prototype.then = function(resolve, reject) {
  let res;
  // console.log(that)


  return new myPromise((resolveNext, rejectNext) => {
    let onResolve = () => {
      try {
        if(typeof resolve != "function") {
          // console.log("cao")
          resolveNext(this.data)
        }else {
          // console.log("onresolve");
          let res = resolve(this.data);
          // res.data = "wejfiwoejfiwoefj";
          // console.log(res);
          if(res instanceof myPromise) {
            res.then(resolveNext, rejectNext);
          }else {
            resolveNext(res);
          }
        }
      }catch (e) {
        // console.log(e)
        rejectNext(e);
      }
    }
    let onReject = () => {
      try {
        // console.log("onreject")
        if(typeof reject != "function") {
          // console.log("reject")
          rejectNext(this.err);
        }else {
          let res = reject(this.err);
          if(res instanceof myPromise) {
            res.then(resolveNext, rejectNext);
          }else {
            resolveNext(res);
          }
        }
      }catch (e) {
        rejectNext(e);
      }
    }

    setTimeout(() => {
      switch (this.state) {
        case PENDING:
          // console.log(this)
          this.onFulfilled = onResolve;
          this.onRejected = onReject;
          break;
        case FULFILLED:
          // console.log(this)
          // console.log("fufilled")
          onResolve();
          break;
        case REJECTED:
          // console.log(this)
          // console.log("rejected")
          onReject();
          break;
      }
    })
  })
}

myPromise.prototype.catch = function(reject) {
  return this.then(function () {

  }, function (err) {
    reject(err);
  })
}

myPromise.prototype.resolve = function(val) {
  if(val instanceof myPromise) {
    return val;
  }

  return new myPromise(function (resolve) {
    resolve(val);
  })
}

myPromise.prototype.reject = function(err) {
  if(err instanceof myPromise) {
    return err;
  }

  return new myPromise(function (resolve, reject) {
    reject(err);
  })
}

myPromise.prototype.all = function(list) {
  return new myPromise((onResolve, onReject) => {
    let res = [],
        i=0;
    // console.log(this.prototype);
    // console.log(Object.getPrototypeOf(this));
    for(let val of list) {
      this.resolve(val).then(function (data) {
        i++;
        res.push(data);
        if(i === list.length) {
          // console.log(i);
          onResolve(res);
        }
      }, function (err) {
        onReject(err);
      })
    }
  })
}

myPromise.prototype.race = function(list) {
  return new myPromise((onResolve, onReject) => {
    for(let val of list) {
      this.resolve(val).then(function (data) {
        onResolve(data);
      }, function (err) {
        onReject(err);
      })
    }
  })
}

myPromise.prototype.finally = function(f) {
  return this.then(function (data) {
    f();
    return data;
  }, function (err) {
    f();
    return err;
  })
}



let promise = new myPromise(function (resolve, reject) {
  resolve("hello")
})

promise.finally(function () {
  console.log("xxxxx");
}).then(function (data) {
  // console.log("ewfjiwoejf")
  console.log(data)
}, function (err) {
  console.log(err)
})

// promise

// let promise = new myPromise(function (resolve) {
//   resolve();
// });
//
// // console.log(promise.resolve("1"));
//
// let p1 = new myPromise(function (resolve) {
//   setTimeout(function () {
//     resolve("1")
//   }, 1000);
// });
// let p2 = new myPromise(function (resolve) {
//   setTimeout(function () {
//     resolve("2")
//   }, 2000);
// });
// let p3 = new myPromise(function (resolve) {
//   setTimeout(function () {
//     resolve("3")
//   }, 3000);
// });
//
// (promise.race([p1, p2, p3])).then(function (data) {
//   console.log(data)
// }, function (err) {
//   console.log(err);
// })
