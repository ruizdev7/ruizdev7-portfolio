#!/usr/bin/env python3
"""
Script para poblar la tabla de bombas con datos de prueba
"""

import sys
import os
import json
from datetime import datetime, timedelta
import random

# Establecer variables de entorno para desarrollo ANTES de importar
os.environ.setdefault("FLASK_ENV", "development")
os.environ.setdefault("JWT_SECRET_KEY", "default-jwt-secret-development")
os.environ.setdefault("SECRET_KEY", "default-secret-key-development")
os.environ.setdefault(
    "DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/portfolio_app_dev"
)

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from portfolio_app import create_app, db
from portfolio_app.models.tbl_pumps import Pump


def clear_all_pumps():
    """Eliminar todas las bombas existentes y sus archivos"""
    print("🗑️ Eliminando todas las bombas existentes...")

    pumps = Pump.query.all()
    count = len(pumps)

    if count == 0:
        print("📭 No hay bombas para eliminar")
        return True

    # Eliminar directorios de fotos y registros de base de datos
    import shutil

    deleted_count = 0

    for pump in pumps:
        try:
            # Eliminar directorio de fotos si existe
            pump_dir = pump.get_pump_directory()
            if os.path.exists(pump_dir):
                shutil.rmtree(pump_dir)
                print(f"   📁 Eliminado directorio: {pump_dir}")

            # Eliminar registro de la base de datos
            db.session.delete(pump)
            deleted_count += 1

        except Exception as e:
            print(f"   ⚠️ Error eliminando bomba {pump.id}: {e}")

    try:
        db.session.commit()
        print(f"✅ {deleted_count} bombas eliminadas exitosamente")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error al eliminar bombas: {e}")
        return False


def create_test_pumps():
    """Crear bombas de prueba con datos realistas y variados"""

    # Datos realistas para bombas industriales (máximo 20 caracteres)
    pump_models = [
        "Grundfos CR-150",
        "KSB Multitec",
        "Flygt N-3301",
        "Sulzer APT",
        "Wilo Helix V",
        "Ebara 3M",
        "Pedrollo 4CPm",
        "DAB K-55",
        "Lowara SV",
        "Calpeda MXV",
        "Pentair Aurora",
        "ITT Goulds",
        "Wilo Stratos",
        "Grundfos ALPHA2",
        "KSB Etanorm",
        "Flygt 3127",
        "Sulzer APP",
        "Wilo Yonos",
        "Ebara 3M Plus",
        "Pedrollo 4CPm+",
    ]

    locations = [
        "Edificio Principal",
        "Almacén A",
        "Almacén B",
        "Planta Producción",
        "Sala Máquinas",
        "Sistema Riego",
        "Torre Enfriamiento",
        "Agua Potable",
        "Agua Residual",
        "Sistema Incendios",
        "Sistema HVAC",
        "Tanque 1",
        "Tanque 2",
        "Tanque 3",
        "Línea 1",
        "Línea 2",
        "Línea 3",
        "Zona A",
        "Zona B",
        "Zona C",
        "Nivel 1",
        "Nivel 2",
        "Bloque Norte",
        "Bloque Sur",
        "Bloque Este",
        "Bloque Oeste",
        "Sector Norte",
        "Sector Sur",
        "Zona Este",
        "Zona Oeste",
    ]

    statuses = ["Active", "Maintenance", "Standby", "Repair", "Inactive", "Testing"]

    print("🔧 Creando datos de prueba para bombas...")

    # Crear 50 bombas de prueba con más variedad
    for i in range(1, 51):
        # Generar datos aleatorios pero realistas
        model = random.choice(pump_models)
        serial_number = f"SN{2020 + (i % 6)}{random.randint(10000, 99999)}"
        location = random.choice(locations)

        # Fechas realistas con más variación
        purchase_date = datetime.now() - timedelta(
            days=random.randint(30, 1825)  # 1 mes a 5 años
        )
        last_maintenance = purchase_date + timedelta(days=random.randint(30, 365))
        next_maintenance = last_maintenance + timedelta(days=random.randint(60, 240))

        # Especificaciones técnicas realistas con más variedad
        pump_type = random.choice(
            ["Centrífuga", "Sumergible", "Diafragma", "Peristáltica", "Tornillo"]
        )

        if pump_type == "Centrífuga":
            flow_rate = round(random.uniform(100.0, 800.0), 1)  # L/min
            pressure = round(random.uniform(30.0, 100.0), 1)  # bar
            power = round(random.uniform(10.0, 200.0), 1)  # kW
        elif pump_type == "Sumergible":
            flow_rate = round(random.uniform(50.0, 400.0), 1)  # L/min
            pressure = round(random.uniform(20.0, 60.0), 1)  # bar
            power = round(random.uniform(5.0, 100.0), 1)  # kW
        elif pump_type == "Diafragma":
            flow_rate = round(random.uniform(20.0, 200.0), 1)  # L/min
            pressure = round(random.uniform(40.0, 120.0), 1)  # bar
            power = round(random.uniform(3.0, 50.0), 1)  # kW
        elif pump_type == "Peristáltica":
            flow_rate = round(random.uniform(10.0, 100.0), 1)  # L/min
            pressure = round(random.uniform(10.0, 40.0), 1)  # bar
            power = round(random.uniform(1.0, 20.0), 1)  # kW
        else:  # Tornillo
            flow_rate = round(random.uniform(200.0, 1000.0), 1)  # L/min
            pressure = round(random.uniform(15.0, 50.0), 1)  # bar
            power = round(random.uniform(15.0, 150.0), 1)  # kW

        efficiency = round(random.uniform(65.0, 95.0), 1)  # %
        voltage = random.choice([220.0, 380.0, 440.0, 480.0])  # V
        current = round(
            power * 1000 / (voltage * 1.732 * 0.85), 1
        )  # A (cálculo aproximado trifásico)
        power_factor = round(random.uniform(0.75, 0.95), 2)

        # Distribuir estados de manera más realista
        status_weights = {
            "Active": 0.6,  # 60% activas
            "Standby": 0.15,  # 15% en espera
            "Maintenance": 0.1,  # 10% en mantenimiento
            "Testing": 0.05,  # 5% en pruebas
            "Repair": 0.05,  # 5% en reparación
            "Inactive": 0.05,  # 5% inactivas
        }

        status = random.choices(
            list(status_weights.keys()), weights=list(status_weights.values())
        )[0]

        user_id = 1  # Asumiendo que existe un usuario con ID 1

        # Crear la bomba
        pump = Pump(
            model=model,
            serial_number=serial_number,
            location=location,
            purchase_date=purchase_date,
            status=status,
            flow_rate=flow_rate,
            pressure=pressure,
            power=power,
            efficiency=efficiency,
            voltage=voltage,
            current=current,
            power_factor=power_factor,
            last_maintenance=last_maintenance,
            next_maintenance=next_maintenance,
            user_id=user_id,
        )

        db.session.add(pump)

        # Mostrar progreso cada 10 bombas
        if i % 10 == 0:
            print(f"✅ Creadas {i} bombas...")

    try:
        db.session.commit()
        print(f"\n🎉 ¡{50} bombas creadas exitosamente!")
        print("\n📊 Resumen de datos generados:")
        print(f"- Total de bombas: 50")
        print(f"- Modelos únicos: {len(set(pump_models))}")
        print(f"- Ubicaciones: {len(locations)}")
        print(f"- Estados: {', '.join(statuses)}")
        print(
            f"- Tipos de bomba: Centrífuga, Sumergible, Diafragma, Peristáltica, Tornillo"
        )
        print(f"- Rango de potencia: 1-200 kW")
        print(f"- Rango de caudal: 10-1000 L/min")
        print(f"- Rango de presión: 10-120 bar")

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error al crear bombas: {e}")
        return False

    return True


def show_pumps_summary():
    """Mostrar resumen de bombas creadas"""
    pumps = Pump.query.all()

    if not pumps:
        print("📭 No hay bombas en la base de datos")
        return

    print(f"\n📋 Bombas en la base de datos: {len(pumps)}")
    print("-" * 80)

    # Mostrar estadísticas por estado
    status_counts = {}
    for pump in pumps:
        status_counts[pump.status] = status_counts.get(pump.status, 0) + 1

    print("📊 Distribución por estado:")
    for status, count in status_counts.items():
        percentage = (count / len(pumps)) * 100
        print(f"   {status}: {count} ({percentage:.1f}%)")

    print("\n🔧 Muestra de bombas (primeras 15):")
    print("-" * 80)

    for pump in pumps[:15]:
        print(f"🔧 {pump.model} | SN: {pump.serial_number} | {pump.location}")
        print(
            f"   �� {pump.status} | 💡 {pump.power}kW | 💧 {pump.flow_rate}L/min | 📈 {pump.pressure}bar"
        )
        print(
            f"   ⚡ {pump.voltage}V | 🔌 {pump.current}A | 📁 Fotos: {len(pump.get_photos_list())}"
        )
        print()

    if len(pumps) > 15:
        print(f"... y {len(pumps) - 15} bombas más")


def main():
    """Función principal del script"""
    app = create_app()

    with app.app_context():
        print("🚀 Script de datos de prueba para bombas")
        print("=" * 50)

        if len(sys.argv) > 1:
            command = sys.argv[1]

            if command == "create":
                # Eliminar datos existentes y crear nuevos
                if clear_all_pumps():
                    create_test_pumps()
                    show_pumps_summary()
            elif command == "show":
                show_pumps_summary()
            elif command == "clear":
                clear_all_pumps()
            elif command == "reset":
                # Comando específico para reset completo
                print("🔄 Reseteando base de datos de bombas...")
                if clear_all_pumps():
                    create_test_pumps()
                    show_pumps_summary()
            else:
                print("❌ Comando no reconocido")
                print("Uso: python seed_pumps.py [create|show|clear|reset]")
        else:
            # Comportamiento por defecto: reset completo
            print("🔄 Ejecutando reset completo de datos de bombas...")
            if clear_all_pumps():
                create_test_pumps()
                show_pumps_summary()

        print("\n✨ Script completado")


if __name__ == "__main__":
    # Establecer variables de entorno para desarrollo
    os.environ.setdefault("FLASK_ENV", "development")
    os.environ.setdefault("JWT_SECRET_KEY", "default-jwt-secret-development")
    os.environ.setdefault("SECRET_KEY", "default-secret-key-development")

    main()
