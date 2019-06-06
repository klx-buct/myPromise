//promise有三种状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function myPromise(f) {
  this.state = PENDING;
  this.data = null;
  this.err = null;

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
  }
  console.log("reject");
}

myPromise.prototype._resolve = function (data) {
  if(this.state === PENDING) {
    this.state = FULFILLED;
    console.log("resolve");
    this.data = data;
  }
}

//then方法异步执行
myPromise.prototype.then = function(resolve, reject) {

}

let promise = new myPromise(function (resolve, reject) {
  console.log("promise");
  resolve("hello world");
})

console.log(promise);

new myPromise("efw");