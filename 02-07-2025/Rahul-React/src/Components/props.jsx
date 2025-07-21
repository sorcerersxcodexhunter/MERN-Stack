const Batch = () => {
  let student = ["Rahul", "Ravi", "Rohit", "Raj", "Ramesh"];
  return (
    <div className="container">
      <h2 className="text-center">Students List</h2><b><hr /></b>
      {/* <ul className="list-group">
        {student.map((name, index) => (
          <li key={index} className="list-group-item">
            {name}
          </li>
        ))}
      </ul> */}
      <Coordinator studentList={student} />
    </div>
  );
};

const Coordinator = (props) => {
  console.log(props);
  return (
    <>
      <h6>{props.studentList[0]}</h6><hr />
      <h6>{props.studentList[1]}</h6><hr />
      <h6>{props.studentList[2]}</h6><hr />
      <h6>{props.studentList[3]}</h6><hr />
      <h6>{props.studentList[4]}</h6><hr />
    </>
  )
};
export default Batch

