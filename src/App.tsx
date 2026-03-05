import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes';
import Layout from './app/components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;