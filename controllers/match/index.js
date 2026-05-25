console.log("this line after loading routers")
module.exports = {

  ...require("./create_match"),
/*
const obj1 = { a: 1 };
const obj2 = { b: 2 };
const final = {
   ...obj1,
   ...obj2
};
thus the purpose of the spread operator(...)
 */
  ...require("./get_matches"),

  ...require("./choose_batting"),

  ...require("./update_score"),

  ...require("./update_status"),
};