from database import db
from datetime import datetime, timezone


class LocationQuery(db.Model):
    __tablename__ = "location_queries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    csai = db.Column(db.Float, nullable=False)
    cloud_cover = db.Column(db.Integer)
    visible_objects = db.Column(db.String(500))
    queried_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "lat": self.lat,
            "lon": self.lon,
            "csai": self.csai,
            "cloud_cover": self.cloud_cover,
            "visible_objects": self.visible_objects,
            "queried_at": self.queried_at.isoformat(),
        }
