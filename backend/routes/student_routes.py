from urllib.parse import parse_qs

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.config.auth import SECRET_KEY, ALGORITHM
from backend.database.connection import SessionLocal
from backend.models.student import Student
from backend.schemas.student_schema import StudentCreate, StudentResponse
from backend.utils.security import hash_password, verify_password, create_access_token


router = APIRouter(tags=["Students"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ==========================
# DATABASE DEPENDENCY
# ==========================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================
# AUTH HELPERS
# ==========================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials"
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = (
        db.query(Student)
        .filter(Student.email == email)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user


# Backwards-compatible name for old routes
def get_current_student(
    current_user: Student = Depends(get_current_user)
):
    return current_user


def require_role(required_roles: list[str]):
    def role_checker(
        current_user: Student = Depends(get_current_user)
    ):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(required_roles)}"
            )

        return current_user

    return role_checker


def require_student(
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required"
        )

    return current_user


def require_teacher(
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access required"
        )

    return current_user


def require_admin(
    current_user: Student = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return current_user


def require_admin_or_teacher(
    current_user: Student = Depends(get_current_user)
):
    if current_user.role not in ["admin", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or teacher access required"
        )

    return current_user


# ==========================
# STUDENT REGISTRATION
# ==========================

@router.post(
    "/students",
    response_model=StudentResponse
)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db)
):
    existing_student = (
        db.query(Student)
        .filter(Student.email == student.email)
        .first()
    )

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_student = Student(
        full_name=student.full_name,
        email=student.email,
        password=hash_password(student.password),
        role="student"
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


# ==========================
# STUDENT LIST
# ==========================

@router.get(
    "/students",
    response_model=list[StudentResponse]
)
def get_students(
    db: Session = Depends(get_db)
):
    return db.query(Student).all()


# ==========================
# LOGIN HELPERS
# ==========================

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
        "username": (
            form_data.get("username", [None])[0]
            or form_data.get("email", [None])[0]
        ),
        "password": form_data.get("password", [None])[0]
    }


# ==========================
# LOGIN
# ==========================

@router.post("/login")
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    credentials = await get_login_credentials(request)

    email = credentials.get("username")
    password = credentials.get("password") or ""

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    existing_user = (
        db.query(Student)
        .filter(Student.email == email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    valid_password = verify_password(
        password,
        existing_user.password
    )

    if not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "role": existing_user.role,
            "user_id": existing_user.id
        }
    )

    user_payload = {
        "id": existing_user.id,
        "full_name": existing_user.full_name,
        "email": existing_user.email,
        "role": existing_user.role
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": existing_user.role,
        "user": user_payload,
        "id": existing_user.id,
        "full_name": existing_user.full_name,
        "email": existing_user.email
    }


# ==========================
# CURRENT USER
# ==========================

@router.get("/me")
def get_me(
    current_user: Student = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }


# ==========================
# ROLE CHECK ROUTES
# ==========================

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


@router.get("/teacher/check")
def teacher_check(
    current_teacher: Student = Depends(require_teacher)
):
    return {
        "message": "Teacher access granted",
        "user": {
            "id": current_teacher.id,
            "full_name": current_teacher.full_name,
            "email": current_teacher.email,
            "role": current_teacher.role
        }
    }


@router.get("/admin/check")
def admin_check(
    current_admin: Student = Depends(require_admin)
):
    return {
        "message": "Admin access granted",
        "user": {
            "id": current_admin.id,
            "full_name": current_admin.full_name,
            "email": current_admin.email,
            "role": current_admin.role
        }
    }