from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request
)

from fastapi.security import (
    OAuth2PasswordBearer
)
from urllib.parse import parse_qs

from jose import JWTError, jwt

from sqlalchemy.orm import Session

from backend.config.auth import (
    SECRET_KEY,
    ALGORITHM
)

from backend.database.connection import SessionLocal

from backend.models.student import Student

from backend.schemas.student_schema import (
    StudentCreate,
    StudentResponse
)

from backend.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)
from backend.auth.role_checker import require_student

router = APIRouter(
    tags=["Students"]
)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


def get_current_student(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid authentication credentials"
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    student = db.query(Student).filter(
        Student.email == email
    ).first()

    if student is None:
        raise credentials_exception

    return student


@router.post(
    "/students",
    response_model=StudentResponse
)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db)
):

    existing_student = db.query(Student).filter(
        Student.email == student.email
    ).first()

    if existing_student:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_student = Student(
        full_name=student.full_name,
        email=student.email,
        password=hash_password(student.password)
    )

    db.add(new_student)

    db.commit()

    db.refresh(new_student)

    return new_student


@router.get(
    "/students",
    response_model=list[StudentResponse]
)
def get_students(
    db: Session = Depends(get_db)
):

    return db.query(Student).all()


async def get_login_credentials(request: Request):
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        data = await request.json()
        return {
            "username": data.get("username") or data.get("email"),
            "password": data.get("password")
        }

    body = (await request.body()).decode("utf-8")
    form_data = parse_qs(body)

    return {
        "username": form_data.get("username", [None])[0]
        or form_data.get("email", [None])[0],
        "password": form_data.get("password", [None])[0]
    }


@router.post("/login")
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    credentials = await get_login_credentials(request)

    existing_student = db.query(Student).filter(
        Student.email == credentials["username"]
    ).first()

    if not existing_student:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    valid_password = verify_password(
        credentials["password"] or "",
        existing_student.password
    )

    if not valid_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": existing_student.email,
            "role": existing_student.role,
            "user_id": existing_student.id
        }
    )

    user_payload = {
        "id": existing_student.id,
        "full_name": existing_student.full_name,
        "email": existing_student.email,
        "role": existing_student.role
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": existing_student.role,
        "user": user_payload,
        "id": existing_student.id,
        "full_name": existing_student.full_name,
        "email": existing_student.email
    }


@router.get("/me")
def get_me(
    current_student: Student = Depends(
        get_current_student
    )
):

    return {
        "id": current_student.id,
        "full_name": current_student.full_name,
        "email": current_student.email,
        "role": current_student.role
    }


@router.get("/student/dashboard")
def student_dashboard(
    current_student: Student = Depends(require_student)
):
    return {
        "message": "Student dashboard access granted",
        "user": {
            "id": current_student.id,
            "full_name": current_student.full_name,
            "email": current_student.email,
            "role": current_student.role
        }
    }
