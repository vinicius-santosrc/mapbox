import * as mapboxgl from 'mapbox-gl';

export function configureMapbox(accessToken: string) {
    (mapboxgl as typeof mapboxgl).accessToken = accessToken;
}
