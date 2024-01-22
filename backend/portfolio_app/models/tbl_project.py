from portfolio_app import db


class Project(db.Model):
    __tablename__ = "tbl_project"
    ccn_project = db.Column(db.Integer, primary_key=True)
    title_project = db.Column(db.String(100), nullable=False)
    description_project = db.Column(db.String(300), nullable=False)
    pdf_software_requirement = db.Column(db.LargeBinary, nullable=True)
    image_entity_relationship = db.Column(db.LargeBinary, nullable=True)

    def __init__(
        self,
        title_project,
        description_project,
        pdf_software_requirement,
        image_entity_relationship,
    ):
        self.title_project = title_project
        self.description_project = description_project
        self.pdf_software_requirement = pdf_software_requirement
        self.image_entity_relationship = image_entity_relationship

    def choice_query():
        return Project.query

    def __repr__(self):
        return f"Project: {self.title_project}"
