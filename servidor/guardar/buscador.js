document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('btnOrigen').addEventListener('click', () => seleccionarCoordenada('origen'));
    document.getElementById('btnDestino').addEventListener('click', () => seleccionarCoordenada('destino'));
});
function seleccionarCoordenada(tipo) {
    seleccionando = tipo;
    alert(`Haz clic en el mapa para seleccionar el ${tipo}`);
}
window.seleccionarCoordenada = seleccionarCoordenada; 
let seleccionando = null; // puede ser 'origen' o 'destino'

const map = L.map('map').setView([-16.409047, -71.537451], 13); // Ajusta según tu configuración

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Manejador de clics
map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    const coord = `${lat.toFixed(6)},${lng.toFixed(6)}`;

    if (seleccionando === 'origen') {
        document.getElementById('origen').value = coord;
    } else if (seleccionando === 'destino') {
        document.getElementById('destino').value = coord;
    }

    seleccionando = null;
});

// Opcional: marcadores visuales
let marcadorOrigen = null, marcadorDestino = null;

function actualizarMarcador(tipo, latlng) {
    if (tipo === 'origen') {
        if (marcadorOrigen) map.removeLayer(marcadorOrigen);
        marcadorOrigen = L.marker(latlng).addTo(map).bindPopup("Origen").openPopup();
    } else if (tipo === 'destino') {
        if (marcadorDestino) map.removeLayer(marcadorDestino);
        marcadorDestino = L.marker(latlng).addTo(map).bindPopup("Destino").openPopup();
    }
}

function parseCoord(input) {
    const parts = input.split(',').map(p => parseFloat(p.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) return null;
    return { lat: parts[0], lng: parts[1] };
}

function distanciaCoord(a, b) {
    const R = 6371e3; // metros
    const φ1 = a.lat * Math.PI/180, φ2 = b.lat * Math.PI/180;
    const Δφ = (b.lat-a.lat) * Math.PI/180;
    const Δλ = (b.lng-a.lng) * Math.PI/180;

    const aVal = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1-aVal));
    return R * c;
}
function buscarRuta() {
    const origen = parseCoord(document.getElementById('origen').value);
    const destino = parseCoord(document.getElementById('destino').value);
    const resultado = document.getElementById('resultado-busqueda');
    resultado.innerHTML = '';

    if (!origen || !destino) {
        resultado.textContent = "Coordenadas inválidas.";
        return;
    }

    fetch('/rutas')
        .then(res => res.json())
        .then(rutas => {
            const encontradas = [];

            rutas.forEach(r => {
                try {
                    const coords = r.puntos; // ✅ CORREGIDO

                    if (!Array.isArray(coords) || coords.length < 2) return;

                    const cercaOrigen = coords.some(p => distanciaCoord(p, origen) < 300);
                    const cercaDestino = coords.some(p => distanciaCoord(p, destino) < 300);

                    if (cercaOrigen && cercaDestino) {
                        encontradas.push(r);
                    }
                } catch (err) {
                    console.error("Error en ruta", r.id, err);
                }
            });

            if (encontradas.length === 0) {
                resultado.textContent = "No se encontraron rutas cercanas.";
            } else {
                const ul = document.createElement('ul');
                encontradas.forEach(r => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${r.nombre}</strong> - ${r.descripcion || 'Sin descripción'} 
                        <button onclick="verRuta(${r.id})">👁️ Ver</button>`;
                    ul.appendChild(li);
                });
                resultado.appendChild(ul);
            }
        });
}

