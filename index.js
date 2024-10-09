const map = L.map('map').setView([-38.859, -68.097], 13);

// Capas base
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const googleSatelliteLayer = L.tileLayer('https://{s}.google.com/maps/vt?x={x}&y={y}&z={z}&s=Ga', {
    maxZoom: 20,
    attribution: 'Google Satellite'
});

const googleRoadLayer = L.tileLayer('https://{s}.google.com/maps/vt?x={x}&y={y}&z={z}&s=Ga', {
    maxZoom: 20,
    attribution: 'Google Roads'
});

// Agrupar las capas base
const baseMaps = {
    "OpenStreetMap": osmLayer,
    "Google Satellite": googleSatelliteLayer,
    "Google Roads": googleRoadLayer
};

// Capa de Alojamientos
const markers = L.markerClusterGroup();

fetch('alojamientos.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo GeoJSON de alojamientos');
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.features || data.features.length === 0) {
            throw new Error('No se encontraron alojamientos en el archivo GeoJSON.');
        }

        data.features.forEach(feature => {
            const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
            const color = getColorByClass(feature.properties.clase);
            const markerIcon = createMarkerIcon(color);

            const marker = L.marker(latlng, { icon: markerIcon }).bindPopup(`
                <b>Nombre:</b> ${feature.properties.nombre || 'Sin nombre'}<br>
                <b>Dirección:</b> ${feature.properties.direccion || 'Sin dirección'}<br>
                <b>Clase:</b> ${feature.properties.clase || 'Sin clase'}<br>
                <b>Categoría:</b> ${feature.properties.categoria || 'Sin categoría'}
            `);

            markers.addLayer(marker);
        });

        map.addLayer(markers);
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON de alojamientos:', error);
        alert('No se pudo cargar la capa de alojamientos. Verifique la consola para más detalles.');
    });

// Capa de Regiones
let regionsLayer;

fetch('regiones.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo GeoJSON de regiones');
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.features || data.features.length === 0) {
            throw new Error('No se encontraron regiones en el archivo GeoJSON.');
        }

        regionsLayer = L.geoJson(data, {
            style: feature => ({
                color: getColorByRegion(feature.properties.region),
                weight: 2,
                fillOpacity: 0.5
            })
        });

        // No agregar la capa al mapa para que esté desactivada inicialmente
        // map.addLayer(regionsLayer); // Esta línea ha sido comentada
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON de regiones:', error);
        alert('No se pudo cargar la capa de regiones. Verifique la consola para más detalles.');
    });

// Control de capas
const overlays = {
    "Alojamientos": markers,
    "Regiones": regionsLayer
};

L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);

// Funciones de color
function getColorByClass(clase) {
    switch (clase) {
        case "AGROTURISMO aloj. Camping": return "red";
        case "AGROTURISMO s/alojamiento": return "orange";
        case "Albergue Turístico u Hostel": return "blue";
        case "Alojamiento en Estancia Turística": return "green";
        case "Apart-hotel": return "purple";
        case "Bed & Breakfast": return "pink";
        case "Bodega": return "brown";
        case "Cabañas": return "cyan";
        case "Dormis": return "magenta";
        case "Dormis / Cabaña": return "lightblue";
        case "ESTANCIA TURISTICA s/aloj.": return "darkgreen";
        case "Hostería": return "darkblue";
        case "Hotel": return "black";
        case "Motel": return "darkred";
        case "None": return "gray";
        case "Residencial": return "yellow";
        case "Turismo Rural": return "lightgreen";
        case "Turismo Rural / Vivienda tcas": return "lightcoral";
        case "Vivienda Turística": return "lime";
        case "Vivienda Turística / Cabaña": return "slateblue";
        default: return "gray"; // Color por defecto
    }
}

function getColorByRegion(region) {
    switch (region) {
        case "Centro Oeste": return "#f4ff92";
        case "Comarca Petrolera": return "#ff9029";
        case "Confluencia": return "#d7f1eb";
        case "Norte": return "#c0a483";
        case "Limay Medio": return "#519b8d";
        case "Sur": return "#ff5389";
        case "Vaca Muerta": return "#b775c4";
        default: return "#ffffff"; // Color por defecto
    }
}

// Función para crear un ícono de marcador
function createMarkerIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}
