import sqlite3
from utils.db_utils import get_db
from datetime import datetime

def calcular_edad(fecha_nacimiento):
    if not fecha_nacimiento:
        return None
    hoy = datetime.now()
    nacimiento = datetime.strptime(fecha_nacimiento, '%Y-%m-%d')
    edad = hoy.year - nacimiento.year
    if (hoy.month, hoy.day) < (nacimiento.month, nacimiento.day):
        edad -= 1
    return edad

def get_all_active_empleados_service():
    """Obtiene todos los empleados activos de la base de datos."""
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT cedula, nombre, cargo, fecha_nacimiento, sexo, fecha_ingreso, telefono, correo FROM empleados WHERE estatus = 1 ORDER BY nombre ASC")
        empleados = cursor.fetchall()
        return [dict(row) for row in empleados]
    except sqlite3.Error as e:
        print(f"Error de base de datos en get_all_active_empleados_service: {e}")
        raise # Re-lanzar la excepción para que sea manejada por la ruta
    finally:
        conn.close()

def add_empleado_service(data):
    """Añade un nuevo empleado a la base de datos."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO empleados (
                cedula, nombre, cargo, fecha_nacimiento,
                sexo, fecha_ingreso, telefono, correo, estatus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            data['cedula'],
            data['nombre'],
            data['cargo'],
            data.get('fecha_nacimiento'),
            data.get('sexo'),
            data.get('fecha_ingreso'),
            data.get('telefono'),
            data.get('correo')
        ))
        conn.commit()
        # Obtener el empleado creado para retornarlo
        cursor.execute("SELECT * FROM empleados WHERE cedula = ?", (data['cedula'],))
        new_empleado = cursor.fetchone()
        return dict(new_empleado)
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"Error de integridad en add_empleado_service: {e}")
        raise ValueError("La Cédula o el Correo ya existen") # Lanzar error específico
    except sqlite3.Error as e:
        conn.rollback() 
        print(f"Error de base de datos en add_empleado_service: {e}")
        raise # Re-lanzar el error general de base de datos
    finally:
        conn.close()

def update_empleado_service(cedula, data):
    """Actualiza un empleado activo existente."""
    allowed_fields = ['nombre', 'cargo', 'fecha_nacimiento', 'sexo', 'fecha_ingreso', 'telefono', 'correo']
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_fields:
        raise ValueError("No se proporcionaron campos válidos para la actualización")

    set_clause = ", ".join([f"{key} = ?" for key in update_fields.keys()])
    values = list(update_fields.values())
    values.append(cedula)

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Verificar primero si el empleado existe y está activo
        cursor.execute("SELECT cedula FROM empleados WHERE cedula = ? AND estatus = 1", (cedula,))
        empleado = cursor.fetchone()
        if not empleado:
            return None # Indicar que el empleado no fue encontrado o está inactivo

        sql = f"UPDATE empleados SET {set_clause} WHERE cedula = ?"
        cursor.execute(sql, tuple(values))
        conn.commit()

        if cursor.rowcount == 0:
            # No debería suceder si el SELECT encontró al empleado
            return None # Indicar que la actualización falló inesperadamente
        
        # Obtener los datos actualizados
        cursor.execute("SELECT * FROM empleados WHERE cedula = ?", (cedula,))
        updated_empleado = cursor.fetchone()
        return dict(updated_empleado)
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"Error de integridad en update_empleado_service: {e}")
        raise ValueError("Falló la actualización, posible Correo duplicado") # Lanzar error específico
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Error de base de datos en update_empleado_service: {e}")
        raise
    finally:
        conn.close()

def delete_empleado_logico_service(cedula):
    """Elimina lógicamente un empleado estableciendo estatus a 0."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        # Verificar primero si el empleado existe y está activo
        cursor.execute("SELECT cedula FROM empleados WHERE cedula = ? AND estatus = 1", (cedula,))
        empleado = cursor.fetchone()
        if not empleado:
            return False # Indicar que el empleado no fue encontrado o ya está inactivo

        cursor.execute("UPDATE empleados SET estatus = 0 WHERE cedula = ?", (cedula,))
        conn.commit()

        return cursor.rowcount > 0 # Retornar True si la actualización fue exitosa
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Error de base de datos en delete_empleado_logico_service: {e}")
        raise
    finally:
        conn.close()
