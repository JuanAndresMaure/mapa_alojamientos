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
    .then(response => response.json())
    .then(data => {
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
    });

// Capa de Regiones
const regionColors = {
    "Centro Oeste": "#f4ff92",
    "Comarca Petrolera": "#ff9029",
    "Confluencia": "#d7f1eb",
    "Norte": "#c0a483",
    "Limay Medio": "#519b8d",
    "Sur": "#ff5389",
    "Vaca Muerta": "#b775c4"
};

const regionsLayer = L.geoJson(null, {
    style: function (feature) {
        return { color: regionColors[feature.properties.region] || 'gray' };
    }
});

fetch('regiones.geojson')
    .then(response => response.json())
    .then(data => {
        regionsLayer.addData(data);
        map.addLayer(regionsLayer);
    });

// Control de capas
const overlays = {
    "Alojamientos": markers,
    "Regiones": regionsLayer
};

L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);

// Ajustar la vista del mapa
const bounds = L.geoJson(data).getBounds();
map.fitBounds(bounds);

// Función para obtener el color según la clase
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

// Función para crear un ícono de marcador
function createMarkerIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; border-radius: 50%; width: 20px; height: 20px; border: 2px solid white;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}
