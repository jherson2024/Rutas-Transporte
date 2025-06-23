// === Funciones de coordenadas ===
function parseCoord(input) {
    const parts = input.split(',').map(p => parseFloat(p.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) return null;
    return { lat: parts[0], lng: parts[1] };
}

function distanciaCoord(a, b) {
    const R = 6371e3; // metros
    const φ1 = a.lat * Math.PI / 180, φ2 = b.lat * Math.PI / 180;
    const Δφ = (b.lat - a.lat) * Math.PI / 180;
    const Δλ = (b.lng - a.lng) * Math.PI / 180;

    const aVal = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
}

// === Lógica para seleccionar en mapa ===
let seleccionando = null; // 'origen' o 'destino'
let marcadorOrigen = null;
let marcadorDestino = null;

function seleccionarCoordenada(tipo) {
    seleccionando = tipo;
    alert(`Haz clic en el mapa para seleccionar el ${tipo}`);
}

function actualizarMarcador(tipo, latlng) {
    if (tipo === 'origen') {
        if (marcadorOrigen) map.removeLayer(marcadorOrigen);
        marcadorOrigen = L.marker(latlng).addTo(map).bindPopup("Origen").openPopup();
    } else if (tipo === 'destino') {
        if (marcadorDestino) map.removeLayer(marcadorDestino);
        marcadorDestino = L.marker(latlng).addTo(map).bindPopup("Destino").openPopup();
    }
}

// Asegúrate de que este código se ejecuta después de que el mapa se haya inicializado
map.on('click', function (e) {
    if (!seleccionando) return;

    const { lat, lng } = e.latlng;
    const coord = `${lat.toFixed(6)},${lng.toFixed(6)}`;

    if (seleccionando === 'origen') {
        document.getElementById('origen').value = coord;
        actualizarMarcador('origen', e.latlng);
    } else if (seleccionando === 'destino') {
        document.getElementById('destino').value = coord;
        actualizarMarcador('destino', e.latlng);
    }

    seleccionando = null;
});

// === Buscar rutas cercanas ===
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
                    const coords = r.puntos;
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
                    li.innerHTML = `
                        <div style="margin-bottom: 10px;">
                            <strong>${r.nombre}</strong> - ${r.descripcion || 'Sin descripción'}<br>
                            <small>Combi: ${r.nombre_combi || 'N/D'}</small><br>
                            ${r.imagen_url ? `<img src="${r.imagen_url}" alt="Imagen de combi" style="max-width:150px;">` : ''}
                            <br>
                            <button onclick="verRuta(${r.id})">👁️ Ver</button>
                            <button onclick="verModalRuta(${r.id})">ℹ️</button>
                        </div>
                    `;
                    ul.appendChild(li);
                });
                resultado.appendChild(ul);
            }
        });
}
