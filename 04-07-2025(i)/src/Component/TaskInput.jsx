import React, { useState, useContext } from 'react'
import { TaskContext } from '../TaskContext'

function TaskInput() {
    const [inputValue, setInputValue] = useState("");
    const { addTask } = useContext(TaskContext);

    function handelSubmit(e) {
        e.preventDefault();
        if (inputValue.trim() === "") return;
        addTask(inputValue);
        setInputValue("");
    }
    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">To Do List</h1>
            <form onSubmit={handelSubmit} className="d-flex justify-content-center mb-3 gap-2">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Enter your task"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Add Task</button>
            </form>
        </div>
    );
}

export default TaskInput
