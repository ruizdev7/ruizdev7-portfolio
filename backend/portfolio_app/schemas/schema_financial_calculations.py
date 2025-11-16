from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from datetime import datetime


class FinancialCalculationInputSchema(Schema):
    """Schema para validar los inputs de cálculos financieros"""

    # Campos comunes
    calculation_type = fields.Str(
        required=True,
        validate=validate.OneOf(
            [
                "present_value",
                "future_value",
                "annuity",
                "compound_interest",
                "amortization",
            ]
        ),
    )
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    description = fields.Str(allow_none=True, validate=validate.Length(max=1000))

    # Parámetros financieros básicos
    principal_amount = fields.Float(allow_none=True, validate=validate.Range(min=0))
    interest_rate = fields.Float(
        allow_none=True, validate=validate.Range(min=0, max=100)
    )
    time_periods = fields.Integer(allow_none=True, validate=validate.Range(min=1))
    payment_amount = fields.Float(allow_none=True, validate=validate.Range(min=0))
    future_value = fields.Float(allow_none=True, validate=validate.Range(min=0))
    present_value = fields.Float(allow_none=True, validate=validate.Range(min=0))

    # Parámetros específicos para amortización
    loan_amount = fields.Float(allow_none=True, validate=validate.Range(min=0))
    monthly_payment = fields.Float(allow_none=True, validate=validate.Range(min=0))
    loan_term_years = fields.Integer(
        allow_none=True, validate=validate.Range(min=1, max=50)
    )

    # Parámetros específicos para anualidades
    annuity_payment = fields.Float(allow_none=True, validate=validate.Range(min=0))
    annuity_periods = fields.Integer(allow_none=True, validate=validate.Range(min=1))

    # Parámetros específicos para interés compuesto
    compound_frequency = fields.Integer(
        allow_none=True, validate=validate.Range(min=1, max=365)
    )
    initial_investment = fields.Float(allow_none=True, validate=validate.Range(min=0))

    @validates_schema
    def validate_calculation_requirements(self, data, **kwargs):
        """Validar que se proporcionen los parámetros necesarios según el tipo de cálculo"""
        calc_type = data.get("calculation_type")

        if calc_type == "present_value":
            if (
                not data.get("future_value")
                or not data.get("interest_rate")
                or not data.get("time_periods")
            ):
                raise ValidationError(
                    "Present value calculation requires: future_value, interest_rate, time_periods"
                )

        elif calc_type == "future_value":
            if (
                not data.get("present_value")
                or not data.get("interest_rate")
                or not data.get("time_periods")
            ):
                raise ValidationError(
                    "Future value calculation requires: present_value, interest_rate, time_periods"
                )

        elif calc_type == "annuity":
            if (
                not data.get("annuity_payment")
                or not data.get("interest_rate")
                or not data.get("annuity_periods")
            ):
                raise ValidationError(
                    "Annuity calculation requires: annuity_payment, interest_rate, annuity_periods"
                )

        elif calc_type == "compound_interest":
            if (
                not data.get("initial_investment")
                or not data.get("interest_rate")
                or not data.get("time_periods")
            ):
                raise ValidationError(
                    "Compound interest calculation requires: initial_investment, interest_rate, time_periods"
                )

        elif calc_type == "amortization":
            if (
                not data.get("loan_amount")
                or not data.get("interest_rate")
                or not data.get("loan_term_years")
            ):
                raise ValidationError(
                    "Amortization calculation requires: loan_amount, interest_rate, loan_term_years"
                )


class FinancialCalculationResponseSchema(Schema):
    """Schema para la respuesta de cálculos financieros"""

    id = fields.Int()
    user_id = fields.Int()
    calculation_type = fields.Str()
    title = fields.Str()
    description = fields.Str()
    input_parameters = fields.Str()
    result_value = fields.Float()
    result_details = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class FinancialCalculationListSchema(Schema):
    """Schema para listar cálculos financieros"""

    id = fields.Int()
    calculation_type = fields.Str()
    title = fields.Str()
    result_value = fields.Float()
    created_at = fields.DateTime()
