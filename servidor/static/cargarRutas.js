// Cargar rutas existentes
fetch('/rutas')
    .then(res => res.json())
    .then(rutas => {
        console.log("Rutas cargadas:", rutas);

        rutas.forEach(ruta => {
            try {
                // Validar puntos
                if (!Array.isArray(ruta.puntos) || ruta.puntos.length === 0) {
                    console.warn(`⚠️ Ruta ID ${ruta.id} sin puntos.`);
                    return;
                }

                const puntosOrdenados = ruta.puntos
                    .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number')
                    .sort((a, b) => a.orden - b.orden);

                if (puntosOrdenados.length === 0) {
                    console.warn(`⚠️ Ruta ID ${ruta.id} tiene puntos inválidos.`);
                    return;
                }

                const latlngs = puntosOrdenados.map(p => [p.lat, p.lng]);
                const color = ruta.color || getColorForRuta(ruta.id);

                console.log(`✅ Dibujando ruta ID ${ruta.id} con ${latlngs.length} puntos.`);

                const polyline = L.polyline(latlngs, { color }).addTo(drawnItems);
                polyline._rutaId = ruta.id;

                polyline.bindPopup(`
                    <strong>${ruta.nombre || "Ruta sin nombre"}</strong><br>
                    <em>${ruta.descripcion || ""}</em>
                `);

                const lista = document.getElementById('lista-rutas');
                if (lista) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span style="display:inline-block;width:12px;height:12px;background:${color};margin-right:6px;border-radius:2px;"></span>
                        <strong>${ruta.nombre || "Ruta " + ruta.id}</strong>
                        <button onclick="verRuta(${ruta.id})">👁️</button>
                        <button onclick="verModalRuta(${ruta.id})">ℹ️</button>
                        <button onclick="editarRuta(${ruta.id})">🖉</button>
                        <button onclick="eliminarRuta(${ruta.id})">🗑️</button>
                    `;
                    lista.appendChild(li);
                }

            } catch (err) {
                console.error(`❌ Error procesando ruta ID ${ruta.id}:`, err);
            }
        });

        // Ajustar la vista si se dibujaron capas
        if (drawnItems.getLayers().length > 0) {
            map.fitBounds(drawnItems.getBounds());
            console.log("📍 Mapa ajustado a rutas cargadas");
        } else {
            console.warn("🛑 No se dibujaron capas en el mapa.");
        }
    })
    .catch(err => console.error("❌ Error cargando rutas:", err));
