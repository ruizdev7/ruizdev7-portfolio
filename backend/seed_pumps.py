#!/usr/bin/env python3
"""
Script para poblar la tabla de bombas con datos de prueba
"""

import sys
import os
import json
from datetime import datetime, timedelta
import random

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from portfolio_app import create_app, db
from portfolio_app.models.tbl_pumps import Pump


def create_test_pumps():
    """Crear bombas de prueba con datos realistas"""

    # Datos realistas para bombas industriales
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
        "ITT Goulds 3196",
    ]

    locations = [
        "Warehouse A",
        "Plant B",
        "Building C",
        "Section D",
        "Zone E",
        "Facility F",
        "Unit G",
        "Area H",
        "Station I",
        "Block J",
    ]

    statuses = ["Active", "Maintenance", "Standby", "Repair", "Inactive"]

    print("🔧 Creando datos de prueba para bombas...")

    # Crear 15 bombas de prueba
    for i in range(1, 16):
        # Generar datos aleatorios pero realistas
        model = random.choice(pump_models)
        serial_number = f"SN{2020 + (i % 5)}{random.randint(10000, 99999)}"
        location = random.choice(locations)

        # Fechas realistas
        purchase_date = datetime.now() - timedelta(
            days=random.randint(30, 1095)
        )  # 1 mes a 3 años
        last_maintenance = purchase_date + timedelta(days=random.randint(30, 300))
        next_maintenance = last_maintenance + timedelta(days=random.randint(90, 180))

        # Especificaciones técnicas realistas
        flow_rate = round(random.uniform(50.0, 500.0), 1)  # L/min
        pressure = round(random.uniform(20.0, 80.0), 1)  # bar
        power = round(random.uniform(5.0, 150.0), 1)  # kW
        efficiency = round(random.uniform(70.0, 95.0), 1)  # %
        voltage = random.choice([220.0, 380.0, 440.0])  # V
        current = round(
            power * 1000 / (voltage * 1.732 * 0.85), 1
        )  # A (cálculo aproximado trifásico)
        power_factor = round(random.uniform(0.75, 0.95), 2)

        status = random.choice(statuses)
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
        print(f"✅ Bomba {i}: {model} - {serial_number} ({location})")

    try:
        db.session.commit()
        print(f"\n🎉 ¡{15} bombas creadas exitosamente!")
        print("\n📊 Resumen de datos generados:")
        print(f"- Modelos únicos: {len(set(pump_models))}")
        print(f"- Ubicaciones: {len(locations)}")
        print(f"- Estados: {', '.join(statuses)}")
        print(f"- Rango de potencia: 5-150 kW")
        print(f"- Rango de caudal: 50-500 L/min")
        print(f"- Rango de presión: 20-80 bar")

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

    for pump in pumps[:10]:  # Mostrar solo las primeras 10
        print(
            f"🔧 {pump.model} | SN: {pump.serial_number} | {pump.location} | {pump.status}"
        )
        print(
            f"   💡 {pump.power}kW | 💧 {pump.flow_rate}L/min | 📊 {pump.pressure}bar | ⚡ {pump.voltage}V"
        )
        print(f"   📁 Fotos: {len(pump.get_photos_list())}")
        print()

    if len(pumps) > 10:
        print(f"... y {len(pumps) - 10} bombas más")


def clear_pumps():
    """Limpiar todas las bombas (usar con cuidado)"""
    pumps = Pump.query.all()
    count = len(pumps)

    if count == 0:
        print("📭 No hay bombas para eliminar")
        return

    confirm = input(f"⚠️  ¿Estás seguro de eliminar {count} bombas? (y/N): ")
    if confirm.lower() == "y":
        for pump in pumps:
            # Eliminar directorio de fotos si existe
            import shutil

            pump_dir = pump.get_pump_directory()
            if os.path.exists(pump_dir):
                shutil.rmtree(pump_dir)
            db.session.delete(pump)

        db.session.commit()
        print(f"🗑️  {count} bombas eliminadas exitosamente")
    else:
        print("❌ Operación cancelada")


if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        print("🚀 Script de datos de prueba para bombas")
        print("=" * 50)

        if len(sys.argv) > 1:
            command = sys.argv[1]

            if command == "create":
                create_test_pumps()
                show_pumps_summary()
            elif command == "show":
                show_pumps_summary()
            elif command == "clear":
                clear_pumps()
            else:
                print("❌ Comando no reconocido")
                print("Uso: python seed_pumps.py [create|show|clear]")
        else:
            # Comportamiento por defecto: crear datos si no existen
            existing_pumps = Pump.query.count()

            if existing_pumps > 0:
                print(f"ℹ️  Ya existen {existing_pumps} bombas en la base de datos")
                show_pumps_summary()

                create_more = input("\n¿Crear más bombas de prueba? (y/N): ")
                if create_more.lower() == "y":
                    create_test_pumps()
            else:
                create_test_pumps()

            show_pumps_summary()

        print("\n✨ Script completado")
