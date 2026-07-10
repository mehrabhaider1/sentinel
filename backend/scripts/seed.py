from app.database.session import SessionLocal
from app.models.organization import Organization
from app.schemas.user import UserCreate
from app.services.user_service import UserService


def main() -> None:
    db = SessionLocal()

    try:
        organization = (
            db.query(Organization).filter(Organization.slug == "sentinel").first()
        )

        if organization is None:
            organization = Organization(
                name="Sentinel AI",
                slug="sentinel",
            )

            db.add(organization)
            db.commit()
            db.refresh(organization)

        service = UserService(db)

        existing = service.get_by_email("admin@sentinel.ai")

        if existing is None:
            service.create_user(
                UserCreate(
                    email="admin@sentinel.ai",
                    password="Sentinel123!",
                    full_name="System Administrator",
                    organization_id=organization.id,
                )
            )

            print("✅ Admin user created.")

        else:
            print("ℹ️ Admin user already exists.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
