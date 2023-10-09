from portfolio_app import db


class AutoPerceivedGender(db.Model):
    __tablename__ = "tbl_auto_perceived_gender"
    ccn_auto_perceived_gender = db.Column(db.Integer, primary_key=True)
    auto_perceived_gender = db.Column(db.String(40), nullable=True)

    # Relations
    rel_user = db.relationship("User", backref="AutoPerceivedGender")

    def __init__(self, auto_perceived_gender):
        self.auto_perceived_gender = auto_perceived_gender

    def __repr__(self):
        return f"Gender : {self.auto_perceived_gender}"
