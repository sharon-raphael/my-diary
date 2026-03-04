import { AppProvider } from './contexts/AppContext';

function SimpleTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test - If you see this, React is working</h1>
      <p>The app is loading...</p>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <SimpleTest />
    </AppProvider>
  );
}

export default App;
