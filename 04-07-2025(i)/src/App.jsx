import { useState, createContext } from 'react'
import TaskInput from './Component/TaskInput.jsx'
import Tasklist from './Component/Tasklist.jsx'
import { TaskProvider } from './TaskContext.jsx'
import Darkmode from './Component/Darkmode.jsx'
import ClearTask from './Component/ClearTask.jsx'



function App() {
  return(
    <>
      <div className="position-relative" style={{ minHeight: '60px' }}>
        <Darkmode />
      </div>
      <TaskProvider>
        <div>        
          <TaskInput />
          <ClearTask />
          <Tasklist />
        </div>
      </TaskProvider>
      {/* <footer className="text-center mt-4">
        <p>Made with ❤️ by Rahul Patel</p>
        <p>© 2025</p>
      </footer> */}
    </>
  )
}

export default App
