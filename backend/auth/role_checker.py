from typing import Any, Callable

from fastapi import Depends, HTTPException, status

from backend.auth.auth_handler import get_current_user
from backend.models.student import Student


def _normalise_roles(roles: tuple[Any, ...]) -> set[str]:
    normalised_roles = set()

    for role in roles:
        if isinstance(role, (list, tuple, set)):
            for item in role:
                normalised_roles.add(str(item).lower().strip())
        else:
            normalised_roles.add(str(role).lower().strip())

    normalised_roles.discard("")
    return normalised_roles


def require_roles(*allowed_roles: Any) -> Callable:
    allowed_role_set = _normalise_roles(allowed_roles)

    if not allowed_role_set:
        raise ValueError("require_roles() must include at least one role")

    def role_checker(
        current_user: Student = Depends(get_current_user),
    ) -> Student:
        user_role = str(getattr(current_user, "role", "") or "").lower().strip()

        if user_role not in allowed_role_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Allowed roles: {', '.join(sorted(allowed_role_set))}",
            )

        return current_user

    return role_checker


require_admin = require_roles("admin")
require_teacher = require_roles("teacher")
require_student = require_roles("student")

require_teacher_or_admin = require_roles("teacher", "admin")
require_admin_or_teacher = require_roles("admin", "teacher")

require_any_authenticated_user = require_roles("student", "teacher", "admin")