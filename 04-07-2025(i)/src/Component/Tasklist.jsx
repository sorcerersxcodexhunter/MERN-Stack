import React, { useContext, useState } from 'react'
import { TaskContext } from '../TaskContext' 
import Edit from './Edit';

function Tasklist() {
    const { tasks, removeTask, toggleTask, updateTask } = useContext(TaskContext);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editValue, setEditValue] = useState("");

    const handleEdit = (idx, text) => {
        setEditingIdx(idx);
        setEditValue(text);
    };

    const handleEditChange = (e) => {
        setEditValue(e.target.value);
    };

    const handleEditSave = (idx) => {
        updateTask(idx, editValue);
        setEditingIdx(null);
        setEditValue("");
    };

    const handleEditCancel = () => {
        setEditingIdx(null);
        setEditValue("");
    };

    return (
        <div className="container mt-3">
            {tasks.length === 0 ? (
                <div className="alert alert-info text-center">No Task Added to the list</div>
            ) : (
                <ul className="list-group">
                    {tasks.map((task, idx) => (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                            {editingIdx === idx ? (
                                <>
                                    <input
                                        className="form-control me-2"
                                        value={editValue}
                                        onChange={handleEditChange}
                                        style={{flex: 1}}
                                    />
                                    <button className="btn btn-success btn-sm me-2" onClick={() => handleEditSave(idx)}>Save</button>
                                    <button className="btn btn-secondary btn-sm me-2" onClick={handleEditCancel}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span
                                        onClick={() => toggleTask(idx)}
                                        style={{
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            cursor: 'pointer',
                                            flex: 1
                                        }}
                                    >
                                        {task.text}
                                    </span>
                                    <Edit onEdit={() => handleEdit(idx, task.text)} />
                                </>
                            )}
                            <button className="btn btn-danger btn-sm ms-2" onClick={() => removeTask(idx)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Tasklist
