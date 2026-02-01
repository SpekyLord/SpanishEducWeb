import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  )
}

function Home() {
  return (
    <main className="main">
      <h1>SpanishConnect</h1>
      <p>A classroom community platform for Spanish learners</p>
    </main>
  )
}

export default App
