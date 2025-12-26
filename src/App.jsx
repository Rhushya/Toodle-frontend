import './App.css';
import CourseBuilder from './components/modules/CourseBuilder';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <div className="app">
        <CourseBuilder />
      </div>
    </ToastProvider>
  );
}

export default App;
