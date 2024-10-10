const map = L.map('map').setView([-38.859, -68.097], 13);

// Capa base de OpenStreetMap
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Capa base de Google Satellite (requiere una clave de API)
const googleSatelliteLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '© Google',
    subdomains: '0123',
    maxZoom: 20
});

// Capa base de Google Roads (requiere una clave de API)
const googleRoadsLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    attribution: '© Google',
    subdomains: '0123',
    maxZoom: 20
});

// Agregar la capa base predeterminada (OpenStreetMap)
osmLayer.addTo(map);

// Variables globales
let markers = L.markerClusterGroup(); // Inicializar el grupo de marcadores
let regionsLayer;
let ejidosLayer;

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

// Función para obtener el color según la región
function getColorByRegion(region) {
    switch(region) {
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

// Función para obtener el color según la categoría
function getColorByCategory(categoria) {
    switch(categoria) {
        case "Primera Categoría": return "#c73d3f"; // Rojo
        case "Segunda Categoría": return "#fec980"; // Amarillo
        case "Tercera Categoría": return "#c7e8ad"; // Verde claro
        case "Comisión de Fomento": return "#2b83ba"; // Azul
        default: return "#cccccc"; // Color por defecto
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

// Cargar datos GeoJSON de alojamientos
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
        return fetch('regiones.geojson'); // Cargar regiones
    })
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
                color: getColorByRegion(feature.properties.region) || '#000000',
                weight: 2,
                fillOpacity: 0.5
            }),
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`
                    <b>Región:</b> ${feature.properties.region || 'Sin nombre'}<br>
                    <b>Departamentos:</b> ${feature.properties.depto || 'Sin descripción'}
                `);
            }
        });

        map.addLayer(regionsLayer);
        return fetch('ejidos.geojson'); // Cargar ejidos
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo GeoJSON de ejidos');
        }
        return response.json();
    })
    .then(data => {
        ejidosLayer = L.geoJson(data, {
            style: feature => ({
                color: getColorByCategory(feature.properties.categoria) || '#cccccc',
                weight: 2,
                fillOpacity: 0.5
            }),
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`
                    <b>Ejido:</b> ${feature.properties.nombre || 'Sin nombre'}
                `);
            }
        });

        // No añadir ejidosLayer al mapa para que esté desactivada por defecto
        // map.addLayer(ejidosLayer);

        // Crear el control de capas
        const overlayMaps = {
            "Alojamientos": markers,
            "Regiones": regionsLayer,
            "Ejidos": ejidosLayer // Capa de ejidos en el control pero desactivada
        };

        const baseMaps = {
            "OpenStreetMap": osmLayer,
            "Google Satellite": googleSatelliteLayer,
            "Google Roads": googleRoadsLayer
        };

        // Agregar el control de capas
        L.control.layers(baseMaps, overlayMaps).addTo(map);
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
        alert('No se pudo cargar el mapa. Verifique la consola para más detalles.');
    });

// Lógica para abrir/cerrar la leyenda
const toggleButton = document.getElementById('toggle-legend');
const legend = document.getElementById('legend');

toggleButton.addEventListener('click', () => {
    const isExpanded = legend.style.display === 'block';
    legend.style.display = isExpanded ? 'none' : 'block';
    toggleButton.textContent = isExpanded ? 'Mostrar Leyenda' : 'Ocultar Leyenda';
    toggleButton.setAttribute('aria-expanded', !isExpanded);
});

// Lógica para los botones de las secciones de la leyenda
const toggleAccommodations = document.getElementById('toggle-accommodations');
const accommodations = document.getElementById('accommodations');

toggleAccommodations.addEventListener('click', () => {
    const isExpanded = accommodations.style.display === 'block';
    accommodations.style.display = isExpanded ? 'none' : 'block';
    toggleAccommodations.textContent = isExpanded ? 'Alojamientos' : 'Ocultar Alojamientos';
    toggleAccommodations.setAttribute('aria-expanded', !isExpanded);
});

const toggleRegions = document.getElementById('toggle-regions');
const regions = document.getElementById('regions');

toggleRegions.addEventListener('click', () => {
    const isExpanded = regions.style.display === 'block';
    regions.style.display = isExpanded ? 'none' : 'block';
    toggleRegions.textContent = isExpanded ? 'Regiones' : 'Ocultar Regiones';
});

// Lógica para los botones de la sección de ejidos
const toggleEjidos = document.getElementById('toggle-ejidos');
const ejidos = document.getElementById('ejidos');

toggleEjidos.addEventListener('click', () => {
    const isExpanded = ejidos.style.display === 'block';
    ejidos.style.display = isExpanded ? 'none' : 'block';
    toggleEjidos.textContent = isExpanded ? 'Ejidos' : 'Ocultar Ejidos';
    toggleEjidos.setAttribute('aria-expanded', !isExpanded);
});
