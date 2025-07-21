const employee = [
  { name: "rahul", age: 21 },
  { name: "kishor", age: 25 },
  { name: "rohit", age: 21 },
];

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
}

const group = groupBy(employee, emp => emp.age);
console.log(group);
