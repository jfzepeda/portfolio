import React from 'react';
import CatalogTab from './CatalogTab';
import { catalogs } from './config';

const RangosCaiTab = () => {
  const config = catalogs.find((c) => c.key === 'rangos-cai');
  return <CatalogTab config={config} />;
};

export default RangosCaiTab;
