import json
import math
from typing import Dict, List, Any


class FinancialCalculatorService:
    """Servicio para realizar cálculos financieros"""

    @staticmethod
    def calculate_present_value(
        future_value: float, interest_rate: float, time_periods: int
    ) -> Dict[str, Any]:
        """
        Calcular el valor presente
        VP = VF / (1 + r)^n
        """
        if interest_rate == 0:
            present_value = future_value
        else:
            present_value = future_value / ((1 + interest_rate / 100) ** time_periods)

        return {
            "present_value": round(present_value, 2),
            "future_value": future_value,
            "interest_rate": interest_rate,
            "time_periods": time_periods,
            "discount_factor": round(
                1 / ((1 + interest_rate / 100) ** time_periods), 6
            ),
        }

    @staticmethod
    def calculate_future_value(
        present_value: float, interest_rate: float, time_periods: int
    ) -> Dict[str, Any]:
        """
        Calcular el valor futuro
        VF = VP * (1 + r)^n
        """
        if interest_rate == 0:
            future_value = present_value
        else:
            future_value = present_value * ((1 + interest_rate / 100) ** time_periods)

        return {
            "future_value": round(future_value, 2),
            "present_value": present_value,
            "interest_rate": interest_rate,
            "time_periods": time_periods,
            "compound_factor": round((1 + interest_rate / 100) ** time_periods, 6),
        }

    @staticmethod
    def calculate_annuity_present_value(
        payment: float, interest_rate: float, periods: int
    ) -> Dict[str, Any]:
        """
        Calcular el valor presente de una anualidad
        VP = P * [(1 - (1 + r)^-n) / r]
        """
        if interest_rate == 0:
            present_value = payment * periods
        else:
            present_value = payment * (
                (1 - (1 + interest_rate / 100) ** -periods) / (interest_rate / 100)
            )

        return {
            "present_value": round(present_value, 2),
            "payment": payment,
            "interest_rate": interest_rate,
            "periods": periods,
            "total_payments": round(payment * periods, 2),
            "interest_total": round(present_value - (payment * periods), 2),
        }

    @staticmethod
    def calculate_compound_interest(
        principal: float,
        interest_rate: float,
        time_years: int,
        compound_frequency: int = 1,
    ) -> Dict[str, Any]:
        """
        Calcular interés compuesto
        A = P * (1 + r/n)^(n*t)
        """
        if interest_rate == 0:
            amount = principal
        else:
            amount = principal * (
                (1 + (interest_rate / 100) / compound_frequency)
                ** (compound_frequency * time_years)
            )

        interest_earned = amount - principal

        return {
            "final_amount": round(amount, 2),
            "principal": principal,
            "interest_earned": round(interest_earned, 2),
            "interest_rate": interest_rate,
            "time_years": time_years,
            "compound_frequency": compound_frequency,
            "effective_rate": round(
                (
                    (1 + (interest_rate / 100) / compound_frequency)
                    ** compound_frequency
                    - 1
                )
                * 100,
                4,
            ),
        }

    @staticmethod
    def calculate_amortization_schedule(
        loan_amount: float, annual_rate: float, years: int
    ) -> Dict[str, Any]:
        """
        Calcular tabla de amortización
        """
        monthly_rate = annual_rate / 100 / 12
        total_payments = years * 12

        if monthly_rate == 0:
            monthly_payment = loan_amount / total_payments
        else:
            monthly_payment = (
                loan_amount
                * (monthly_rate * (1 + monthly_rate) ** total_payments)
                / ((1 + monthly_rate) ** total_payments - 1)
            )

        schedule = []
        remaining_balance = loan_amount
        total_interest = 0

        for month in range(1, total_payments + 1):
            interest_payment = remaining_balance * monthly_rate
            principal_payment = monthly_payment - interest_payment
            remaining_balance -= principal_payment
            total_interest += interest_payment

            schedule.append(
                {
                    "month": month,
                    "payment": round(monthly_payment, 2),
                    "principal": round(principal_payment, 2),
                    "interest": round(interest_payment, 2),
                    "balance": round(max(0, remaining_balance), 2),
                }
            )

            if remaining_balance <= 0:
                break

        return {
            "monthly_payment": round(monthly_payment, 2),
            "total_payments": total_payments,
            "total_interest": round(total_interest, 2),
            "total_amount": round(loan_amount + total_interest, 2),
            "schedule": schedule,
        }

    @classmethod
    def perform_calculation(
        cls, calculation_type: str, parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Realizar el cálculo financiero según el tipo especificado
        """
        try:
            if calculation_type == "present_value":
                return cls.calculate_present_value(
                    parameters["future_value"],
                    parameters["interest_rate"],
                    parameters["time_periods"],
                )

            elif calculation_type == "future_value":
                return cls.calculate_future_value(
                    parameters["present_value"],
                    parameters["interest_rate"],
                    parameters["time_periods"],
                )

            elif calculation_type == "annuity":
                return cls.calculate_annuity_present_value(
                    parameters["annuity_payment"],
                    parameters["interest_rate"],
                    parameters["annuity_periods"],
                )

            elif calculation_type == "compound_interest":
                return cls.calculate_compound_interest(
                    parameters["initial_investment"],
                    parameters["interest_rate"],
                    parameters["time_periods"],
                    parameters.get("compound_frequency", 1),
                )

            elif calculation_type == "amortization":
                return cls.calculate_amortization_schedule(
                    parameters["loan_amount"],
                    parameters["interest_rate"],
                    parameters["loan_term_years"],
                )

            else:
                raise ValueError(f"Tipo de cálculo no soportado: {calculation_type}")

        except Exception as e:
            raise ValueError(f"Error en el cálculo: {str(e)}")
