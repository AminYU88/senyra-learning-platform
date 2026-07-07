import sys
from pathlib import Path

from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError

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
        "role": "admin",
    },
    {
        "full_name": "Teacher User",
        "email": "teacher@senyra.com",
        "password": "Teacher123!",
        "role": "teacher",
    },
    {
        "full_name": "Amina Rahman",
        "email": "student@senyra.com",
        "password": "Student123!",
        "role": "student",
    },
    {
        "full_name": "Leo Carter",
        "email": "leo.student@senyra.com",
        "password": "Student123!",
        "role": "student",
    },
    {
        "full_name": "Maya Patel",
        "email": "maya.student@senyra.com",
        "password": "Student123!",
        "role": "student",
    },
    {
        "full_name": "Noah Williams",
        "email": "noah.student@senyra.com",
        "password": "Student123!",
        "role": "student",
    },
]


def ensure_tables_and_columns():
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)

    table_names = inspector.get_table_names()

    if "students" not in table_names:
        Base.metadata.create_all(bind=engine)
        return

    columns = [
        column["name"]
        for column in inspector.get_columns("students")
    ]

    with engine.begin() as connection:
        if "role" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE students "
                    "ADD COLUMN role VARCHAR DEFAULT 'student'"
                )
            )

        if "full_name" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE students "
                    "ADD COLUMN full_name VARCHAR DEFAULT 'Unknown User'"
                )
            )


def seed_demo_users():
    ensure_tables_and_columns()

    db = SessionLocal()

    try:
        for demo_user in DEMO_USERS:
            existing_user = (
                db.query(Student)
                .filter(Student.email == demo_user["email"])
                .first()
            )

            if existing_user:
                existing_user.full_name = demo_user["full_name"]
                existing_user.password = hash_password(demo_user["password"])
                existing_user.role = demo_user["role"]

                print(
                    f"Updated {demo_user['role']}: "
                    f"{demo_user['email']}"
                )
            else:
                new_user = Student(
                    full_name=demo_user["full_name"],
                    email=demo_user["email"],
                    password=hash_password(demo_user["password"]),
                    role=demo_user["role"],
                )

                db.add(new_user)

                print(
                    f"Created {demo_user['role']}: "
                    f"{demo_user['email']}"
                )

        db.commit()

        print("Demo users seeded successfully.")
        print("Login accounts:")
        print("admin@senyra.com / Admin123!")
        print("teacher@senyra.com / Teacher123!")
        print("student@senyra.com / Student123!")

    except SQLAlchemyError as error:
        db.rollback()
        print(f"Database error while seeding users: {error}")
        raise

    except Exception as error:
        db.rollback()
        print(f"Unexpected error while seeding users: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_users()
