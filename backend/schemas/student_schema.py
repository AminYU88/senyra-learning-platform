from pydantic import BaseModel


class StudentCreate(BaseModel):
    full_name: str
    email: str
    password: str


class StudentLogin(BaseModel):
    email: str
    password: str


class StudentResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True
