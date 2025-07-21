import  { useContext } from 'react';
import { TaskContext } from '../TaskContext';

function ClearTask() {
  const { tasks, setTasks } = useContext(TaskContext);

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  return (
    <div className="d-flex justify-content-end" style={{ marginRight: '100px' }}>
      <button className="btn btn-outline-danger my-2" style={{ minWidth: 170 }} onClick={clearCompleted}>
        Clear Completed Tasks
      </button>
    </div>
  );
}

export default ClearTask;
