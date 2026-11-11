import { BrowserRouter } from 'react-router-dom';
import { FournisseurAuthentification } from './contexts/ContexteAuthentification';
import Routeur from './router/Routeur';

export default function App() {
  return (
    <FournisseurAuthentification>
      <BrowserRouter>
        <Routeur />
      </BrowserRouter>
    </FournisseurAuthentification>
  );
}
