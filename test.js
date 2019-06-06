let promise = new Promise(function (resolve) {
  setTimeout(function () {
    resolve("hello")
  }, 2000);
})

promise.then(function (data) {
  console.log(data)
})
