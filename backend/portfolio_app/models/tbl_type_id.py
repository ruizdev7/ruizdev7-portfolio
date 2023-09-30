from portfolio_app import db


class TypeId(db.Model):
    __tablename__ = "tbl_type_id"
    ccn_type_id = db.Column(db.Integer, primary_key=True)
    type_id = db.Column(db.String(3), nullable=False)
    description_type_id = db.Column(db.String(40), nullable=False)

    # Relationships
    rel_writer = db.relationship("Writer", backref="TypeId", lazy=True)

    def __init__(self, type_id, description_type_id):
        self.type_id = type_id
        self.description_type_id = description_type_id

    def __repr__(self):
        return f"TypeID: {self.description_type_id}"
