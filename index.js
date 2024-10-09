const map = L.map('map').setView([-38.859, -68.097], 13);

// Capa base de OpenStreetMap
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Capas base de Google
const googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Google Satellite'
});

const googleRoadmap = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Google Roadmap'
});

// Función para obtener el color según la clase
function getColorByClass(clase) {
    switch(clase) {
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

// Función para crear un ícono de marcador desde el SVG
function createMarkerIcon(color) {
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="50" fill="${color}">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15zm0 22.5c-4.136 0-7.5-3.364-7.5-7.5S10.864 7.5 15 7.5 22.5 10.864 22.5 15 19.136 22.5 15 22.5z"/>
    </svg>`;
    const iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon);
    return L.icon({
        iconUrl: iconUrl,
        iconSize: [30, 50], // Tamaño del ícono
        iconAnchor: [15, 50], // Punto de anclaje
        popupAnchor: [0, -40] // Punto de anclaje del popup
    });
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
        if (!data || !data.features || data.features.length === 0) {
            throw new Error('No se encontraron alojamientos en el archivo GeoJSON.');
        }

        const bounds = L.geoJson(data).getBounds();
        map.fitBounds(bounds);

        const markers = L.markerClusterGroup({
            spiderfyDistanceMultiplier: 1.2,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });

        data.features.forEach(feature => {
            const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
            const color = getColorByClass(feature.properties.clase);
            const markerIcon = createMarkerIcon(color);

            const marker = L.marker(latlng, {
                icon: markerIcon
            }).bindPopup(`
                <b>Nombre:</b> ${feature.properties.nombre || 'Sin nombre'}<br>
                <b>Dirección:</b> ${feature.properties.direccion || 'Sin dirección'}<br>
                <b>Clase:</b> ${feature.properties.clase || 'Sin clase'}<br>
                <b>Categoría:</b> ${feature.properties.categoria || 'Sin categoría'}
            `);

            markers.addLayer(marker);
        });

        map.addLayer(markers);

        // Controles de capas
        const baseMaps = {
            "OpenStreetMap": osmLayer,
            "Google Satélite": googleSatellite,
            "Google Mapa": googleRoadmap
        };

        const overlayMaps = {
            "Alojamientos": markers
        };

        L.control.layers(baseMaps, overlayMaps).addTo(map);
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
        alert('No se pudo cargar el mapa. Verifique la consola para más detalles.');
    });
