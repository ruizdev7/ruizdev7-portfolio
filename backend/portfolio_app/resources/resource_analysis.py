from flask import (
    Blueprint,
    jsonify,
    make_response,
    Response,
    stream_with_context,
    current_app,
    request,
)
from sqlalchemy import func
import pandas as pd
from flask_jwt_extended import jwt_required
from typing import Dict, Any, List
import os
import json

from portfolio_app import db
from portfolio_app.models.tbl_pumps import Pump
from portfolio_app.services.openai_service import OpenAIService
from openai import OpenAI
import re


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
def pumps_summary() -> Response:
    df: pd.DataFrame = _pumps_query_to_dataframe()
    total: int = int(len(df))

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


@jwt_required()
@blueprint_api_analysis.route("/api/v1/analysis/pumps/insights", methods=["GET"])
def pumps_insights() -> Response:
    """Generate AI insights from pump analysis data"""
    try:
        # Get summary data
        df: pd.DataFrame = _pumps_query_to_dataframe()
        total: int = int(len(df))

        def count_status(value: str) -> int:
            if df.empty or "status" not in df:
                return 0
            return int((df["status"] == value).sum())

        # Count all statuses
        active: int = count_status("Active")
        maintenance: int = count_status("Maintenance")
        inactive: int = count_status("Inactive")
        standby: int = count_status("Standby")

        status_counts: Dict[str, int] = {}
        if active > 0:
            status_counts["Active"] = active
        if maintenance > 0:
            status_counts["Maintenance"] = maintenance
        if inactive > 0:
            status_counts["Inactive"] = inactive
        if standby > 0:
            status_counts["Standby"] = standby

        summary_data = {
            "total_pumps": total,
            "status": status_counts,
            "metrics": {
                "operational_efficiency_pct": (
                    round((active / total) * 100, 1) if total else 0.0
                ),
                "maintenance_pct": (
                    round((maintenance / total) * 100, 1) if total else 0.0
                ),
                "system_availability_pct": (
                    round(((active + standby) / total) * 100, 1) if total else 0.0
                ),
            },
        }

        # Get status distribution
        if total == 0:
            status_distribution = []
        else:
            counts = (
                df["status"]
                .value_counts()
                .rename_axis("status")
                .reset_index(name="count")
                if not df.empty and "status" in df
                else pd.DataFrame({"status": [], "count": []})
            )
            counts["percentage"] = counts["count"].apply(
                lambda c: round((c / total) * 100, 1)
            )
            status_distribution = counts.to_dict(orient="records")

        # Get numeric stats
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
            numeric_stats = {c: None for c in numeric_cols}
        else:
            numeric_stats = {}
            for col in numeric_cols:
                if col in df.columns:
                    series = pd.to_numeric(df[col], errors="coerce")
                    numeric_stats[col] = {
                        "min": None if series.dropna().empty else float(series.min()),
                        "max": None if series.dropna().empty else float(series.max()),
                        "mean": None if series.dropna().empty else float(series.mean()),
                        "median": (
                            None if series.dropna().empty else float(series.median())
                        ),
                        "std": (
                            None if series.dropna().empty else float(series.std(ddof=0))
                        ),
                        "count": int(series.count()),
                    }
                else:
                    numeric_stats[col] = None

        # Get location data
        locations = []
        if not df.empty and "location" in df.columns:
            location_counts = df["location"].value_counts().reset_index()
            location_counts.columns = ["building", "count"]
            locations = location_counts.to_dict(orient="records")

        # Generate AI insights
        insights = OpenAIService.generate_pump_insights(
            summary_data, status_distribution, numeric_stats, locations
        )

        return make_response(jsonify({"insights": insights}), 200)

    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


def _get_ollama_client() -> OpenAI:
    """
    Create an OpenAI-compatible client configured for Ollama.
    """
    base_url = os.getenv("OLLAMA_BASE_URL")

    is_docker = os.path.exists("/.dockerenv") or os.getenv("DOCKER_CONTAINER")
    if not base_url:
        if is_docker:
            base_url = "http://host.docker.internal:11434/v1"
        else:
            base_url = "http://localhost:11434/v1"

    client = OpenAI(
        api_key="ollama",
        base_url=base_url,
        timeout=300.0,
    )
    return client


def _build_analysis_context() -> str:
    """
    Build context from pump analysis data for the AI assistant.
    """
    try:
        df = _pumps_query_to_dataframe()
        total = int(len(df))

        if total == 0:
            return "No pump data available in the system."

        # Get summary data
        def count_status(value: str) -> int:
            if df.empty or "status" not in df:
                return 0
            return int((df["status"] == value).sum())

        active = count_status("Active")
        maintenance = count_status("Maintenance")
        inactive = count_status("Inactive")
        standby = count_status("Standby")
        testing = count_status("Testing")
        repair = count_status("Repair")

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

        # Get status distribution
        if not df.empty and "status" in df:
            counts = (
                df["status"]
                .value_counts()
                .rename_axis("status")
                .reset_index(name="count")
            )
            counts["percentage"] = counts["count"].apply(
                lambda c: round((c / total) * 100, 1)
            )
            status_distribution = counts.to_dict(orient="records")
        else:
            status_distribution = []

        # Get location data
        locations = []
        if not df.empty and "location" in df.columns:
            location_counts = df["location"].value_counts().reset_index()
            location_counts.columns = ["building", "count"]
            locations = location_counts.to_dict(orient="records")

        # Get numeric stats
        numeric_cols = [
            "flow_rate",
            "pressure",
            "power",
            "efficiency",
            "voltage",
            "current",
            "power_factor",
        ]
        numeric_stats = {}
        if not df.empty:
            for col in numeric_cols:
                if col in df.columns:
                    series = pd.to_numeric(df[col], errors="coerce")
                    numeric_stats[col] = {
                        "min": None if series.dropna().empty else float(series.min()),
                        "max": None if series.dropna().empty else float(series.max()),
                        "mean": None if series.dropna().empty else float(series.mean()),
                        "median": (
                            None if series.dropna().empty else float(series.median())
                        ),
                        "std": (
                            None if series.dropna().empty else float(series.std(ddof=0))
                        ),
                        "count": int(series.count()),
                    }

        # Build detailed pump list for individual queries
        # Limit to 500 pumps to avoid context overflow
        max_pumps_detail = 500
        pump_details = []

        if not df.empty:
            # Select relevant columns for pump details
            detail_cols = [
                "ccn_pump",
                "model",
                "serial_number",
                "location",
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
                "purchase_date",
            ]

            # Get available columns
            available_cols = [col for col in detail_cols if col in df.columns]
            pump_df = df[available_cols].head(max_pumps_detail)

            # Convert to list of dicts, handling datetime serialization
            for _, row in pump_df.iterrows():
                pump_dict = {}
                for col in available_cols:
                    value = row[col]
                    # Convert datetime to string
                    if pd.isna(value):
                        pump_dict[col] = None
                    elif isinstance(value, pd.Timestamp):
                        pump_dict[col] = value.strftime("%Y-%m-%d %H:%M:%S")
                    else:
                        pump_dict[col] = value
                pump_details.append(pump_dict)

        # Build context string - optimize JSON size for large datasets
        # Use compact JSON format to reduce token count
        pump_details_json = json.dumps(pump_details, separators=(",", ":"), default=str)

        # Build context string
        # Create a searchable index of pump IDs for quick lookup
        pump_ids_list = [
            pump.get("ccn_pump") for pump in pump_details if pump.get("ccn_pump")
        ]

        context = f"""PUMP ANALYSIS DATA CONTEXT:

Total Pumps: {total}

=== INDIVIDUAL PUMP DATA ===
You have access to detailed information about each pump. Each pump has a unique ID (ccn_pump) that you can use to look up specific information.
When a user asks about a specific pump ID, you MUST search for it in the pump list below.

IMPORTANT: The pump ID is a 64-character hexadecimal string. When searching, look for the exact match in the "ccn_pump" field.

Available Pump IDs (first {len(pump_ids_list)} of {total}):
{', '.join(pump_ids_list[:50])}{'...' if len(pump_ids_list) > 50 else ''}

Full Pump Details (showing {len(pump_details)} of {total} pumps):
{pump_details_json}

=== SUMMARY STATISTICS ===

Status Distribution:
{json.dumps(status_distribution, indent=2)}

Status Counts:
{json.dumps(status_counts, indent=2)}

Location Distribution (Top 10):
{json.dumps(locations[:10], indent=2)}

Numeric Statistics (aggregated):
{json.dumps(numeric_stats, indent=2)}

System Metrics:
- Operational Efficiency: {round((active / total) * 100, 1) if total else 0.0}%
- Maintenance: {round((maintenance / total) * 100, 1) if total else 0.0}%
- System Availability: {round(((active + standby) / total) * 100, 1) if total else 0.0}%

=== CRITICAL INSTRUCTIONS FOR PUMP ID LOOKUP ===
1. When a user provides a pump ID (64-character hex string), you MUST search for it in the "Full Pump Details" JSON array above
2. Look for the "ccn_pump" field in each pump object - it contains the unique identifier
3. Once found, provide ALL available information about that pump:
   - ccn_pump (the ID itself)
   - model
   - serial_number
   - location
   - status (THIS IS THE CURRENT STATE OF THE PUMP)
   - flow_rate, pressure, power, efficiency, voltage, current, power_factor
   - last_maintenance, next_maintenance, purchase_date
4. If the ID is not in the list above, say: "The pump ID was not found in the available data. It may not exist, or it may be beyond the first {len(pump_details)} pumps in the system (total: {total} pumps)."
5. DO NOT say you don't have access - you DO have access to the pump data above. Search carefully!
"""
        return context
    except Exception as e:
        current_app.logger.error(f"Error building analysis context: {str(e)}")
        return f"Error loading pump data: {str(e)}"


def _build_analysis_context_from_pumps_data(pumps_data: List[Dict[str, Any]]) -> str:
    """
    Build context from pumps data sent from Redux store (frontend).
    This avoids database queries and uses the data already loaded in the frontend.
    """
    try:
        if not pumps_data:
            return "No pump data available in the system."

        total = len(pumps_data)

        # Convert to DataFrame for easier processing
        df = pd.DataFrame(pumps_data)

        # Get summary data
        def count_status(value: str) -> int:
            if df.empty or "status" not in df:
                return 0
            return int((df["status"] == value).sum())

        active = count_status("Active")
        maintenance = count_status("Maintenance")
        inactive = count_status("Inactive")
        standby = count_status("Standby")
        testing = count_status("Testing")
        repair = count_status("Repair")

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

        # Get status distribution
        if not df.empty and "status" in df:
            counts = (
                df["status"]
                .value_counts()
                .rename_axis("status")
                .reset_index(name="count")
            )
            counts["percentage"] = counts["count"].apply(
                lambda c: round((c / total) * 100, 1)
            )
            status_distribution = counts.to_dict(orient="records")
        else:
            status_distribution = []

        # Get location data
        locations = []
        if not df.empty and "location" in df.columns:
            location_counts = df["location"].value_counts().reset_index()
            location_counts.columns = ["building", "count"]
            locations = location_counts.to_dict(orient="records")

        # Get numeric stats
        numeric_cols = [
            "flow_rate",
            "pressure",
            "power",
            "efficiency",
            "voltage",
            "current",
            "power_factor",
        ]
        numeric_stats = {}
        if not df.empty:
            for col in numeric_cols:
                if col in df.columns:
                    series = pd.to_numeric(df[col], errors="coerce")
                    numeric_stats[col] = {
                        "min": None if series.dropna().empty else float(series.min()),
                        "max": None if series.dropna().empty else float(series.max()),
                        "mean": None if series.dropna().empty else float(series.mean()),
                        "median": (
                            None if series.dropna().empty else float(series.median())
                        ),
                        "std": (
                            None if series.dropna().empty else float(series.std(ddof=0))
                        ),
                        "count": int(series.count()),
                    }

        # Build detailed pump list - use all pumps from Redux
        pump_details = []
        detail_cols = [
            "ccn_pump",
            "model",
            "serial_number",
            "location",
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
            "purchase_date",
        ]

        for pump in pumps_data:
            pump_dict = {}
            for col in detail_cols:
                if col in pump:
                    value = pump[col]
                    # Handle datetime strings from frontend
                    if isinstance(value, str) and ("T" in value or "-" in value):
                        # Try to parse as datetime
                        try:
                            from datetime import datetime

                            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
                            pump_dict[col] = dt.strftime("%Y-%m-%d %H:%M:%S")
                        except:
                            pump_dict[col] = value
                    elif value is None:
                        pump_dict[col] = None
                    else:
                        pump_dict[col] = value
            pump_details.append(pump_dict)

        # Build context string
        pump_ids_list = [
            pump.get("ccn_pump") for pump in pump_details if pump.get("ccn_pump")
        ]
        pump_details_json = json.dumps(pump_details, separators=(",", ":"), default=str)

        context = f"""PUMP ANALYSIS DATA CONTEXT:

Total Pumps: {total}

=== INDIVIDUAL PUMP DATA ===
You have access to detailed information about each pump. Each pump has a unique ID (ccn_pump) that you can use to look up specific information.
When a user asks about a specific pump ID, you MUST search for it in the pump list below.

IMPORTANT: The pump ID is a 64-character hexadecimal string. When searching, look for the exact match in the "ccn_pump" field.

Available Pump IDs (all {len(pump_ids_list)} pumps):
{', '.join(pump_ids_list[:100])}{'...' if len(pump_ids_list) > 100 else ''}

Full Pump Details (all {len(pump_details)} pumps):
{pump_details_json}

=== SUMMARY STATISTICS ===

Status Distribution:
{json.dumps(status_distribution, indent=2)}

Status Counts:
{json.dumps(status_counts, indent=2)}

Location Distribution (Top 10):
{json.dumps(locations[:10], indent=2)}

Numeric Statistics (aggregated):
{json.dumps(numeric_stats, indent=2)}

System Metrics:
- Operational Efficiency: {round((active / total) * 100, 1) if total else 0.0}%
- Maintenance: {round((maintenance / total) * 100, 1) if total else 0.0}%
- System Availability: {round(((active + standby) / total) * 100, 1) if total else 0.0}%

=== CRITICAL INSTRUCTIONS FOR PUMP ID LOOKUP ===
1. When a user provides a pump ID (64-character hex string), you MUST search for it in the "Full Pump Details" JSON array above
2. Look for the "ccn_pump" field in each pump object - it contains the unique identifier
3. Once found, provide ALL available information about that pump:
   - ccn_pump (the ID itself)
   - model
   - serial_number
   - location
   - status (THIS IS THE CURRENT STATE OF THE PUMP)
   - flow_rate, pressure, power, efficiency, voltage, current, power_factor
   - last_maintenance, next_maintenance, purchase_date
4. If the ID is not in the list above, say: "The pump ID was not found in the available data."
5. DO NOT say you don't have access - you DO have access to the pump data above. Search carefully!
"""
        return context
    except Exception as e:
        current_app.logger.error(
            f"Error building analysis context from pumps data: {str(e)}"
        )
        return f"Error processing pump data: {str(e)}"


@jwt_required()
@blueprint_api_analysis.route("/api/v1/analysis/pumps/chat-stream", methods=["POST"])
def pumps_analysis_chat_stream():
    """
    Streaming chat endpoint for pump analysis questions.

    Payload:
    {
      "messages": [
        { "role": "user", "content": "..." },
        ...
      ],
      "language": "en" // optional, defaults to "en"
    }

    Response: text/event-stream with JSON lines:
      data: {"type":"chunk","content":"..."}
      data: {"type":"error","error":"..."}
      data: {"type":"complete"}
    """
    try:
        payload = request.get_json(silent=True) or {}
        messages = payload.get("messages", [])
        language = payload.get("language", "en")
        model_name = payload.get("model") or os.getenv(
            "PORTFOLIO_CHAT_MODEL", "llama3.2:3b"
        )

        if not messages:
            return jsonify({"error": "Messages are required"}), 400

        # Validate language
        valid_languages = {"es", "de", "en", "pl", "uk"}
        if language not in valid_languages:
            language = "en"

        # Check if pumps data was sent from Redux store
        pumps_data_from_frontend = payload.get("pumpsData", [])

        # If we have pumps data from frontend, use it; otherwise build from database
        if pumps_data_from_frontend:
            # Use data from Redux store
            analysis_context = _build_analysis_context_from_pumps_data(
                pumps_data_from_frontend
            )
        else:
            # Fallback to database query
            analysis_context = _build_analysis_context()

        # Check if the last user message contains a pump ID (64-character hex string)
        # If so, fetch that specific pump and add it to the context
        if messages:
            last_user_message = None
            for msg in reversed(messages):
                if msg.get("role") == "user":
                    last_user_message = msg.get("content", "")
                    break

            if last_user_message:
                # Look for 64-character hexadecimal strings (pump IDs)
                pump_id_pattern = r"\b[0-9a-f]{64}\b"
                pump_ids_found = re.findall(pump_id_pattern, last_user_message.lower())

                if pump_ids_found:
                    # Fetch specific pumps from database
                    specific_pumps = []
                    for pump_id in pump_ids_found[
                        :3
                    ]:  # Limit to 3 IDs to avoid overload
                        pump = Pump.query.filter_by(ccn_pump=pump_id).first()
                        if pump:
                            pump_dict = {
                                "ccn_pump": pump.ccn_pump,
                                "model": pump.model,
                                "serial_number": pump.serial_number,
                                "location": pump.location,
                                "status": pump.status,
                                "flow_rate": float(pump.flow_rate),
                                "pressure": float(pump.pressure),
                                "power": float(pump.power),
                                "efficiency": float(pump.efficiency),
                                "voltage": float(pump.voltage),
                                "current": float(pump.current),
                                "power_factor": float(pump.power_factor),
                                "last_maintenance": (
                                    pump.last_maintenance.strftime("%Y-%m-%d %H:%M:%S")
                                    if pump.last_maintenance
                                    else None
                                ),
                                "next_maintenance": (
                                    pump.next_maintenance.strftime("%Y-%m-%d %H:%M:%S")
                                    if pump.next_maintenance
                                    else None
                                ),
                                "purchase_date": (
                                    pump.purchase_date.strftime("%Y-%m-%d %H:%M:%S")
                                    if pump.purchase_date
                                    else None
                                ),
                            }
                            specific_pumps.append(pump_dict)

                    if specific_pumps:
                        # Add specific pump data to context
                        specific_pumps_json = json.dumps(
                            specific_pumps, separators=(",", ":"), default=str
                        )
                        analysis_context += f"\n\n=== SPECIFIC PUMP(S) REQUESTED ===\n"
                        analysis_context += f"The user is asking about the following pump ID(s). Here is the complete information:\n"
                        analysis_context += f"{specific_pumps_json}\n"
                        analysis_context += f"IMPORTANT: Use this information to answer the user's question about these specific pump(s).\n"

        # Language mapping
        language_names = {
            "es": "Spanish (Español)",
            "de": "German (Deutsch)",
            "en": "English",
            "pl": "Polish (Polski)",
            "uk": "Ukrainian (Українська)",
        }
        language_name = language_names.get(language, "English")

        # Build system prompt
        system_prompt = (
            f"You are an AI assistant that helps analyze pump inventory data. "
            f"You have access to detailed information about each individual pump, including their unique IDs (ccn_pump), "
            f"as well as aggregated statistics and metrics. "
            f"Use the data provided below to answer questions accurately. "
            f"Always respond in {language_name}.\n\n"
            f"=== PUMP DATA CONTEXT ===\n"
            f"{analysis_context}\n"
            f"=== END CONTEXT ===\n\n"
            f"CRITICAL RULES FOR ANSWERING:\n"
            f"1. When a user asks about a specific pump ID (a 64-character hex string), you MUST:\n"
            f"   - Search through the 'Full Pump Details' JSON array in the context above\n"
            f"   - Look for the exact match in the 'ccn_pump' field of each pump object\n"
            f"   - Extract ALL information about that pump and provide it to the user\n"
            f"   - The 'status' field tells you the current state of the pump\n"
            f"2. NEVER say you don't have access to pump data - you DO have access in the context above\n"
            f"3. If you cannot find a pump ID, check if it's in the 'Available Pump IDs' list first\n"
            f"4. Use the data above to provide accurate answers about pump status, locations, metrics, etc.\n"
            f"5. Be specific with numbers and percentages when available\n"
            f"6. For individual pump queries, ALWAYS provide: model, serial_number, location, status (current state), and all technical metrics\n"
            f"7. If asked about trends or insights, analyze the data provided\n"
            f"8. If a pump ID is not found after searching, inform the user that it may not exist or may be beyond the displayed limit\n"
        )

        # Prepare messages
        openai_messages = [{"role": "system", "content": system_prompt}]
        openai_messages.extend(messages)

        # Get Ollama client
        logger = current_app.logger
        client = _get_ollama_client()
        app = current_app._get_current_object()

        @stream_with_context
        def generate():
            with app.app_context():
                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=openai_messages,
                        stream=True,
                        temperature=0.7,
                    )

                    for chunk in response:
                        if chunk.choices[0].delta.content:
                            content = chunk.choices[0].delta.content
                            yield f"data: {json.dumps({'type': 'chunk', 'content': content})}\n\n"

                    yield f"data: {json.dumps({'type': 'complete'})}\n\n"

                except Exception as e:
                    logger.error(f"Error in analysis chat stream: {str(e)}")
                    yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

        return Response(generate(), mimetype="text/event-stream")

    except Exception as e:
        current_app.logger.error(f"Error in pumps analysis chat: {str(e)}")
        return jsonify({"error": str(e)}), 500
