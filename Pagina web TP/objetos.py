import os
import json
import base64
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
DATA_FILE = "data.json"

# Crear carpetas si no existen
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ===== Funciones para guardar/cargar JSON =====
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_data(items):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

# ===== Rutas =====
@app.route("/")
def index():
    items = load_data()
    return render_template("index.html", items=items)

@app.route("/add", methods=["POST"])
def add():
    items = load_data()
    nombre = request.form.get("nombre")
    if not nombre:
        return redirect(url_for("index"))

    categoria = request.form.get("categoria")
    cantidad = request.form.get("cantidad") or "0"
    fecha = request.form.get("fecha")
    nota = request.form.get("nota")
    image_data = request.form.get("foto")

    filename = None
    if image_data:
        image_data = image_data.split(",")[1]  # quitar "data:image/png;base64,"
        image_bytes = base64.b64decode(image_data)
        filename = f"{nombre.replace(' ', '_')}.png"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(filepath, "wb") as f:
            f.write(image_bytes)

    items.append({
        "nombre": nombre,
        "categoria": categoria,
        "cantidad": cantidad,
        "fecha": fecha,
        "nota": nota,
        "foto": filename
    })
    save_data(items)
    return redirect(url_for("index"))

@app.route("/delete/<int:index>")
def delete(index):
    items = load_data()
    if 0 <= index < len(items):
        # Eliminar foto si existe
        if items[index]["foto"]:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], items[index]["foto"])
            if os.path.exists(filepath):
                os.remove(filepath)
        # Eliminar registro
        items.pop(index)
        save_data(items)
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)
