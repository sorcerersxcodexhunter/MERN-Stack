import { useState } from 'react'
import React from 'react'
import Btn from './Components/button.jsx'
import Form from './Components/form.jsx'

  function Apps() {
  return (
    <div>
      <Form />
    </div>
  )
}

function App() {
  return (
    <h2 className='container'>Form</h2>
  )
}

export default {
  App,
  Apps
}
