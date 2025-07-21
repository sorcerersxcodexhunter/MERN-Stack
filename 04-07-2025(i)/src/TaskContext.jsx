import { createContext, useState } from "react";  

export const TaskContext = createContext()
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  
  const addTask = (task) => {
    setTasks([...tasks, {text: task, completed: false}]);
  };

  const removeTask = (taskIndex) => {
    setTasks(tasks.filter((_, index) => index !== taskIndex));
  };

  const toggleTask = (taskIndex) => {
    setTasks(tasks.map((task, idx) =>
      idx === taskIndex ? { ...task, completed: !task.completed } : task
    ));
  };

  const updateTask = (taskIndex, newText) => {
    setTasks(tasks.map((task, idx) =>
      idx === taskIndex ? { ...task, text: newText } : task
    ));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, removeTask, toggleTask, updateTask, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
}