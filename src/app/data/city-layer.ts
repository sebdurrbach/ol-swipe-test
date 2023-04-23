import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";

const cityFeatures = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [2.3522, 48.8566],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [4.8357, 45.764],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [5.3698, 43.2965],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [1.4442, 43.6043],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-0.5792, 44.8378],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-1.6753, 48.1173],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [3.0573, 50.6292],
      },
    },
  ],
};

const citySource = new VectorSource({
  features: (new GeoJSON()).readFeatures(cityFeatures, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  }),
});

export const cityLayer = new VectorLayer({
  source: citySource,
  zIndex: 9000,
  style: new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.5)',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 1)',
        width: 1,
      }),
    }),
  }),
});