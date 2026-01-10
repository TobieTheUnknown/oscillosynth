import './App.css'
import { AudioErrorBoundary } from './components/AudioErrorBoundary'
import { AudioTestV2 } from './components/AudioTestV2'

function App() {
  return (
    <AudioErrorBoundary>
      <div className="app">
        <AudioTestV2 />
      </div>
    </AudioErrorBoundary>
  )
}

export default App
