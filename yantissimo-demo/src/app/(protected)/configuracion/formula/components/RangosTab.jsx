import React from 'react';
import CatalogTab from './CatalogTab';
import { catalogs } from './config';

const RangosTab = () => {
  const config = catalogs.find((c) => c.key === 'rangos');
  return <CatalogTab config={config} />;
};

export default RangosTab;
