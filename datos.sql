INSERT INTO rutas (nombre, descripcion, color, nombre_combi)
VALUES 
('A', 'Ruta que recorre la Av. Independencia desde Paucarpata hasta Cayma', '#FF5733', 'Combi A - Independencia'),
('Socabaya', 'Ruta que conecta Socabaya con el centro de Arequipa', '#33A1FF', 'Combi Socabaya - Cercado');

INSERT INTO puntos (id_ruta, lat, lng, orden, lugar)
VALUES
(8, -16.429215, -71.519981, 1, 'Terminal Paucarpata'), 
(8, -16.426910, -71.521123, 2, 'Av. Mariscal Castilla'), 
(8, -16.423801, -71.522902, 3, 'Cruce Av. Guardia Civil'), 
(8, -16.420519, -71.524233, 4, 'Av. Jesús - Puente Grau'), 
(8, -16.418120, -71.525812, 5, 'Hospital Goyeneche'), 
(8, -16.415002, -71.527311, 6, 'Av. Independencia - Metro'), 
(8, -16.411770, -71.528921, 7, 'Feria del Altiplano'), 
(8, -16.407880, -71.530312, 8, 'Parque Industrial'), 
(8, -16.405112, -71.532443, 9, 'Av. Independencia - UNSA'), 
(8, -16.402570, -71.536870, 10, 'Av. Ejército - Puente'), 
(8, -16.398901, -71.540001, 11, 'Av. Ejército - UTP'), 
(8, -16.395321, -71.543221, 12, 'Av. Ejército - Cayma'), 
(8, -16.390430, -71.546001, 13, 'Mall Cayma'); 
INSERT INTO puntos (id_ruta, lat, lng, orden, lugar)
VALUES
(9, -16.459801, -71.536900, 1, 'Plaza Socabaya'),
(9, -16.456712, -71.535402, 2, 'Av. Socabaya'),
(9, -16.452931, -71.534302, 3, 'Puente Socabaya'),
(9, -16.449801, -71.533212, 4, 'Calle Salaverry'),
(9, -16.446932, -71.533021, 5, 'Colegio Independencia'),
(9, -16.442812, -71.532210, 6, 'Av. La Marina'),
(9, -16.437591, -71.531002, 7, 'Puente San Martín'),
(9, -16.432121, -71.531899, 8, 'Av. La Paz'),
(9, -16.426019, -71.533909, 9, 'Plaza de Armas'),
(9, -16.421590, -71.534509, 10, 'Av. Goyeneche'),
(9, -16.415982, -71.535111, 11, 'Hospital Honorio Delgado'),
(9, -16.410210, -71.535890, 12, 'Estadio Melgar');
