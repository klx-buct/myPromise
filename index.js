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
    f(this._resolve.bind(this), this._reject.bind(this));
  }else {
    throw new Error('myPromise must accept a function as a parameter')
  }
}

myPromise.prototype._reject = function (error) {
  if(this.state === PENDING) {
    this.state = REJECTED;
    this.err = error;
    if(typeof this.onRejected === "function") {
      this.onRejected(this.err);
    }
  }
  console.log("reject");
}

myPromise.prototype._resolve = function (data) {
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
      if (typeof this.onFulfilled === "function") {
        this.onFulfilled(this.data);
      }
    }
  }
}

//then方法异步执行,返回一个新的Promise
myPromise.prototype.then = function(resolve, reject) {
  let that = this;
  let res;
  console.log(that)


  return new myPromise((resolveNext, rejectNext) => {

  })




}

let promise = new myPromise(function (resolve, reject) {
  // console.log("promise");
  setTimeout(function () {
    resolve("success");
  }, 2000)
}).then(function (data) {
  console.log(data);
}, function () {
  // console.log("error");
})

// console.log(promise);

// new myPromise("efw");