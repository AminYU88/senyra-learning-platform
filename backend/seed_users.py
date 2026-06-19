import sys
from pathlib import Path

from sqlalchemy import inspect, text

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.database.connection import Base, SessionLocal, engine
from backend.models.student import Student
from backend.utils.security import hash_password


DEMO_USERS = [
    {
        "full_name": "Admin User",
        "email": "admin@senyra.com",
        "password": "Admin123!",
        "role": "admin"
    },
    {
        "full_name": "Teacher User",
        "email": "teacher@senyra.com",
        "password": "Teacher123!",
        "role": "teacher"
    },
    {
        "full_name": "Student User",
        "email": "student@senyra.com",
        "password": "Student123!",
        "role": "student"
    }
]


def ensure_tables_and_role_column():
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    columns = [
        column["name"]
        for column in inspector.get_columns("students")
    ]

    if "role" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE students ADD COLUMN role VARCHAR DEFAULT 'student'")
            )


def seed_demo_users():
    ensure_tables_and_role_column()

    db = SessionLocal()

    try:
        for demo_user in DEMO_USERS:
            user = (
                db.query(Student)
                .filter(Student.email == demo_user["email"])
                .first()
            )

            if user:
                user.full_name = demo_user["full_name"]
                user.password = hash_password(demo_user["password"])
                user.role = demo_user["role"]
                print(f"Updated {demo_user['role']}: {demo_user['email']}")
                continue

            user = Student(
                full_name=demo_user["full_name"],
                email=demo_user["email"],
                password=hash_password(demo_user["password"]),
                role=demo_user["role"]
            )

            db.add(user)
            print(f"Created {demo_user['role']}: {demo_user['email']}")

        db.commit()
        print("Demo users seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_users()
