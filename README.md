# 🏋️ Fitlog

Aplicación móvil de planificación y gestión de entrenamientos, orientada tanto a atletas individuales como a personal trainers que gestionan múltiples clientes.

---

## Flujo de la aplicación

```
Home
├── Rutinas individuales        → Ver rutina → Editar rutina
│                                              └── Agregar ejercicios
│                                              └── Configurar sets
│                                              └── Agregar descansos
│
└── Perfiles ──────────────────→ Lista de perfiles
      └── Perfil               → Planes semanales + Notas
            └── Plan semanal   → 7 días (Lun–Dom)
                  └── Día      → Asignar rutina del pool
                                └── Título y descripción del día
                                └── Marcar como día de descanso
```

---

## Funcionalidades

### 🏠 Home

- Lista de todas las rutinas individuales del usuario.
- Acceso rápido a la sección de Perfiles.
- Botón para crear una rutina nueva directamente.

---

### 📋 Rutinas individuales

Las rutinas forman el bloque de construcción base. Pueden usarse de forma independiente o asignarse a días dentro de un plan semanal.

#### Información general
- **Nombre de la rutina** — texto libre editable.

#### Sets (Series)

Cada set de un ejercicio es configurable de forma independiente:

##### Tipo de set
| Tipo | Descripción |
|---|---|
| Efectiva | Serie principal de trabajo |
| Calentamiento | Baja intensidad, preparación de tejidos |
| Aproximación | Intensidad media, preparación del sistema nervioso |
| Custom | Nombre libre definido por el usuario |

##### Métricas (Peso / Repeticiones / RIR)

Cada métrica soporta dos modos:
- **Valor fijo** — un único número (ej. `80 kg`, `10 reps`, `RIR 2`)
- **Rango** — mínimo y máximo (ej. `80–85 kg`, `8–12 reps`, `RIR 0–2`)

##### Drop Sets (Series descendentes)
- Se pueden añadir múltiples drop sets a un set principal.
- Cada drop set tiene su propia configuración de Peso, Reps, RIR y Repeticiones Parciales.
- **Descanso entre drop sets** — duración configurable en segundos (para técnicas como rest-pause y myo-reps).

##### Repeticiones Parciales
- Cantidad: valor fijo, rango, o "Fallo".
- Rango de Movimiento (ROM):
  - Final (parte superior / acortamiento)
  - Inicial (parte inferior / estiramiento)
  - Estiramiento (fase excéntrica)
  - Personalizado (texto libre)

##### Notas por set
- Texto libre para anotaciones específicas (ej. "Usar straps", "Enfocarse en la bajada").

#### Descansos
- Se insertan entre sets o entre ejercicios.
- Duración configurable en segundos.

#### Opciones de visualización
- **Modo Avanzado** — muestra todas las métricas y opciones adicionales.
- **Unidad de peso** — toggle entre `kg` y `lbs`.

---

### 👤 Perfiles

El sistema de perfiles permite organizar personas con sus propias rutinas, planes y notas. Está orientado principalmente a personal trainers, aunque cualquier usuario puede crear perfiles.

- Cada perfil tiene un **avatar** con iniciales y color asignado automáticamente.
- Un perfil puede tener **múltiples planes semanales** (ej. "Mes de fuerza", "Semana de descarga").
- Los perfiles importados de otro usuario se marcan con el badge **COMPARTIDO**.

#### Roles contextuales
El rol de un usuario no es global — aplica solo dentro de un perfil compartido:
- **Owner** — creador del perfil, puede editarlo libremente.
- **Cliente** — recibió el perfil compartido, ve y actúa según los permisos otorgados.

---

### 📅 Planes semanales

Un plan semanal organiza 7 días fijos (Lunes a Domingo), asignando una rutina a cada día.

- Cada día puede:
  - Tener una **rutina asignada** del pool global de rutinas.
  - Tener un **título libre** (ej. "Push Day", "Piernas", "Cardio").
  - Tener una **descripción/notas** del día.
  - Marcarse como **día de descanso**.
- Un día puede tener rutina nueva creada desde ahí mismo, o puede reutilizar una rutina existente.
- Al asignar una rutina, se navega directamente al editor si se crea una nueva.

---

### 📝 Notas del perfil

Cada perfil tiene un diario de notas:
- Texto libre con fecha de creación.
- Preparado para diferenciación por rol (owner / cliente).
- El entrenador puede configurar si el cliente puede agregar notas o solo leerlas.

---

### 🔗 Compartir perfiles (base implementada)

El sistema de compartir permite que un entrenador comparta el perfil de un cliente:

1. El entrenador genera un archivo **JSON de exportación** con el perfil completo.
2. Lo comparte por WhatsApp u otro medio.
3. El cliente lo importa en la app → ve una pantalla de **aceptar/rechazar invitación**.
4. Si acepta, el perfil se guarda como "Perfil Compartido" con su rol y permisos.

#### Permisos configurables:
- `canEditWorkouts` — el cliente puede editar los ejercicios del plan.
- `canAddNotes` — el cliente puede agregar notas al diario.

> **Nota:** La base está implementada client-side. La sincronización en tiempo real (Firebase/Supabase) se sumará cuando se elija una base de datos.

---

## Modelo de datos

```
Pool global de Rutinas
  └── Routine { id, name, steps[], createdAt }
        └── Step = Set | Rest
              Set { weight, reps, rir, type, dropSets[], partialReps, notes }
              Rest { duration }

Pool global de Perfiles
  └── Profile { id, name, avatarColor, weeklyPlans[], notes[], shareConfig?, myRole? }
        └── WeeklyPlan { id, name, days[7], createdAt }
              └── WorkoutDay { dayIndex, title, description, isRestDay, routineId }
```

---

## Ideas y roadmap

### Rutinas
- [ ] Boton para convertir rutina en semana de descarga (−30/−50% peso/volumen)
- [ ] Slider para aumentar/disminuir el peso o volumen de toda la rutina (porcentaje)
- [ ] Opción para usar rutinas existentes como plantilla
- [ ] Notas de la rutina (sensaciones, dolor, devolución del usuario)
- [ ] Calcular RM teórico a partir de un top set

### Sets
- [ ] Tipos adicionales: Top Set, Recuperación (Back Off Set), Superset
- [ ] Botón rápido para marcar una serie "al fallo" (RIR y reps desactivadas)
- [ ] Velocidad de repeticiones (explosiva, lenta, normal)
- [ ] Repeticiones con ayuda (asistidas) — switch sí/no, también para parciales

### Perfiles y compartir
- [ ] Sincronización en tiempo real (Firebase / Supabase)
- [ ] Notificaciones de cambios en planes compartidos
- [ ] Pantalla completa de invitación con aceptar/rechazar
- [ ] Historial de cambios por rol

### General
- [ ] Modo oscuro
- [ ] Temporizador de descanso integrado al iniciar una rutina
- [ ] Historial de entrenamientos completados

---

MODO ULTRA HIPER AVANZADO MANTECA 1000% EXTREMO KICK BUTOWSKI CON TODAS LAS OPCIONES
