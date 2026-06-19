from jose import JWTError, jwt

from fastapi import Depends, HTTPException, status

from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from backend.config.auth import (
    SECRET_KEY,
    ALGORITHM
)

from backend.database.connection import get_db

from backend.models.student import Student


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
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


    user = db.query(Student).filter(
        Student.email == email
    ).first()


    if user is None:

        raise credentials_exception


    return user