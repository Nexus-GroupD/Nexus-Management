import Navbar from './components/Navbar';
import Schedule from './pages/Schedule';

function App() {
  return (
    <>
      <Navbar pageTitle="Schedule" />
      <div className="App">
        <Schedule />
      </div>
    </>
  );
}

export default App;