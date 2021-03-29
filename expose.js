const tf = require("@tensorflow/tfjs");


const ten = tf.tensor([[1, 4, 4]]);
ten.data().then(val =>{console.log(val[0])})
// console.log(val)