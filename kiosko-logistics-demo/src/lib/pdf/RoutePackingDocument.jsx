/**
 * Documento PDF de armado de cajas, generado con @react-pdf/renderer.
 *
 * Layout: cuadrícula de 6 ilustraciones (caja × nivel) por página A4 vertical
 * (2 columnas × 3 filas). Cada tile incluye contenedor visual y mini-leyenda.
 *
 * No es un componente React de runtime — solo lo consume @react-pdf/renderer
 * desde `buildRoutePackingPdf` / `buildStoresZip`.
 */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { autoFontSize, colorContrastText, groupByLayer, scaleToFit, truncateText } from './layoutHelpers';

const TILES_PER_PAGE = 6;

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: '1pt solid #e5e7eb',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 9,
    color: '#475569',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tile: {
    width: '49%',
    height: '32%',
    border: '0.6pt solid #e2e8f0',
    borderRadius: 4,
    padding: 4,
    flexDirection: 'column',
  },
  tileTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: '#0F172A',
  },
  tileSubtitle: {
    fontSize: 7,
    color: '#64748B',
    marginBottom: 2,
  },
  containerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    border: '0.8pt solid #0F172A',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  rect: {
    position: 'absolute',
    border: '0.3pt solid rgba(0,0,0,0.18)',
  },
  rectText: {
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  swatch: {
    width: 5,
    height: 5,
    marginRight: 2,
  },
  legendText: {
    fontSize: 6,
    color: '#475569',
  },
  watermark: {
    position: 'absolute',
    bottom: 8,
    right: 24,
    fontSize: 6,
    color: '#94A3B8',
  },
});

const TILE_CANVAS = { width: 230, height: 130 };

function PackingTile({ tile }) {
  const { box, layer, boxIndex, layerNumber, totalLayers, shipment } = tile;
  const [boxL, boxH, boxD] = box.box_dims || [40, 40, 40];
  const scale = scaleToFit(box.box_dims || [boxL, boxH, boxD], TILE_CANVAS);
  const containerW = boxL * scale;
  const containerH = boxD * scale;

  // SKUs únicos en el nivel para la mini-leyenda
  const skuMap = new Map();
  for (const p of layer.placements) {
    const key = p.nombre || p.sku || `SKU_${p.color}`;
    if (!skuMap.has(key)) skuMap.set(key, p.color);
  }
  const legendEntries = [...skuMap.entries()].slice(0, 4);
  const legendOverflow = skuMap.size - legendEntries.length;

  return (
    <View style={styles.tile}>
      <Text style={styles.tileTitle}>
        Caja {boxIndex + 1} · Nivel {layerNumber}/{totalLayers}
      </Text>
      <Text style={styles.tileSubtitle}>
        Tienda {shipment?.id_tienda || '—'} · {Math.round((box.fill_pct || 0) * 100) / 100}% · {layer.placements.length} prods
      </Text>

      <View style={styles.containerWrap}>
        <View style={[styles.container, { width: containerW, height: containerH }]}>
          {layer.placements.map((p, i) => {
            const x = (p.x || 0) * scale;
            const y = (p.z || p.y || 0) * scale;
            const w = (p.length || p.l || 1) * scale;
            const h = (p.width || p.w || 1) * scale;
            const fontSize = autoFontSize(w, h, (p.nombre || '').length || 4, 6);
            return (
              <View
                key={`${i}-${p.x}-${p.y}`}
                style={[
                  styles.rect,
                  {
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    backgroundColor: p.color || '#cbd5e1',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rectText,
                    {
                      fontSize,
                      color: colorContrastText(p.color || '#cbd5e1'),
                      marginTop: Math.max(0, h / 2 - fontSize),
                    },
                  ]}
                >
                  {truncateText(p.nombre || '', Math.max(3, Math.floor(w / 3)))}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legendRow}>
        {legendEntries.map(([nombre, color]) => (
          <View style={styles.legendItem} key={nombre}>
            <View style={[styles.swatch, { backgroundColor: color || '#cbd5e1' }]} />
            <Text style={styles.legendText}>{truncateText(nombre, 12)}</Text>
          </View>
        ))}
        {legendOverflow > 0 && (
          <Text style={styles.legendText}>+{legendOverflow} más</Text>
        )}
      </View>
    </View>
  );
}

function buildTiles(shipments) {
  const tiles = [];
  for (const shipment of shipments) {
    const boxes = shipment?.boxes || [];
    for (let boxIndex = 0; boxIndex < boxes.length; boxIndex++) {
      const box = boxes[boxIndex];
      const layers = groupByLayer(box);
      const totalLayers = layers.length;
      for (let i = 0; i < layers.length; i++) {
        tiles.push({
          shipment,
          box,
          layer: layers[i],
          boxIndex,
          layerNumber: i + 1,
          totalLayers,
        });
      }
    }
  }
  return tiles;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function RoutePackingDocument({ ruta, shipments, storeName }) {
  const items = Array.isArray(shipments) ? shipments : [shipments];
  const tiles = buildTiles(items);
  const pages = tiles.length ? chunk(tiles, TILES_PER_PAGE) : [[]];
  const isSingleStore = items.length === 1;
  const totalBoxes = items.reduce((s, sh) => s + (sh.boxes?.length || 0), 0);
  const totalItems = items.reduce(
    (s, sh) => s + (sh.boxes || []).reduce((a, b) => a + (b.placements?.length || 0), 0),
    0,
  );

  const titleText = isSingleStore
    ? `Armado tienda ${storeName || items[0]?.id_tienda || ''}${ruta ? ` · Ruta ${ruta}` : ''}`
    : `Armado ruta ${ruta || ''}`;

  return (
    <Document title={titleText}>
      {pages.map((pageTiles, pi) => (
        <Page key={pi} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{titleText}</Text>
            <Text style={styles.subtitle}>
              {isSingleStore
                ? `${totalBoxes} cajas · ${totalItems} productos`
                : `${items.length} tiendas · ${totalBoxes} cajas · ${totalItems} productos`}
              {' · '}Página {pi + 1}/{pages.length}
            </Text>
          </View>
          <View style={styles.grid}>
            {pageTiles.map((tile, ti) => (
              <PackingTile
                key={`${tile.shipment.id_tienda}-${tile.boxIndex}-${tile.layer.layer_idx}-${ti}`}
                tile={tile}
              />
            ))}
          </View>
          <Text style={styles.watermark}>KIOSKO · armado generado automáticamente</Text>
        </Page>
      ))}
    </Document>
  );
}
