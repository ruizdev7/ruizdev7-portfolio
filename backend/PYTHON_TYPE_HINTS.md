# Python Type Hints Guide

## Introducción

Type hints (anotaciones de tipo) en Python permiten documentar los tipos de datos esperados, mejorando la legibilidad del código y habilitando herramientas de verificación de tipos como `mypy`.

## Imports Básicos

```python
from typing import Optional, Dict, Any, List, Tuple, Union
```

## Conceptos Clave

### 1. Tipos Básicos

```python
# Variables simples
name: str = "John"
age: int = 30
price: float = 19.99
is_active: bool = True

# Listas
users: List[str] = ["user1", "user2"]
numbers: List[int] = [1, 2, 3, 4]

# Diccionarios
user_data: Dict[str, Any] = {"name": "John", "age": 30}
config: Dict[str, str] = {"host": "localhost", "port": "8000"}

# Tuplas
point: Tuple[int, int] = (10, 20)
coordinates: Tuple[float, float, float] = (1.0, 2.0, 3.0)
```

### 2. Optional - Valores Opcionales

```python
from typing import Optional

# Puede ser str o None
username: Optional[str] = None
email: Optional[str] = "user@example.com"

# Equivalente a Union[str, None]
phone_number: Optional[str] = None
```

### 3. Funciones con Type Hints

```python
def greet(name: str) -> str:
    """Retorna un saludo personalizado"""
    return f"Hello, {name}!"

def calculate_total(items: List[float], tax: float) -> float:
    """Calcula el total con impuesto"""
    subtotal = sum(items)
    return subtotal * (1 + tax)

def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Busca un usuario por email, retorna None si no existe"""
    # ... lógica de búsqueda
    return None  # o return {"name": "John", "email": email}
```

### 4. Parámetros con Valores por Defecto

```python
def create_user(
    name: str,
    email: str,
    age: int = 0,
    is_active: bool = True
) -> Dict[str, Any]:
    """Crea un nuevo usuario"""
    return {
        "name": name,
        "email": email,
        "age": age,
        "is_active": is_active
    }

# Uso
user1 = create_user("John", "john@example.com")
user2 = create_user("Jane", "jane@example.com", age=25, is_active=False)
```

### 5. Métodos de Clase

```python
from typing import Optional, Dict, Any, List

class User:
    def __init__(
        self,
        name: str,
        email: str,
        age: Optional[int] = None
    ) -> None:
        self.name = name
        self.email = email
        self.age = age
    
    def get_info(self) -> Dict[str, Any]:
        """Retorna información del usuario"""
        info = {"name": self.name, "email": self.email}
        if self.age is not None:
            info["age"] = self.age
        return info
    
    def update_age(self, age: int) -> None:
        """Actualiza la edad del usuario"""
        self.age = age
```

### 6. Tipo de Retorno None

```python
def log_message(message: str) -> None:
    """Registra un mensaje sin retornar nada"""
    print(f"[LOG]: {message}")

def save_data(data: Dict[str, Any]) -> None:
    """Guarda datos en la base de datos"""
    # ... guardar lógica
```

### 7. Union - Múltiples Tipos Posibles

```python
from typing import Union

# Puede ser str o int
id_field: Union[str, int] = 123
id_field = "abc-123"

# También se puede escribir como:
def process_id(id_value: str | int) -> str:
    return str(id_value)
```

### 8. Respuestas de Flask

```python
from flask import Response, make_response, jsonify
from typing import Tuple

def get_user(user_id: int) -> Response:
    """Retorna un usuario en formato JSON"""
    user = {"id": user_id, "name": "John"}
    return make_response(jsonify({"user": user}), 200)

def create_user(user_data: Dict[str, Any]) -> Tuple[Response, int]:
    """Crea un usuario y retorna respuesta con código de estado"""
    # ... lógica de creación
    return make_response(jsonify({"message": "User created"}), 201)
```

### 9. SQLAlchemy Queries

```python
from typing import List, Optional
from sqlalchemy.orm import Query

class User(db.Model):
    def __init__(self, name: str, email: str) -> None:
        self.name = name
        self.email = email
    
    @staticmethod
    def find_by_email(email: str) -> Optional['User']:
        """Encuentra un usuario por email"""
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def get_all() -> List['User']:
        """Obtiene todos los usuarios"""
        return User.query.all()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte a diccionario"""
        return {"name": self.name, "email": self.email}
```

### 10. Listas y Generadores

```python
from typing import List, Iterator, Generator

def get_evens(numbers: List[int]) -> List[int]:
    """Retorna solo números pares"""
    return [n for n in numbers if n % 2 == 0]

def generate_squares(n: int) -> Generator[int, None, None]:
    """Genera cuadrados de números"""
    for i in range(n):
        yield i * i

# Uso
squares = list(generate_squares(5))  # [0, 1, 4, 9, 16]
```

## Ejemplos del Proyecto

### Ejemplo 1: Modelo de Base de Datos

```python
from typing import Optional, Dict, Any
from datetime import datetime

class AuditLog(db.Model):
    def __init__(
        self,
        ccn_user: Optional[int] = None,
        event_type: str = "",
        resource: str = "",
        description: str = "",
    ) -> None:
        self.ccn_user = ccn_user
        self.event_type = event_type
        self.resource = resource
        self.description = description
    
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el objeto a diccionario"""
        return {
            "ccn_user": self.ccn_user,
            "event_type": self.event_type,
            "resource": self.resource,
            "description": self.description,
        }
    
    def save(self) -> None:
        """Guarda en la base de datos"""
        db.session.add(self)
        db.session.commit()
```

### Ejemplo 2: Endpoint de API

```python
from flask import Response, request, make_response, jsonify
from typing import Tuple
from sqlalchemy import desc

@blueprint.route("/api/v1/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id: int) -> Response:
    """Obtiene un usuario por ID"""
    try:
        user = User.query.get(user_id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)
        
        user_data = user.to_dict()
        return make_response(jsonify({"user": user_data}), 200)
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)
```

### Ejemplo 3: Servicio de Lógica de Negocio

```python
from typing import List, Optional, Dict, Any

class UserService:
    @staticmethod
    def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crea un nuevo usuario"""
        new_user = User(
            name=user_data["name"],
            email=user_data["email"]
        )
        new_user.save()
        return new_user.to_dict()
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Obtiene un usuario por email"""
        user = User.query.filter_by(email=email).first()
        return user.to_dict() if user else None
    
    @staticmethod
    def get_all_users() -> List[Dict[str, Any]]:
        """Obtiene todos los usuarios"""
        users = User.query.all()
        return [user.to_dict() for user in users]
```

## Herramientas de Verificación

### mypy

```bash
# Instalar
pip install mypy

# Verificar un archivo
mypy app.py

# Verificar todo el proyecto
mypy backend/

# Con config más estricta
mypy backend/ --strict
```

### Configuración para mypy

Crear archivo `mypy.ini`:

```ini
[mypy]
python_version = 3.9
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True

[mypy-sqlalchemy.*]
ignore_missing_imports = True
```

### Verificación en Desarrollo

```bash
# Docker
docker compose exec backend mypy portfolio_app/

# Local
mypy backend/portfolio_app/
```

## Mejores Prácticas

1. **Empieza Simple**: Añade type hints gradualmente, empezando por funciones críticas
2. **Usa Optional**: Para valores que pueden ser `None`
3. **Dict[str, Any]**: Para JSON objects cuando no conoces la estructura exacta
4. **Documenta Complejidad**: Si un tipo es complejo, usa comentarios
5. **Evita Over-engineering**: No hace falta tipar TODO, céntrate en APIs públicas
6. **Usa TypedDict**: Para estructuras más complejas de diccionarios

## Ejemplo TypedDict

```python
from typing import TypedDict, Optional

class UserDict(TypedDict):
    id: int
    name: str
    email: str
    age: Optional[int]

def get_user_data() -> UserDict:
    return {
        "id": 1,
        "name": "John",
        "email": "john@example.com",
        "age": 30
    }
```

## Recursos

- [Documentación oficial de typing](https://docs.python.org/3/library/typing.html)
- [mypy documentation](https://mypy.readthedocs.io/)
- [PEP 484 - Type Hints](https://www.python.org/dev/peps/pep-0484/)

## Aplicar en el Proyecto

Para aplicar type hints en el proyecto:

1. **Empieza con modelos**: `tbl_*.py`
2. **Luego recursos**: `resource_*.py`
3. **Finalmente servicios**: `*_service.py`
4. **Verifica con mypy**: `mypy backend/portfolio_app/`

