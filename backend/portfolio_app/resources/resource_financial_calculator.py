from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
import json

from portfolio_app.models.tbl_financial_calculations import TblFinancialCalculations
from portfolio_app.schemas.schema_financial_calculations import (
    FinancialCalculationInputSchema,
    FinancialCalculationResponseSchema,
    FinancialCalculationListSchema,
)
from portfolio_app.services.financial_calculator_service import (
    FinancialCalculatorService,
)
from portfolio_app.extensions import db

blueprint_api_financial_calculator = Blueprint(
    "api_financial_calculator", __name__, url_prefix=""
)


@blueprint_api_financial_calculator.route("/api/financial-calculator", methods=["POST"])
@jwt_required()
def create_calculation():
    """Crear un nuevo cálculo financiero"""
    try:
        # Validar datos de entrada
        schema = FinancialCalculationInputSchema()
        data = schema.load(request.json)

        # Obtener ID del usuario autenticado
        user_email = get_jwt_identity()
        # Buscar el usuario por email para obtener su ID
        from portfolio_app.models.tbl_users import User

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return {"error": "Usuario no encontrado"}, 404
        user_id = user.ccn_user

        # Realizar el cálculo
        calculation_result = FinancialCalculatorService.perform_calculation(
            data["calculation_type"], data
        )

        # Guardar en la base de datos
        financial_calc = TblFinancialCalculations(
            user_id=user_id,
            calculation_type=data["calculation_type"],
            title=data["title"],
            description=data.get("description"),
            input_parameters=json.dumps(data),
            result_value=calculation_result.get("present_value")
            or calculation_result.get("future_value")
            or calculation_result.get("final_amount")
            or calculation_result.get("monthly_payment")
            or 0,
            result_details=json.dumps(calculation_result),
        )

        db.session.add(financial_calc)
        db.session.commit()

        # Preparar respuesta
        response_schema = FinancialCalculationResponseSchema()
        return response_schema.dump(financial_calc), 201

    except ValidationError as e:
        return {"error": "Datos de entrada inválidos", "details": e.messages}, 400
    except ValueError as e:
        return {"error": "Error en el cálculo", "details": str(e)}, 400
    except Exception as e:
        db.session.rollback()
        return {"error": "Error interno del servidor", "details": str(e)}, 500


@blueprint_api_financial_calculator.route("/api/financial-calculator", methods=["GET"])
@jwt_required()
def get_calculations():
    """Obtener todos los cálculos del usuario"""
    try:
        user_email = get_jwt_identity()
        # Buscar el usuario por email para obtener su ID
        from portfolio_app.models.tbl_users import User

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return {"error": "Usuario no encontrado"}, 404
        user_id = user.ccn_user

        # Obtener parámetros de consulta
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        calc_type = request.args.get("type")

        # Construir consulta
        query = TblFinancialCalculations.query.filter_by(user_id=user_id)

        if calc_type:
            query = query.filter_by(calculation_type=calc_type)

        # Paginación
        pagination = query.order_by(
            TblFinancialCalculations.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        # Preparar respuesta
        schema = FinancialCalculationListSchema(many=True)
        calculations = schema.dump(pagination.items)

        return {
            "calculations": calculations,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_prev": pagination.has_prev,
            },
        }, 200

    except Exception as e:
        return {"error": "Error al obtener cálculos", "details": str(e)}, 500


@blueprint_api_financial_calculator.route(
    "/api/financial-calculator/<int:calc_id>", methods=["GET"]
)
@jwt_required()
def get_calculation_by_id(calc_id):
    """Obtener un cálculo específico"""
    try:
        user_email = get_jwt_identity()
        # Buscar el usuario por email para obtener su ID
        from portfolio_app.models.tbl_users import User

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return {"error": "Usuario no encontrado"}, 404
        user_id = user.ccn_user

        calculation = TblFinancialCalculations.query.filter_by(
            id=calc_id, user_id=user_id
        ).first()

        if not calculation:
            return {"error": "Cálculo no encontrado"}, 404

        schema = FinancialCalculationResponseSchema()
        return schema.dump(calculation), 200

    except Exception as e:
        return {"error": "Error al obtener el cálculo", "details": str(e)}, 500


@blueprint_api_financial_calculator.route(
    "/api/financial-calculator/<int:calc_id>", methods=["PUT"]
)
@jwt_required()
def update_calculation(calc_id):
    """Actualizar un cálculo"""
    try:
        user_email = get_jwt_identity()
        # Buscar el usuario por email para obtener su ID
        from portfolio_app.models.tbl_users import User

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return {"error": "Usuario no encontrado"}, 404
        user_id = user.ccn_user

        calculation = TblFinancialCalculations.query.filter_by(
            id=calc_id, user_id=user_id
        ).first()

        if not calculation:
            return {"error": "Cálculo no encontrado"}, 404

        # Validar datos de entrada
        schema = FinancialCalculationInputSchema()
        data = schema.load(request.json)

        # Realizar nuevo cálculo
        calculation_result = FinancialCalculatorService.perform_calculation(
            data["calculation_type"], data
        )

        # Actualizar registro
        calculation.calculation_type = data["calculation_type"]
        calculation.title = data["title"]
        calculation.description = data.get("description")
        calculation.input_parameters = json.dumps(data)
        calculation.result_value = (
            calculation_result.get("present_value")
            or calculation_result.get("future_value")
            or calculation_result.get("final_amount")
            or calculation_result.get("monthly_payment")
            or 0
        )
        calculation.result_details = json.dumps(calculation_result)

        db.session.commit()

        response_schema = FinancialCalculationResponseSchema()
        return response_schema.dump(calculation), 200

    except ValidationError as e:
        return {"error": "Datos de entrada inválidos", "details": e.messages}, 400
    except ValueError as e:
        return {"error": "Error en el cálculo", "details": str(e)}, 400
    except Exception as e:
        db.session.rollback()
        return {"error": "Error al actualizar el cálculo", "details": str(e)}, 500


@blueprint_api_financial_calculator.route(
    "/api/financial-calculator/<int:calc_id>", methods=["DELETE"]
)
@jwt_required()
def delete_calculation(calc_id):
    """Eliminar un cálculo"""
    try:
        user_email = get_jwt_identity()
        # Buscar el usuario por email para obtener su ID
        from portfolio_app.models.tbl_users import User

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return {"error": "Usuario no encontrado"}, 404
        user_id = user.ccn_user

        calculation = TblFinancialCalculations.query.filter_by(
            id=calc_id, user_id=user_id
        ).first()

        if not calculation:
            return {"error": "Cálculo no encontrado"}, 404

        db.session.delete(calculation)
        db.session.commit()

        return {"message": "Cálculo eliminado exitosamente"}, 200

    except Exception as e:
        db.session.rollback()
        return {"error": "Error al eliminar el cálculo", "details": str(e)}, 500


@blueprint_api_financial_calculator.route(
    "/api/financial-calculator/types", methods=["GET"]
)
def get_calculation_types():
    """Obtener tipos de cálculos financieros disponibles"""
    calculation_types = [
        {
            "type": "present_value",
            "name": "Valor Presente",
            "description": "Calcular el valor actual de una inversión futura",
            "required_fields": ["future_value", "interest_rate", "time_periods"],
        },
        {
            "type": "future_value",
            "name": "Valor Futuro",
            "description": "Calcular el valor futuro de una inversión actual",
            "required_fields": ["present_value", "interest_rate", "time_periods"],
        },
        {
            "type": "annuity",
            "name": "Anualidad",
            "description": "Calcular el valor presente de una serie de pagos",
            "required_fields": [
                "annuity_payment",
                "interest_rate",
                "annuity_periods",
            ],
        },
        {
            "type": "compound_interest",
            "name": "Interés Compuesto",
            "description": "Calcular el crecimiento de una inversión con interés compuesto",
            "required_fields": [
                "initial_investment",
                "interest_rate",
                "time_periods",
            ],
        },
        {
            "type": "amortization",
            "name": "Amortización",
            "description": "Calcular tabla de amortización de un préstamo",
            "required_fields": ["loan_amount", "interest_rate", "loan_term_years"],
        },
    ]

    return {"calculation_types": calculation_types}, 200
