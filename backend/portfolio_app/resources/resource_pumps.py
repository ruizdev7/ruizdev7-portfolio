from flask import (
    Blueprint,
    jsonify,
    request,
    make_response,
    send_from_directory,
    current_app,
)
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from portfolio_app import db
from portfolio_app.models.tbl_pumps import Pump
from portfolio_app.schemas.schema_pumps import SchemaPump
from portfolio_app.decorators.auth_decorators import (
    require_permission,
    require_ownership_or_permission,
)

blueprint_api_pump = Blueprint("api_pump", __name__, url_prefix="")

# Configuración para archivos
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def allowed_file(filename):
    """Verificar si el archivo tiene una extensión permitida"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_pump_photo(file, pump_id):
    """Guardar una foto de bomba en el directorio correspondiente"""
    if file and allowed_file(file.filename):
        # Generar nombre único para el archivo
        file_extension = file.filename.rsplit(".", 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        # Crear directorio si no existe
        pump_dir = os.path.join("portfolio_app", "static", "pumps", pump_id)
        os.makedirs(pump_dir, exist_ok=True)

        # Guardar archivo
        file_path = os.path.join(pump_dir, unique_filename)
        file.save(file_path)

        return unique_filename
    return None


@blueprint_api_pump.route("api/v1/pumps", methods=["POST"])
@jwt_required()
@require_permission("pumps", "create")
def create_pump():
    try:
        # Obtener datos del formulario
        request_data = request.form.to_dict()

        # Validar datos requeridos
        required_fields = [
            "model",
            "serial_number",
            "location",
            "purchase_date",
            "status",
            "flow_rate",
            "pressure",
            "power",
            "efficiency",
            "voltage",
            "current",
            "power_factor",
            "last_maintenance",
            "next_maintenance",
            "user_id",
        ]

        for field in required_fields:
            if field not in request_data:
                return make_response(
                    jsonify({"error": f"Missing required field: {field}"}), 400
                )

        new_pump = Pump(
            model=request_data["model"],
            serial_number=request_data["serial_number"],
            location=request_data["location"],
            purchase_date=datetime.fromisoformat(
                request_data["purchase_date"].replace("Z", "+00:00")
            ),
            status=request_data["status"],
            flow_rate=float(request_data["flow_rate"]),
            pressure=float(request_data["pressure"]),
            power=float(request_data["power"]),
            efficiency=float(request_data["efficiency"]),
            voltage=float(request_data["voltage"]),
            current=float(request_data["current"]),
            power_factor=float(request_data["power_factor"]),
            last_maintenance=datetime.fromisoformat(
                request_data["last_maintenance"].replace("Z", "+00:00")
            ),
            next_maintenance=datetime.fromisoformat(
                request_data["next_maintenance"].replace("Z", "+00:00")
            ),
            user_id=int(request_data["user_id"]),
        )

        db.session.add(new_pump)
        db.session.flush()  # Para obtener el ID antes del commit

        # Manejar archivos de fotos
        uploaded_photos = []
        files = request.files.getlist("photos")

        for file in files:
            if file.filename != "":
                # Validar tamaño del archivo
                file.seek(0, os.SEEK_END)
                file_size = file.tell()
                file.seek(0)

                if file_size > MAX_FILE_SIZE:
                    return make_response(
                        jsonify(
                            {
                                "error": f"File {file.filename} is too large. Max size: 5MB"
                            }
                        ),
                        400,
                    )

                saved_filename = save_pump_photo(file, new_pump.ccn_pump)
                if saved_filename:
                    new_pump.add_photo(saved_filename)
                    uploaded_photos.append(saved_filename)

        db.session.commit()

        schema_pump = SchemaPump(many=False)
        pump_data = schema_pump.dump(new_pump)

        # Agregar información de fotos subidas
        pump_data["uploaded_photos"] = uploaded_photos

        return make_response(jsonify({"Pump": pump_data}), 201)

    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_pump.route("api/v1/pumps/<string:ccn_pump>/photos", methods=["POST"])
@jwt_required()
@require_permission("pumps", "update")
def upload_pump_photos(ccn_pump):
    """Endpoint dedicado para subir fotos a una bomba existente"""
    try:
        pump = Pump.query.filter_by(ccn_pump=ccn_pump).first()
        if not pump:
            return make_response(jsonify({"msg": "Pump not found"}), 404)

        files = request.files.getlist("photos")
        if not files or all(file.filename == "" for file in files):
            return make_response(jsonify({"error": "No files selected"}), 400)

        uploaded_photos = []

        for file in files:
            if file.filename != "":
                # Validar tamaño del archivo
                file.seek(0, os.SEEK_END)
                file_size = file.tell()
                file.seek(0)

                if file_size > MAX_FILE_SIZE:
                    return make_response(
                        jsonify(
                            {
                                "error": f"File {file.filename} is too large. Max size: 5MB"
                            }
                        ),
                        400,
                    )

                saved_filename = save_pump_photo(file, pump.ccn_pump)
                if saved_filename:
                    pump.add_photo(saved_filename)
                    uploaded_photos.append(saved_filename)

        db.session.commit()

        return make_response(
            jsonify(
                {
                    "msg": "Photos uploaded successfully",
                    "uploaded_photos": uploaded_photos,
                    "total_photos": len(pump.get_photos_list()),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_pump.route(
    "api/v1/pumps/<string:ccn_pump>/photos/<string:photo_filename>", methods=["DELETE"]
)
@jwt_required()
@require_permission("pumps", "update")
def delete_pump_photo(ccn_pump, photo_filename):
    """Eliminar una foto específica de una bomba"""
    try:
        pump = Pump.query.filter_by(ccn_pump=ccn_pump).first()
        if not pump:
            return make_response(jsonify({"msg": "Pump not found"}), 404)

        photos_list = pump.get_photos_list()
        if photo_filename not in photos_list:
            return make_response(jsonify({"msg": "Photo not found"}), 404)

        # Eliminar archivo físico
        file_path = os.path.join(pump.get_pump_directory(), photo_filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remover de la base de datos
        pump.remove_photo(photo_filename)
        db.session.commit()

        # Verificar si el directorio quedó vacío y eliminarlo
        pump_dir = pump.get_pump_directory()
        if os.path.exists(pump_dir) and not os.listdir(pump_dir):
            try:
                os.rmdir(pump_dir)
                print(f"✅ Deleted empty pump directory: {pump_dir}")
            except OSError as e:
                print(f"⚠️ Could not delete empty directory {pump_dir}: {str(e)}")

        return make_response(jsonify({"msg": "Photo deleted successfully"}), 200)

    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_pump.route(
    "api/v1/pumps/<string:ccn_pump>/photos/<string:photo_filename>", methods=["GET"]
)
def get_pump_photo(ccn_pump, photo_filename):
    """Servir una foto específica de una bomba"""
    try:
        pump = Pump.query.filter_by(ccn_pump=ccn_pump).first()
        if not pump:
            return make_response(jsonify({"msg": "Pump not found"}), 404)

        photos_list = pump.get_photos_list()
        if photo_filename not in photos_list:
            return make_response(jsonify({"msg": "Photo not found"}), 404)

        # Usar ruta absoluta desde el directorio raíz de la aplicación
        pump_dir = os.path.join(
            os.getcwd(), "portfolio_app", "static", "pumps", ccn_pump
        )
        photo_path = os.path.join(pump_dir, photo_filename)

        if not os.path.exists(photo_path):
            return make_response(jsonify({"msg": "Photo file not found"}), 404)

        return send_from_directory(pump_dir, photo_filename)

    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_pump.route("api/v1/pumps/<string:ccn_pump>", methods=["GET"])
def get_pump(ccn_pump):
    query_pump = (
        Pump.query.options(db.joinedload(Pump.user))
        .filter_by(ccn_pump=ccn_pump)
        .first()
    )
    if not query_pump:
        return make_response(jsonify({"msg": "Pump not found"}), 404)

    schema_pump = SchemaPump(many=False)
    pump = schema_pump.dump(query_pump)

    # Obtener el dominio de la API desde variables de entorno o usar el valor por defecto
    api_domain = os.getenv("API_DOMAIN", "https://api.ruizdev7.com")

    # Agregar URLs completas para las fotos usando el dominio de la API
    pump["photo_urls"] = [
        f"{api_domain}/api/v1/pumps/{ccn_pump}/photos/{photo}"
        for photo in query_pump.get_photos_list()
    ]

    # Agregar información del usuario
    if query_pump.user:
        pump["user_ccn"] = query_pump.user.ccn_user
        middle = (
            f" {query_pump.user.middle_name}" if query_pump.user.middle_name else ""
        )
        pump["user_name"] = (
            f"{query_pump.user.first_name}{middle} {query_pump.user.last_name}"
        )
    else:
        pump["user_ccn"] = None
        pump["user_name"] = "Unknown User"

    return make_response(jsonify({"Pump": pump}), 200)


@blueprint_api_pump.route("api/v1/pumps", methods=["GET"])
def get_all_pumps():
    print(f"📊 GET /api/v1/pumps - Fetching all pumps from database")

    # Get query parameters for pagination
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 100, type=int)  # Default 100 per page

    # Get total count
    total_pumps = Pump.query.count()
    print(f"📊 Total pumps in database: {total_pumps}")

    # Get paginated pumps
    pumps = Pump.query.options(db.joinedload(Pump.user)).paginate(
        page=page, per_page=per_page, error_out=False
    )

    print(f"📊 Found {len(pumps.items)} pumps for page {page}")
    schema_pump = SchemaPump(many=True)
    pumps_data = schema_pump.dump(pumps.items)
    print(f"📊 Serialized {len(pumps_data)} pumps to JSON")

    # Obtener el dominio de la API desde variables de entorno o usar el valor por defecto
    api_domain = os.getenv("API_DOMAIN", "https://api.ruizdev7.com")

    # Agregar URLs de fotos y información del usuario para cada bomba
    for i, pump in enumerate(pumps.items):
        pumps_data[i]["photo_urls"] = [
            f"{api_domain}/api/v1/pumps/{pump.ccn_pump}/photos/{photo}"
            for photo in pump.get_photos_list()
        ]

        # Agregar información del usuario
        if pump.user:
            pumps_data[i]["user_ccn"] = pump.user.ccn_user
            middle = f" {pump.user.middle_name}" if pump.user.middle_name else ""
            pumps_data[i][
                "user_name"
            ] = f"{pump.user.first_name}{middle} {pump.user.last_name}"
        else:
            pumps_data[i]["user_ccn"] = None
            pumps_data[i]["user_name"] = "Unknown User"

    import json

    response_data = {
        "Pumps": pumps_data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total_pumps,
            "pages": pumps.pages,
            "has_next": pumps.has_next,
            "has_prev": pumps.has_prev,
        },
    }
    response_json = json.dumps(response_data)
    print(
        f"📊 Returning {len(pumps_data)} pumps to frontend (page {page} of {pumps.pages})"
    )
    print(f"📊 Response size: {len(response_json)} characters")
    return make_response(jsonify(response_data), 200)


@blueprint_api_pump.route("api/v1/pumps/count", methods=["GET"])
def get_pumps_count():
    """Endpoint de prueba para verificar el conteo de bombas"""
    count = Pump.query.count()
    print(f"🔢 Pump count endpoint: {count} pumps")
    return make_response(
        jsonify({"count": count, "message": f"Total pumps: {count}"}), 200
    )


@blueprint_api_pump.route("api/v1/pumps/<string:ccn_pump>", methods=["DELETE"])
@jwt_required()
@require_permission("pumps", "delete")
def delete_pump(ccn_pump):
    print("=" * 50)
    print(f"🗑️ DELETE PUMP REQUEST RECEIVED for: {ccn_pump}")
    print(f"🔐 Request headers: {dict(request.headers)}")
    print(f"🔐 Authorization header: {request.headers.get('Authorization')}")
    print("=" * 50)

    pump = Pump.query.filter_by(ccn_pump=ccn_pump).first()
    if not pump:
        print(f"❌ Pump not found: {ccn_pump}")
        return make_response(jsonify({"msg": "Pump not found"}), 404)

    # Eliminar todas las fotos físicas
    pump_dir = pump.get_pump_directory()
    deleted_photos = []
    failed_deletions = []

    if os.path.exists(pump_dir):
        photos_list = pump.get_photos_list()
        print(f"🗑️ Deleting pump {ccn_pump} with {len(photos_list)} photos")

        for photo in photos_list:
            photo_path = os.path.join(pump_dir, photo)
            if os.path.exists(photo_path):
                try:
                    os.remove(photo_path)
                    deleted_photos.append(photo)
                    print(f"✅ Deleted photo: {photo}")
                except Exception as e:
                    failed_deletions.append(photo)
                    print(f"❌ Failed to delete photo {photo}: {str(e)}")
            else:
                print(f"⚠️ Photo file not found: {photo_path}")

        # Eliminar directorio si está vacío
        try:
            os.rmdir(pump_dir)
            print(f"✅ Deleted pump directory: {pump_dir}")
        except OSError as e:
            print(f"⚠️ Could not delete directory {pump_dir}: {str(e)}")

    # Eliminar de la base de datos
    db.session.delete(pump)
    db.session.commit()

    # Preparar respuesta con información de eliminación
    response_data = {
        "msg": "Pump deleted successfully",
        "deleted_photos": deleted_photos,
        "failed_deletions": failed_deletions,
        "total_photos": len(deleted_photos) + len(failed_deletions),
    }

    print(
        f"🎯 Pump deletion summary: {len(deleted_photos)} photos deleted, {len(failed_deletions)} failed"
    )

    return make_response(jsonify(response_data), 200)


@blueprint_api_pump.route("api/v1/pumps/<string:ccn_pump>", methods=["PUT"])
@jwt_required()
@require_permission("pumps", "update")
def update_pump(ccn_pump):
    print("=" * 50)
    print(f"🚀 ENTERING UPDATE PUMP FUNCTION for: {ccn_pump}")
    print(f"🔧 Update pump request for: {ccn_pump}")
    print(f"🔐 Request headers: {dict(request.headers)}")
    print(f"🔐 Authorization header: {request.headers.get('Authorization')}")
    print("=" * 50)
    try:
        print(f"📊 Processing request data...")
        request_data = request.form.to_dict() if request.form else request.get_json()
        print(f"📊 Request data: {request_data}")

        pump = Pump.query.filter_by(ccn_pump=ccn_pump).first()
        print(f"🔍 Pump found: {pump is not None}")
        if not pump:
            print(f"❌ Pump not found: {ccn_pump}")
            return make_response(jsonify({"msg": "Pump not found"}), 404)

        pump.model = request_data["model"]
        pump.serial_number = request_data["serial_number"]
        pump.location = request_data["location"]
        pump.purchase_date = (
            datetime.fromisoformat(request_data["purchase_date"].replace("Z", "+00:00"))
            if isinstance(request_data["purchase_date"], str)
            else request_data["purchase_date"]
        )
        pump.status = request_data["status"]
        pump.flow_rate = float(request_data["flow_rate"])
        pump.pressure = float(request_data["pressure"])
        pump.power = float(request_data["power"])
        pump.efficiency = float(request_data["efficiency"])
        pump.voltage = float(request_data["voltage"])
        pump.current = float(request_data["current"])
        pump.power_factor = float(request_data["power_factor"])
        pump.last_maintenance = (
            datetime.fromisoformat(
                request_data["last_maintenance"].replace("Z", "+00:00")
            )
            if isinstance(request_data["last_maintenance"], str)
            else request_data["last_maintenance"]
        )
        pump.next_maintenance = (
            datetime.fromisoformat(
                request_data["next_maintenance"].replace("Z", "+00:00")
            )
            if isinstance(request_data["next_maintenance"], str)
            else request_data["next_maintenance"]
        )
        pump.user_id = int(request_data["user_id"])
        pump.updated_at = datetime.now()

        print(f"💾 About to commit changes to database...")
        print(
            f"📝 Updated pump data: model={pump.model}, serial={pump.serial_number}, location={pump.location}"
        )

        # Manejar nuevas fotos si se envían
        if request.files:
            files = request.files.getlist("photos")
            uploaded_photos = []

            for file in files:
                if file.filename != "":
                    saved_filename = save_pump_photo(file, pump.ccn_pump)
                    if saved_filename:
                        pump.add_photo(saved_filename)
                        uploaded_photos.append(saved_filename)

        db.session.commit()
        print(f"✅ Database commit successful!")
        print(f"🎉 EXITING UPDATE PUMP FUNCTION SUCCESSFULLY for: {ccn_pump}")
        return make_response(jsonify({"msg": "Pump updated successfully"}), 200)

    except Exception as e:
        print(f"❌ Error during pump update: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        print(f"💥 EXITING UPDATE PUMP FUNCTION WITH ERROR for: {ccn_pump}")
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)


@blueprint_api_pump.route("api/v1/pumps/<string:ccn_pump>", methods=["PATCH"])
@jwt_required()
@require_permission("pumps", "update")
def patch_pump(ccn_pump):
    try:
        request_data = request.form.to_dict() if request.form else request.get_json()
        pump = Pump.query.filter_by(ccn_pump=ccn_pump).first()
        if not pump:
            return make_response(jsonify({"msg": "Pump not found"}), 404)

        if "model" in request_data:
            pump.model = request_data["model"]
        if "serial_number" in request_data:
            pump.serial_number = request_data["serial_number"]
        if "location" in request_data:
            pump.location = request_data["location"]
        if "purchase_date" in request_data:
            pump.purchase_date = (
                datetime.fromisoformat(
                    request_data["purchase_date"].replace("Z", "+00:00")
                )
                if isinstance(request_data["purchase_date"], str)
                else request_data["purchase_date"]
            )
        if "status" in request_data:
            pump.status = request_data["status"]
        if "flow_rate" in request_data:
            pump.flow_rate = float(request_data["flow_rate"])
        if "pressure" in request_data:
            pump.pressure = float(request_data["pressure"])
        if "power" in request_data:
            pump.power = float(request_data["power"])
        if "efficiency" in request_data:
            pump.efficiency = float(request_data["efficiency"])
        if "voltage" in request_data:
            pump.voltage = float(request_data["voltage"])
        if "current" in request_data:
            pump.current = float(request_data["current"])
        if "power_factor" in request_data:
            pump.power_factor = float(request_data["power_factor"])
        if "last_maintenance" in request_data:
            pump.last_maintenance = (
                datetime.fromisoformat(
                    request_data["last_maintenance"].replace("Z", "+00:00")
                )
                if isinstance(request_data["last_maintenance"], str)
                else request_data["last_maintenance"]
            )
        if "next_maintenance" in request_data:
            pump.next_maintenance = (
                datetime.fromisoformat(
                    request_data["next_maintenance"].replace("Z", "+00:00")
                )
                if isinstance(request_data["next_maintenance"], str)
                else request_data["next_maintenance"]
            )
        if "user_id" in request_data:
            pump.user_id = int(request_data["user_id"])

        pump.updated_at = datetime.now()

        # Manejar nuevas fotos si se envían
        if request.files:
            files = request.files.getlist("photos")
            uploaded_photos = []

            for file in files:
                if file.filename != "":
                    saved_filename = save_pump_photo(file, pump.ccn_pump)
                    if saved_filename:
                        pump.add_photo(saved_filename)
                        uploaded_photos.append(saved_filename)

        db.session.commit()
        return make_response(jsonify({"msg": "Pump updated successfully"}), 200)

    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({"error": str(e)}), 500)
