import React from 'react'

function Edit({ onEdit }) {
  return (
    <button className="btn btn-warning btn-sm me-2" onClick={onEdit}>
      Edit
    </button>
  )
}

export default Edit
