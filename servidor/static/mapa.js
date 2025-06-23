const map = L.map('map').setView([-16.3988, -71.535], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
    draw: {
        polyline: { shapeOptions: { color: getRandomColor() } },
        polygon: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
    },
    edit: { featureGroup: drawnItems }
});
map.addControl(drawControl);

// Dibujar nueva ruta
map.on('draw:created', function (e) {
    const layer = e.layer;
    const coords = layer.getLatLngs();

    const puntos = coords.map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        orden: i
    }));

    // ✅ Añadir la línea al grupo visible en el mapa
    drawnItems.addLayer(layer);

    // Mostrar el formulario de subida
    const form = document.getElementById('form-subir-ruta');
    form.reset();
    delete form.dataset.edicion;
    form.dataset.ruta = JSON.stringify(puntos);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Guardar ruta";

    form.style.display = 'block';

    // Asignar comportamiento al enviar
    form.onsubmit = function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const rutaStr = form.dataset.ruta;
        const idEdicion = form.dataset.edicion;

        if (!rutaStr || rutaStr.trim() === "") {
            alert("Error: La ruta está vacía o no se generó correctamente.");
            return;
        }

        formData.set("ruta_json", rutaStr);

        if (idEdicion) {
            // === MODO EDICIÓN ===
            const data = {
                nombre: formData.get("nombre"),
                descripcion: formData.get("descripcion"),
                color: formData.get("color"),
                nombre_combi: formData.get("nombre_combi")
            };

            fetch(`/modificar/${idEdicion}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => {
                if (res.ok) {
                    alert("Ruta actualizada correctamente.");
                    location.reload();
                } else {
                    return res.text().then(t => { throw new Error(t); });
                }
            })
            .catch(err => {
                console.error("Error actualizando ruta:", err);
                alert("Error actualizando ruta.");
            });

        } else {
            // === MODO CREACIÓN ===
            fetch('/guardar', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (res.ok) {
                    alert("Ruta guardada con éxito.");
                    location.reload();
                } else {
                    return res.text().then(t => { throw new Error(t); });
                }
            })
            .catch(err => {
                console.error("Error guardando ruta:", err);
                alert("Error guardando ruta.");
            });
        }
    };
});


// Editar ruta existente
map.on('draw:edited', function (e) {
    e.layers.eachLayer(layer => {
        if (!layer._rutaId) {
            console.warn("Ruta sin ID, no se puede actualizar");
            return;
        }

        const coords = layer.getLatLngs().map((p, i) => ({
            lat: p.lat,
            lng: p.lng,
            orden: i
        }));

        fetch(`/editar/${layer._rutaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ruta: coords })
        })
        .then(res => res.json())
        .then(() => console.log(`Ruta ${layer._rutaId} actualizada`))
        .catch(err => console.error("Error actualizando ruta:", err));
    });
});

// Funciones auxiliares
function getColorForRuta(id) {
    const colors = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
        '#f58231', '#911eb4', '#46f0f0', '#f032e6',
        '#bcf60c', '#fabebe', '#008080', '#e6beff'
    ];
    return colors[id % colors.length];
}

function getRandomColor() {
    const colors = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
        '#f58231', '#911eb4', '#46f0f0', '#f032e6',
        '#bcf60c', '#fabebe', '#008080', '#e6beff'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function verRuta(id) {
    fetch('/rutas')
        .then(res => res.json())
        .then(data => {
            const ruta = data.find(r => r.id === id);
            if (!ruta || !Array.isArray(ruta.puntos) || ruta.puntos.length === 0) {
                alert("Ruta no encontrada o sin puntos.");
                return;
            }

            const coords = ruta.puntos
                .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
                .sort((a, b) => a.orden - b.orden);

            if (coords.length === 0) {
                alert("Esta ruta no tiene coordenadas válidas.");
                return;
            }

            // Mostrar detalles en el modal
            const detalle = document.getElementById('detalle-ruta');
            detalle.innerHTML = `
                <h3>${ruta.nombre}</h3>
                <p><strong>Descripción:</strong> ${ruta.descripcion || 'Sin descripción'}</p>
                <p><strong>Nombre de la combi:</strong> ${ruta.nombre_combi || 'N/D'}</p>
                ${ruta.imagen_url ? `<img src="${ruta.imagen_url}" alt="Imagen de combi" style="max-width:300px;">` : ''}
                <p><strong>Color:</strong> <span style="color:${ruta.color}">${ruta.color || 'N/A'}</span></p>
                <p><strong>Fecha:</strong> ${new Date(ruta.fecha).toLocaleString()}</p>
            `;

            // Dibujar la ruta en el mapa
            const latlngs = coords.map(c => [c.lat, c.lng]);
            const polyline = L.polyline(latlngs, {
                color: ruta.color || getColorForRuta(ruta.id),
                weight: 4,
                opacity: 0.9
            }).addTo(map);

            map.fitBounds(polyline.getBounds());

            setTimeout(() => {
                map.removeLayer(polyline);
            }, 8000);
        })
        .catch(err => {
            console.error("Error al ver ruta:", err);
            alert("Error cargando datos de la ruta.");
        });
}
function verModalRuta(id) {
    fetch('/rutas')
        .then(res => res.json())
        .then(data => {
            const ruta = data.find(r => r.id === id);
            if (!ruta) {
                alert("Ruta no encontrada.");
                return;
            }

            const contenidoHTML = `
                <h3>${ruta.nombre}</h3>
                <p><strong>Descripción:</strong> ${ruta.descripcion || 'Sin descripción'}</p>
                <p><strong>Nombre de la combi:</strong> ${ruta.nombre_combi || 'N/D'}</p>
                ${ruta.imagen_url ? `<img src="${ruta.imagen_url}" alt="Imagen de combi" style="max-width:300px;">` : ''}
                <p><strong>Color:</strong> <span style="color:${ruta.color}">${ruta.color || 'N/A'}</span></p>
                <p><strong>Fecha:</strong> ${new Date(ruta.fecha).toLocaleString()}</p>
            `;

            mostrarDetalleRuta(contenidoHTML);
        })
        .catch(err => {
            console.error("Error al cargar detalles:", err);
            alert("No se pudo cargar el detalle de la ruta.");
        });
}


function eliminarRuta(id) {
    if (confirm("¿Eliminar esta ruta?")) {
        fetch(`/eliminar/${id}`, { method: 'DELETE' })
            .then(() => location.reload())
            .catch(err => console.error("Error al eliminar ruta:", err));
    }
}

function exportarTodasRutas() {
    fetch('/rutas')
        .then(res => res.json())
        .then(data => {
            let txt = '';
            data.forEach(r => {
                if (!Array.isArray(r.puntos)) return;
                const coords = r.puntos.sort((a, b) => a.orden - b.orden);
                txt += `# ${r.nombre || 'Ruta ' + r.id} (${r.fecha})\n`;
                coords.forEach(p => {
                    txt += `${p.lat},${p.lng}\n`;
                });
                txt += '\n';
            });

            const blob = new Blob([txt], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'rutas_completas.txt';
            a.click();
            URL.revokeObjectURL(url);
        })
        .catch(err => console.error("Error exportando rutas:", err));
}