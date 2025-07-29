from datetime import datetime
import hashlib
import uuid
import os
import json
from portfolio_app import db


class Pump(db.Model):
    __tablename__ = "tbl_pumps"
    ccn_pump = db.Column(db.String(64), primary_key=True)  # Changed to String for hash
    model = db.Column(db.String(20), nullable=False)
    serial_number = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(20), nullable=False)
    purchase_date = db.Column(
        db.DateTime, nullable=False
    )  # Nueva columna para fecha de compra
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now
    )
    status = db.Column(db.String(20), nullable=False)
    flow_rate = db.Column(db.Float, nullable=False)
    pressure = db.Column(db.Float, nullable=False)
    power = db.Column(db.Float, nullable=False)
    efficiency = db.Column(db.Float, nullable=False)
    voltage = db.Column(db.Float, nullable=False)
    current = db.Column(db.Float, nullable=False)
    power_factor = db.Column(db.Float, nullable=False)
    last_maintenance = db.Column(db.DateTime, nullable=False)
    next_maintenance = db.Column(db.DateTime, nullable=False)
    # Campo para almacenar las rutas de las fotografías como JSON array
    photos = db.Column(db.Text, nullable=True, default="[]")
    user_id = db.Column(db.Integer, db.ForeignKey("tbl_users.ccn_user"), nullable=False)
    user = db.relationship("User", backref="pumps")

    def __init__(
        self,
        model,
        serial_number,
        location,
        purchase_date,
        status,
        flow_rate,
        pressure,
        power,
        efficiency,
        voltage,
        current,
        power_factor,
        last_maintenance,
        next_maintenance,
        user_id,
        photos=None,
    ):
        self.model = model
        self.serial_number = serial_number
        self.location = location
        self.purchase_date = purchase_date
        self.status = status
        self.flow_rate = flow_rate
        self.pressure = pressure
        self.power = power
        self.efficiency = efficiency
        self.voltage = voltage
        self.current = current
        self.power_factor = power_factor
        self.last_maintenance = last_maintenance
        self.next_maintenance = next_maintenance
        self.user_id = user_id
        self.photos = json.dumps(photos or [])
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        # Generate hash for ccn_pump using model, serial_number and uuid for uniqueness
        unique_string = f"{model}_{serial_number}_{str(uuid.uuid4())}"
        self.ccn_pump = hashlib.sha256(unique_string.encode()).hexdigest()

        # Crear directorio para las fotos de esta bomba
        self._create_pump_directory()

    def _create_pump_directory(self):
        """Crear directorio específico para las fotos de esta bomba"""
        pump_dir = os.path.join("portfolio_app", "static", "pumps", self.ccn_pump)
        os.makedirs(pump_dir, exist_ok=True)
        return pump_dir

    def get_photos_list(self):
        """Obtener la lista de fotos como array de Python"""
        try:
            return json.loads(self.photos) if self.photos else []
        except (json.JSONDecodeError, TypeError):
            return []

    def add_photo(self, photo_filename):
        """Agregar una nueva foto a la lista"""
        photos_list = self.get_photos_list()
        if photo_filename not in photos_list:
            photos_list.append(photo_filename)
            self.photos = json.dumps(photos_list)
            self.updated_at = datetime.now()

    def remove_photo(self, photo_filename):
        """Remover una foto de la lista"""
        photos_list = self.get_photos_list()
        if photo_filename in photos_list:
            photos_list.remove(photo_filename)
            self.photos = json.dumps(photos_list)
            self.updated_at = datetime.now()

    def get_pump_directory(self):
        """Obtener la ruta del directorio de fotos de esta bomba"""
        return os.path.join("portfolio_app", "static", "pumps", self.ccn_pump)

    @staticmethod
    def choice_query():
        return Pump.query

    def __repr__(self):
        return (
            f"Pump('{self.model}', Serial Number: '{self.serial_number}', "
            f"Location: '{self.location}', Purchase Date: '{self.purchase_date}')"
        )
