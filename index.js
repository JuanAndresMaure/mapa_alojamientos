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

// Función para crear un ícono de marcador usando el SVG
function createMarkerIcon() {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/JuanAndresMaure/mapa_alojamientos/main/alojamiento.svg`,
        iconSize: [30, 50],
        iconAnchor: [15, 50],
        popupAnchor: [0, -40]
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
            const markerIcon = createMarkerIcon();

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

        // Crear la leyenda
        const leyenda = L.control({ position: 'bottomright' });

        leyenda.onAdd = function() {
            const div = L.DomUtil.create('div', 'leaflet-control-leyenda');
            div.innerHTML = `
                <h4>Leyenda de Alojamientos</h4>
                <i style="background: red"></i> AGROTURISMO aloj. Camping<br>
                <i style="background: orange"></i> AGROTURISMO s/alojamiento<br>
                <i style="background: blue"></i> Albergue Turístico u Hostel<br>
                <i style="background: green"></i> Alojamiento en Estancia Turística<br>
                <i style="background: purple"></i> Apart-hotel<br>
                <i style="background: pink"></i> Bed & Breakfast<br>
                <i style="background: brown"></i> Bodega<br>
                <i style="background: cyan"></i> Cabañas<br>
                <i style="background: magenta"></i> Dormis<br>
                <i style="background: lightblue"></i> Dormis / Cabaña<br>
                <i style="background: darkgreen"></i> ESTANCIA TURISTICA s/aloj.<br>
                <i style="background: darkblue"></i> Hostería<br>
                <i style="background: black"></i> Hotel<br>
                <i style="background: darkred"></i> Motel<br>
                <i style="background: gray"></i> None<br>
                <i style="background: yellow"></i> Residencial<br>
                <i style="background: lightgreen"></i> Turismo Rural<br>
                <i style="background: lightcoral"></i> Turismo Rural / Vivienda tcas<br>
                <i style="background: lime"></i> Vivienda Turística<br>
                <i style="background: slateblue"></i> Vivienda Turística / Cabaña<br>
            `;
            return div;
        };

        leyenda.addTo(map);
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
        alert('No se pudo cargar el mapa. Verifique la consola para más detalles.');
    });
