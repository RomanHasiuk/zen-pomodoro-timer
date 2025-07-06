import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TimerPage from './pages/TimerPage';
import FullscreenPage from './pages/FullscreenPage';
import { SettingsProvider } from './contexts/SettingsContext.tsx';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter basename="/zen-pomodoro-timer/">
        <Routes>
          <Route path="/" element={<TimerPage />} />
          <Route path="/fullscreen-timer" element={<FullscreenPage />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
