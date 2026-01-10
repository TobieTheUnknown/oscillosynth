import './App.css'
import { AudioErrorBoundary } from './components/AudioErrorBoundary'
import { AudioTest } from './components/AudioTest'

function App() {
  return (
    <AudioErrorBoundary>
      <div className="app">
        <AudioTest />
      </div>
    </AudioErrorBoundary>
  )
}

export default App
