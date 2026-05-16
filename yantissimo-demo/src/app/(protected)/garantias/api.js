import { postJson, getJson } from '~/lib/api';

export const createGarantia = (data) => postJson('/api/garantias', data);
export const getGarantia    = (id)   => getJson(`/api/garantias/${id}`);
