import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import SongNew from './pages/SongNew';
import SongDetail from './pages/SongDetail';
import SongEdit from './pages/SongEdit';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="songs/:id" element={<SongDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="songs/new" element={<SongNew />} />
          <Route path="songs/:id/edit" element={<SongEdit />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-ink-light">Page not found</h2>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
