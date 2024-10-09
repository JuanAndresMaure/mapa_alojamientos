const map = L.map('map').setView([-38.859, -68.097], 13);

// Capa base de OpenStreetMap
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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

// Crear un ícono de marcador de tipo "agua"
function createMarkerIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; border-radius: 5px; width: 20px; height: 10px; border: 2px solid white;"></div>`,
        iconSize: [20, 10],
        iconAnchor: [10, 5]
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
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
        alert('No se pudo cargar el mapa. Verifique la consola para más detalles.');
    });

// Añade el evento para mostrar/ocultar la leyenda
document.getElementById('toggle-legend').addEventListener('click', () => {
    const legend = document.getElementById('legend');
    legend.style.display = legend.style.display === 'none' ? 'block' : 'none';
});
