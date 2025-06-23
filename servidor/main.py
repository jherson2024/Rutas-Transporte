from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from routers import rutas

app = FastAPI()
app.include_router(rutas.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def index():  # ← vista pública
    with open("static/mapa.html", encoding="utf-8") as f:
        return f.read()

@app.get("/admin", response_class=HTMLResponse)
def admin():  # ← vista de administrador
    with open("static/admin.html", encoding="utf-8") as f:
        return f.read()
