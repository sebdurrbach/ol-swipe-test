import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';

import { Map } from 'ol';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle } from 'ol/style';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import { getRenderPixel } from 'ol/render';
import RenderEvent from 'ol/render/Event';
import { cityLayer } from '../data/city-layer';
import { regionLayer } from '../data/region-layer';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements AfterViewInit {

  map: Map | undefined;
  center = transform([2, 46], 'EPSG:4326', 'EPSG:3857');
  source = new OSM();
  baseMap = new TileLayer({
    source: this.source,
  });

  readonly swipeMax = 200;
  readonly swipeDefault = 100;

  dataLayerGroup = new LayerGroup({
    zIndex: 5000,
    layers: [cityLayer, regionLayer],
  });

  swipeLayer = new TileLayer({
    source: this.source,
  });

  copyImageLayer = new VectorLayer({
    source: cityLayer.getSource() || undefined,
    style: cityLayer.getStyle(),
  });

  swipeLayerGroup = new LayerGroup({
    zIndex: 10000,
    layers: [this.swipeLayer, this.copyImageLayer],
  });

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      this.map = new Map({
        target: 'ol-map',
        view: new View({
          center: this.center,
          zoom: 6,
          projection: 'EPSG:3857',
        }),
        layers: [this.baseMap, this.swipeLayerGroup, this.dataLayerGroup],
      });
    });

    const swipe = document.getElementById('swipe') as HTMLInputElement;

    swipe.addEventListener('input', (e) => {
      if (!this.map) return;
      this.map.render();
    });

    this.swipeLayerGroup
      .getLayers()
      .getArray()
      .forEach((layer) => {
        // @ts-ignore
        layer.on('postrender', (event: RenderEvent) => {
          const ctx = event.context as CanvasRenderingContext2D;
          ctx.restore();
        });

        // @ts-ignore
        layer.on('prerender', (event: RenderEvent) => {
          if (!event) return;
          const ctx = event.context as CanvasRenderingContext2D;
          if (!ctx || !this.map) return;
          const mapSize = this.map.getSize() || [0, 0];
          const swipeRatio = +swipe.value / this.swipeMax;
          const width = mapSize[0] * swipeRatio;

          // Swipe on right
          const tl = getRenderPixel(event, [width, 0]);
          const tr = getRenderPixel(event, [mapSize[0], 0]);
          const bl = getRenderPixel(event, [width, mapSize[1]]);
          const br = getRenderPixel(event, mapSize);

          // Swipe on left
          // const tl = getRenderPixel(event, [0, 0]);
          // const tr = getRenderPixel(event, [width, 0]);
          // const bl = getRenderPixel(event, [0, mapSize[1]]);
          // const br = getRenderPixel(event, [width, mapSize[1]]);

          // Swipe on top
          // const tl = getRenderPixel(event, [0, 0]);
          // const tr = getRenderPixel(event, [mapSize[0], 0]);
          // const bl = getRenderPixel(event, [0, mapSize[1] * swipeRatio]);
          // const br = getRenderPixel(event, [mapSize[0], mapSize[1] * swipeRatio]);

          // Swipe on bottom
          // const tl = getRenderPixel(event, [0, mapSize[1] * swipeRatio]);
          // const tr = getRenderPixel(event, [mapSize[0], mapSize[1] * swipeRatio]);
          // const bl = getRenderPixel(event, [0, mapSize[1]]);
          // const br = getRenderPixel(event, mapSize);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(tl[0], tl[1]);
          ctx.lineTo(bl[0], bl[1]);
          ctx.lineTo(br[0], br[1]);
          ctx.lineTo(tr[0], tr[1]);
          ctx.closePath();
          ctx.clip();
        });
      });
  }
}
