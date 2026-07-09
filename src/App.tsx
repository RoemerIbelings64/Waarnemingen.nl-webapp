import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { MapPage } from './features/map/MapPage';
import { DetailView } from './features/detail/DetailView';

/**
 * De kaart is altijd de basis; het detailscherm rendert als overlay bovenop
 * dezelfde kaart (aparte route zodat de URL deelbaar is).
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MapPage />
        <Routes>
          <Route path="/waarneming/:id" element={<DetailView />} />
          <Route path="*" element={null} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
