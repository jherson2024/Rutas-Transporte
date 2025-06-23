from fastapi import APIRouter, Request, HTTPException,Form,UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy import text
import shutil, os, uuid, json
from database import engine
import json

router = APIRouter()

# =========================
# POST /guardar
# =========================
@router.post("/guardar")
async def guardar_ruta(
    nombre: str = Form(...),
    descripcion: str = Form(""),
    color: str = Form("#000000"),
    nombre_combi: str = Form("Combi genérica"),
    ruta_json: str = Form(...),
    imagen: UploadFile = File(...)
):
    try:
        # Guardar imagen
        ext = os.path.splitext(imagen.filename)[1]
        nombre_imagen = f"{uuid.uuid4().hex}{ext}"
        path_imagen = os.path.join("static/imagenCombi", nombre_imagen)

        with open(path_imagen, "wb") as buffer:
            shutil.copyfileobj(imagen.file, buffer)

        # Insertar en la base de datos
        puntos = json.loads(ruta_json)

        if not puntos or not isinstance(puntos, list):
            raise ValueError("Puntos inválidos")

        with engine.begin() as conn:
            result = conn.execute(text("""
                INSERT INTO rutas (nombre, descripcion, color, nombre_combi, imagen_url)
                VALUES (:nombre, :descripcion, :color, :nombre_combi, :imagen_url)
            """), {
                "nombre": nombre,
                "descripcion": descripcion,
                "color": color,
                "nombre_combi": nombre_combi,
                "imagen_url": f"/static/imagenCombi/{nombre_imagen}"
            })

            id_ruta = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()

            for i, p in enumerate(puntos):
                conn.execute(text("""
                    INSERT INTO puntos (id_ruta, lat, lng, orden, lugar)
                    VALUES (:id_ruta, :lat, :lng, :orden, NULL)
                """), {
                    "id_ruta": id_ruta,
                    "lat": p["lat"],
                    "lng": p["lng"],
                    "orden": i
                })

        return {"status": "ok", "id": id_ruta}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)



# =========================
# GET /rutas
# =========================
@router.get("/rutas")
def obtener_rutas():
    try:
        with engine.connect() as conn:
            rutas_result = conn.execute(text("SELECT * FROM rutas ORDER BY id DESC"))
            rutas = [dict(row._mapping) for row in rutas_result]

            for ruta in rutas:
                puntos_result = conn.execute(
                    text("SELECT id, lat, lng, orden, lugar FROM puntos WHERE id_ruta = :id ORDER BY orden ASC"),
                    {"id": ruta["id"]}
                )
                ruta["puntos"] = [dict(p._mapping) for p in puntos_result]

        return rutas

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# =========================
# PUT /editar/{ruta_id}
# =========================
@router.put("/editar/{ruta_id}")
async def editar_ruta(ruta_id: int, request: Request):
    try:
        data = await request.json()
        nuevos_puntos = data.get("ruta", [])

        if not nuevos_puntos or not isinstance(nuevos_puntos, list):
            raise ValueError("Lista de puntos inválida o vacía")

        with engine.begin() as conn:
            # 1. Borrar puntos anteriores
            conn.execute(
                text("DELETE FROM puntos WHERE id_ruta = :id_ruta"),
                {"id_ruta": ruta_id}
            )

            # 2. Insertar nuevos puntos
            for i, p in enumerate(nuevos_puntos):
                conn.execute(
                    text("""
                        INSERT INTO puntos (id_ruta, lat, lng, orden, lugar)
                        VALUES (:id_ruta, :lat, :lng, :orden, NULL)
                    """),
                    {
                        "id_ruta": ruta_id,
                        "lat": p["lat"],
                        "lng": p["lng"],
                        "orden": i
                    }
                )

        return {"status": "actualizado"}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# =========================
# DELETE /eliminar/{ruta_id}
# =========================
@router.delete("/eliminar/{ruta_id}")
def eliminar_ruta(ruta_id: int):
    try:
        with engine.begin() as conn:
            # Primero borrar puntos relacionados
            conn.execute(
                text("DELETE FROM puntos WHERE id_ruta = :id"),
                {"id": ruta_id}
            )
            # Luego borrar la ruta
            conn.execute(
                text("DELETE FROM rutas WHERE id = :id"),
                {"id": ruta_id}
            )

        return {"status": "eliminado"}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# =========================
# PUT /modificar/{ruta_id}
# =========================
@router.put("/modificar/{ruta_id}")
async def modificar_info_ruta(ruta_id: int, request: Request):
    try:
        data = await request.json()
        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        color = data.get("color")
        nombre_combi = data.get("nombre_combi")

        if not nombre or not color:
            raise HTTPException(status_code=400, detail="Faltan datos obligatorios")

        with engine.begin() as conn:
            conn.execute(text("""
                UPDATE rutas
                SET nombre = :nombre,
                    descripcion = :descripcion,
                    color = :color,
                    nombre_combi = :nombre_combi
                WHERE id = :id
            """), {
                "nombre": nombre,
                "descripcion": descripcion,
                "color": color,
                "nombre_combi": nombre_combi,
                "id": ruta_id
            })

        return {"status": "modificado"}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
