var taskInp = document.getElementById('task');
var addTasks = document.getElementById('addTask');
var taskList = document.getElementById('taskList');

function addTask() {
  var taskText = taskInp.value.trim();
  if (taskText === "") {
    alert("Enter Task");
    return;
  }

  var listItem = document.createElement('li');
  listItem.classList.add("tasklistinstance")

  
  var taskspan = document.createElement('span');

 
  
  taskspan.textContent = taskText;

  var delButton = document.createElement("button");
   delButton.classList.add("delbtn")

//   delButton.style.backgroundColor ="red"
//   delButton.style.display ="flex"
//   delButton.style.justifySelf ="end"
//   delButton.style.justifySelf ="end"
//   delButton.style.borderRadius ="3px"

  delButton.textContent = "Delete";

  listItem.appendChild(taskspan);
  listItem.appendChild(delButton);
  taskList.appendChild(listItem);

  delButton.addEventListener("click", function deleteTask(e) {
    e.target.parentNode.remove();
  });

  taskInp.value = ""; 
  taskspan.addEventListener("click",function(e){
          taskspan.classList.toggle("completed");
  
      
  });
}
addTasks.addEventListener("click", addTask);
taskInp.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    addTask(); 
  }
});



