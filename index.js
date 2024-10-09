const map = L.map('map').setView([-38.859, -68.097], 13);

// Capas base de Google
const googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Google Satellite'
});

const googleRoadmap = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Google Roadmap'
});

const googleTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Google Terrain'
});

// Capa base de OpenStreetMap
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Capa de alojamientos
let markersLayer;

// Crear el grupo de marcadores para clustering
const markers = L.markerClusterGroup();

// Función para obtener el icono según la clase
function getIconByClass(clase) {
    switch (clase) {
        case "Bodega": return new L.Icon({ iconUrl: 'https://example.com/icon-bodega.png', iconSize: [25, 41] }); // Cambia el URL
        // Agrega más clases aquí
        default: return new L.Icon({ iconUrl: 'https://example.com/icon-default.png', iconSize: [25, 41] }); // Cambia el URL
    }
}

// Cargar datos GeoJSON
fetch('alojamientos.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo GeoJSON');
        }
        return response.json();
    })
    .then(data => {
        const bounds = L.geoJson(data).getBounds();
        map.fitBounds(bounds);

        data.features.forEach(feature => {
            const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
            const icon = getIconByClass(feature.properties.clase);
            const marker = L.marker(latlng, { icon }).bindPopup(`
                <b>Nombre:</b> ${feature.properties.nombre || 'Sin nombre'}<br>
                <b>Dirección:</b> ${feature.properties.direccion || 'Sin dirección'}<br>
                <b>Clase:</b> ${feature.properties.clase || 'Sin clase'}<br>
                <b>Categoría:</b> ${feature.properties.categoria || 'Sin categoría'}
            `);
            markers.addLayer(marker);
        });

        // Añadir el grupo de marcadores al mapa
        markers.addTo(map);

        // Agrega las capas a la caja de capas
        const baseMaps = {
            "OpenStreetMap": osmLayer,
            "Google Satélite": googleSatellite,
            "Google Mapa": googleRoadmap,
            "Google Terreno": googleTerrain
        };

        const overlayMaps = {
            "Alojamientos": markers
        };

        // Crea el control de capas
        L.control.layers(baseMaps, overlayMaps).addTo(map);
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
        alert('No se pudo cargar el mapa. Verifique la consola para más detalles.');
    });
