import folium

# Coordenadas del centro de Arequipa
lat, lon = -16.3988, -71.5350

# Crear un mapa interactivo centrado en Arequipa
m = folium.Map(location=[lat, lon], zoom_start=13, tiles='OpenStreetMap')

# Guardar como archivo HTML (como un "Google Maps" de Arequipa)
m.save("mapa_arequipa.html")
