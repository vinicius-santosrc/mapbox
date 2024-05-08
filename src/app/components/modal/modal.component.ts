import { Component, OnInit } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit {
  private optionDrawSubject = new BehaviorSubject<string>('polygon');
  optionDraw$ = this.optionDrawSubject.asObservable();

  private equipment1Coordinates: [number, number] = [-46.09494089937112, -22.292710433796188];

  private equipments = [
    { name: 'Equipamento 1', coordinates: this.equipment1Coordinates },
    { name: 'Equipamento 2', coordinates: [-46.105740919852224, -22.298302215668805] },
  ];

  private equipment1Marker: mapboxgl.Marker | null = null;

  setOptionDraw(value: string) {
    this.optionDrawSubject.next(value);
  }

  ngOnInit(): void {
    mapboxgl.accessToken = 'pk.eyJ1IjoidmluaWNpdXNzYW50b3NjcyIsImEiOiJjbHZ1NHM3emgxaXgyMm5ycmlzOGZwOGE1In0.7dRFeTkv51-9nlUlAyD2FQ';
    const map = new mapboxgl.Map({ //Inicilizando o mapa
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-46.09494089937112, -22.292710433796188], //CENTRO DO MAPA INICIAL
      zoom: 15,
    });

    this.initializeEquipmentMarkers(map);

    this.optionDraw$.subscribe((optionDraw) => {
      if (optionDraw === 'polygon') { // Se o usuário escolher poligono
        const draw = new MapboxDraw({
          displayControlsDefault: true,
          controls: {
            polygon: true,
            trash: true,
          },
          defaultMode: 'draw_polygon',
        });

        map.addControl(draw);

        map.on('draw.create', (e: any) => this.updateAreaAndCheckEquipments(draw));
        map.on('draw.delete', (e: any) => this.updateAreaAndCheckEquipments(draw));
        map.on('draw.update', (e: any) => this.updateAreaAndCheckEquipments(draw));

        this.simulateEquipment1Movement(map, draw);
      }
    });
  }

  initializeEquipmentMarkers(map: mapboxgl.Map) { // Função para inicializar os marcadores
    this.equipments.forEach((equipment) => {
      this.addEquipmentMarker(equipment.name, equipment.coordinates, map);
    });
  }

  addEquipmentMarker(name: string, coordinates: any, map: mapboxgl.Map) { //Função para cada marcador, passando nome e cordenada.
    const svgIcon = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.12789 5.12162C6.16769 5.16005 6.19943 5.20603 6.22126 5.25686C6.2431 5.3077 6.2546 5.36237 6.25508 5.4177C6.25556 5.47302 6.24502 5.52789 6.22406 5.5791C6.20311 5.6303 6.17218 5.67682 6.13305 5.71595C6.09393 5.75507 6.04741 5.78601 5.9962 5.80696C5.945 5.82791 5.89013 5.83845 5.83481 5.83797C5.77948 5.83749 5.72481 5.82599 5.67397 5.80416C5.62314 5.78232 5.57716 5.75058 5.53872 5.71078C5.46282 5.6322 5.42083 5.52695 5.42178 5.4177C5.42272 5.30845 5.46655 5.20394 5.5438 5.12669C5.62105 5.04944 5.72556 5.00562 5.83481 5.00467C5.94405 5.00372 6.0493 5.04572 6.12789 5.12162ZM8.48497 2.76453C7.02278 1.30245 4.64383 1.30245 3.18164 2.76453L3.77081 3.3537C4.90799 2.21641 6.75831 2.21641 7.8956 3.3537L8.48487 2.76443L8.48497 2.76453ZM7.30643 3.94307C6.91299 3.54964 6.38976 3.33286 5.83331 3.33286C5.27685 3.33286 4.75362 3.54953 4.36018 3.94307L4.94945 4.53234C5.18549 4.2963 5.49945 4.1662 5.83331 4.1662C6.16716 4.1662 6.48112 4.2963 6.71716 4.53234L7.30643 3.94307ZM16.6666 15.4162V6.20224C16.6666 4.62005 15.3616 3.33286 13.7577 3.33286H9.16664V4.1662H13.7577C14.8828 4.1662 15.8333 5.09859 15.8333 6.20224V15.4162C15.8333 15.7238 15.7242 15.8329 15.4166 15.8329H4.58331C4.24456 15.8329 4.16664 15.755 4.16664 15.4162V4.99953H3.33331V15.4162C3.33331 16.2222 3.77727 16.6662 4.58331 16.6662H15.4166C16.1877 16.6662 16.6666 16.1872 16.6666 15.4162Z" fill="white"/>
      </svg>
    `;

    const markerElement = document.createElement('div');
    markerElement.classList.add('markerEquipament');
    markerElement.innerHTML = svgIcon;

    markerElement.style.width = '30px';
    markerElement.style.height = '30px';
    markerElement.style.background = '#0DD822';
    markerElement.style.borderRadius = '100%';
    markerElement.style.display = 'flex';
    markerElement.style.alignItems = 'center';
    markerElement.style.justifyContent = 'center';
    markerElement.style.boxShadow = '1px 1px 5px';

    const marker = new mapboxgl.Marker(markerElement)
      .setLngLat(coordinates)
      .addTo(map); //seta as cordenadas do marcador e passa para o mapa

    marker.setPopup(
      new mapboxgl.Popup({ offset: 15 }).setText(name) //Seta o texto para o marcador
    );

    marker.getPopup().addTo(map); //adiciona o marcador no mapa

    // Guarda uma referência ao marcador do equipamento 1
    if (name === 'Equipamento 1') {
      this.equipment1Marker = marker;
    }
  }

  updateAreaAndCheckEquipments(draw: MapboxDraw) {
    const data = draw.getAll();
    if (data.features.length > 0) {
      const polygonFeature = data.features.find((feature) => {
        if (feature.geometry) {
          const geomType = feature.geometry.type;
          return geomType === 'Polygon' || geomType === 'MultiPolygon';
        }
        return false;
      }) as turf.Feature<turf.Polygon | turf.MultiPolygon, turf.Properties>;

      if (polygonFeature) {
        this.equipments.forEach((equipment) => {
          const point = turf.point(equipment.coordinates);
          const isInside = turf.booleanPointInPolygon(point, polygonFeature); //retornará true se estiver dentro e false se nao
          if (isInside) {
            console.log(`${equipment.name} está dentro da área do polígono.`);
          } else {
            console.warn(`${equipment.name} está fora da área do polígono.`);
          }
        });
      }
    }
  }

  simulateEquipment1Movement(map: mapboxgl.Map, draw: any) { //Simulação de movimento do equipamento 1 ( adicionando valor baixo na log e lat )
    setInterval(() => {
      this.equipment1Coordinates[0] += 0.00001;
      this.equipment1Coordinates[1] += 0.00001;

      this.equipments[0].coordinates = this.equipment1Coordinates;

      if (this.equipment1Marker) {
        this.equipment1Marker.setLngLat(this.equipment1Coordinates);
      }

      this.updateAreaAndCheckEquipments(draw)

    }, 1000); // a cada segundo
  }
}
