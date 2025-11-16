from portfolio_app.extensions import db
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship


class TblFinancialCalculations(db.Model):
    __tablename__ = "tbl_financial_calculations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("tbl_users.ccn_user"), nullable=False)
    calculation_type = Column(
        String(50), nullable=False
    )  # 'present_value', 'future_value', 'annuity', 'compound_interest', 'amortization'
    title = Column(String(200), nullable=False)
    description = Column(Text)

    # Input parameters (stored as JSON-like structure)
    input_parameters = Column(Text)  # JSON string with all input values

    # Results
    result_value = Column(Float)
    result_details = Column(Text)  # JSON string with detailed results

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="financial_calculations")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "calculation_type": self.calculation_type,
            "title": self.title,
            "description": self.description,
            "input_parameters": self.input_parameters,
            "result_value": self.result_value,
            "result_details": self.result_details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
