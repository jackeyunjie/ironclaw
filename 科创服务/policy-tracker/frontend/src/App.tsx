import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Policies from './pages/Policies';
import PolicyDetail from './pages/PolicyDetail';
import Enterprise from './pages/Enterprise';
import Applications from './pages/Applications';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="policies" element={<Policies />} />
              <Route path="policies/:id" element={<PolicyDetail />} />
              <Route path="enterprise" element={<Enterprise />} />
              <Route path="applications" element={<Applications />} />
            </Route>
          </Routes>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;