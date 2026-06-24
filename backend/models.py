from datetime import datetime, timezone

class LocationQuery:
    def __init__(self, id=None, name=None, lat=None, lon=None, csai=None, cloud_cover=None, visible_objects=None, queried_at=None):
        self.id = id
        self.name = name
        self.lat = lat
        self.lon = lon
        self.csai = csai
        self.cloud_cover = cloud_cover
        self.visible_objects = visible_objects
        self.queried_at = queried_at or datetime.now(timezone.utc)

    @classmethod
    def from_row(cls, row):
        if not row:
            return None
        # Expected tuple order matching SELECT: id, name, lat, lon, csai, cloud_cover, visible_objects, queried_at
        return cls(
            id=row[0],
            name=row[1],
            lat=row[2],
            lon=row[3],
            csai=row[4],
            cloud_cover=row[5],
            visible_objects=row[6],
            queried_at=row[7]
        )

    def to_dict(self):
        q_at = self.queried_at
        if q_at and q_at.tzinfo is None:
            q_at = q_at.replace(tzinfo=timezone.utc)
        return {
            "id": self.id,
            "name": self.name,
            "lat": self.lat,
            "lon": self.lon,
            "csai": self.csai,
            "cloud_cover": self.cloud_cover,
            "visible_objects": self.visible_objects,
            "queried_at": q_at.isoformat() if q_at else None,
        }
