function editarRuta(id) {
    const form = document.getElementById('form-subir-ruta');
    form.style.display = 'block';
    form.setAttribute('data-edicion', id); // Indicar modo edición

    fetch('/rutas')
        .then(res => res.json())
        .then(data => {
            const ruta = data.find(r => r.id === id);
            if (!ruta) {
                alert("Ruta no encontrada.");
                return;
            }

            // Llenar formulario con los datos de la ruta
            form.querySelector('input[name="nombre"]').value = ruta.nombre;
            form.querySelector('input[name="descripcion"]').value = ruta.descripcion || '';
            form.querySelector('input[name="color"]').value = ruta.color || '#000000';
            form.querySelector('input[name="nombre_combi"]').value = ruta.nombre_combi || '';

            // Guardar los puntos como JSON en el atributo dataset (no se editan)
            form.dataset.ruta = JSON.stringify(ruta.puntos || []);

            // Imagen no obligatoria en edición
            form.querySelector('input[name="imagen"]').required = false;

            // Cambiar texto del botón
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = "Actualizar ruta";
        });
}
