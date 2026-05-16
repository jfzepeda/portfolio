import React from 'react';
import CatalogTab from './CatalogTab';
import { catalogs } from './config';

const MontajeTab = () => {
  const config = catalogs.find((c) => c.key === 'montaje');
  return <CatalogTab config={config} />;
};

export default MontajeTab;
