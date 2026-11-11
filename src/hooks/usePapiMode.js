import { useEffect, useState } from 'react';
import api from '../api';

export default function usePapiMode() {
  const [configuration, setConfiguration] = useState({
    mode: 'indisponible',
    disponible: false,
  });
  useEffect(() => {
    api
      .get('/paiement-papi/mode')
      .then(setConfiguration)
      .catch(() => {});
  }, []);
  return configuration;
}
