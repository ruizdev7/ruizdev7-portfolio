from flask import Blueprint, jsonify, make_response
from sqlalchemy import func
import pandas as pd
from flask_jwt_extended import jwt_required

from portfolio_app import db
from portfolio_app.models.tbl_pumps import Pump


blueprint_api_analysis = Blueprint("api_analysis", __name__, url_prefix="")


def _pumps_query_to_dataframe() -> pd.DataFrame:
    pumps = Pump.query.with_entities(
        Pump.ccn_pump,
        Pump.model,
        Pump.serial_number,
        Pump.location,
        Pump.purchase_date,
        Pump.status,
        Pump.flow_rate,
        Pump.pressure,
        Pump.power,
        Pump.efficiency,
        Pump.voltage,
        Pump.current,
        Pump.power_factor,
        Pump.last_maintenance,
        Pump.next_maintenance,
        Pump.user_id,
    ).all()

    if not pumps:
        return pd.DataFrame(
            columns=[
                "ccn_pump",
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
        )

    df = pd.DataFrame(
        pumps,
        columns=[
            "ccn_pump",
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
        ],
    )

    # Ensure datetime types
    for col in ["purchase_date", "last_maintenance", "next_maintenance"]:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")

    return df


@jwt_required()
@blueprint_api_analysis.route("/api/v1/analysis/pumps/summary", methods=["GET"])
def pumps_summary():
    df = _pumps_query_to_dataframe()
    total = int(len(df))

    def count_status(value: str) -> int:
        if df.empty or "status" not in df:
            return 0
        return int((df["status"] == value).sum())

    # Contar todos los estados disponibles
    active = count_status("Active")
    maintenance = count_status("Maintenance")
    inactive = count_status("Inactive")
    standby = count_status("Standby")
    testing = count_status("Testing")
    repair = count_status("Repair")

    # Crear diccionario dinámico con todos los estados encontrados
    status_counts = {}
    if active > 0:
        status_counts["Active"] = active
    if maintenance > 0:
        status_counts["Maintenance"] = maintenance
    if inactive > 0:
        status_counts["Inactive"] = inactive
    if standby > 0:
        status_counts["Standby"] = standby
    if testing > 0:
        status_counts["Testing"] = testing
    if repair > 0:
        status_counts["Repair"] = repair

    response = {
        "total_pumps": total,
        "status": status_counts,
        "metrics": {
            "operational_efficiency_pct": (
                round((active / total) * 100, 1) if total else 0.0
            ),
            "maintenance_pct": round((maintenance / total) * 100, 1) if total else 0.0,
            "system_availability_pct": (
                round(((active + standby) / total) * 100, 1) if total else 0.0
            ),
        },
    }

    return make_response(jsonify(response), 200)


@jwt_required()
@blueprint_api_analysis.route(
    "/api/v1/analysis/pumps/status-distribution", methods=["GET"]
)
def pumps_status_distribution():
    df = _pumps_query_to_dataframe()
    total = int(len(df))
    if total == 0:
        return make_response(jsonify({"distribution": []}), 200)

    counts = (
        df["status"].value_counts().rename_axis("status").reset_index(name="count")
        if not df.empty and "status" in df
        else pd.DataFrame({"status": [], "count": []})
    )

    counts["percentage"] = counts["count"].apply(lambda c: round((c / total) * 100, 1))

    distribution = counts.to_dict(orient="records")
    return make_response(jsonify({"distribution": distribution, "total": total}), 200)


@jwt_required()
@blueprint_api_analysis.route("/api/v1/analysis/pumps/location", methods=["GET"])
def pumps_by_location():
    df = _pumps_query_to_dataframe()
    if df.empty or "location" not in df:
        return make_response(jsonify({"locations": []}), 200)

    # If location contains pattern like "Building - Room", group by the first part
    def extract_building(location: str) -> str:
        if not isinstance(location, str):
            return "Unknown"
        return location.split(" - ")[0]

    df["building"] = df["location"].apply(extract_building)
    grouped = (
        df.groupby("building")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
    )
    locations = grouped.to_dict(orient="records")
    return make_response(jsonify({"locations": locations}), 200)


@jwt_required()
@blueprint_api_analysis.route("/api/v1/analysis/pumps/numeric-stats", methods=["GET"])
def pumps_numeric_stats():
    df = _pumps_query_to_dataframe()
    numeric_cols = [
        "flow_rate",
        "pressure",
        "power",
        "efficiency",
        "voltage",
        "current",
        "power_factor",
    ]

    if df.empty:
        return make_response(jsonify({"stats": {c: None for c in numeric_cols}}), 200)

    stats = {}
    for col in numeric_cols:
        if col in df.columns:
            series = pd.to_numeric(df[col], errors="coerce")
            stats[col] = {
                "min": None if series.dropna().empty else float(series.min()),
                "max": None if series.dropna().empty else float(series.max()),
                "mean": None if series.dropna().empty else float(series.mean()),
                "median": None if series.dropna().empty else float(series.median()),
                "std": None if series.dropna().empty else float(series.std(ddof=0)),
                "count": int(series.count()),
            }
        else:
            stats[col] = None

    return make_response(jsonify({"stats": stats}), 200)
