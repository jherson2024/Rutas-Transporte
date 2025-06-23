from sqlalchemy import create_engine

# Configura tu base de datos (ajusta usuario, contraseña, y nombre si es necesario)
DATABASE_URL = "mysql+pymysql://root:1234@localhost/rutas2"

# Crear motor de conexión
engine = create_engine(DATABASE_URL)
