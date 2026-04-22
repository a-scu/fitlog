# Personalización de Rutinas en FitLog

Este documento detalla todas las opciones personalizables disponibles al crear o editar una rutina en la aplicación.

## 1. Información General de la Rutina

- **Nombre de la rutina:** Texto libre para identificar la rutina (ej. "Empuje A", "Pierna Enfoque Cuádriceps").

## 2. Configuración de Series (Sets)

Cada serie de un ejercicio puede ser configurada de forma independiente con las siguientes opciones:

### Tipos de Serie

Define el propósito de la serie:

- **Efectiva:** Serie principal de trabajo.
- **Calentamiento:** Serie de baja intensidad para preparar los tejidos.
- **Aproximación:** Serie de intensidad media para preparar el sistema nervioso.
- **Personalizada (Custom):** Permite escribir un nombre propio para el tipo de serie.

### Métricas (Peso, Repeticiones y RIR)

Cada una de estas métricas (Peso, Repeticiones y RIR - Repeticiones en Recámara) admite dos modos de entrada:

- **Valor Fijo:** Un único número (ej. "80 kg", "10 reps", "RIR 2").
- **Rango (Min - Max):** Un intervalo de valores (ej. "80 - 85 kg", "8 - 12 reps", "RIR 0 - 2").

### Modificadores Especiales

#### Drop Sets (Series Descendentes)

Se pueden añadir múltiples drop sets a una serie principal. Cada drop set tiene su propia configuración de:

- Peso (Fijo o Rango).
- Repeticiones (Fijo o Rango).
- RIR (Fijo o Rango).
- Repeticiones Parciales.

#### Repeticiones Parciales (Partial Reps)

Configuración para realizar repeticiones con rango de movimiento incompleto:

- **Cantidad:** Fijo o Rango (ej. "5 parciales", "5 - 8 parciales", o "Fallo").
- **Rango de Movimiento (ROM):**
  - Final (Parte superior/acortamiento).
  - Inicial (Parte inferior/estiramiento).
  - Estiramiento (Enfoque en la fase excéntrica).
  - Personalizado (Texto libre para especificar el ROM).

#### Notas

- **Texto libre:** Espacio para anotaciones específicas de la serie (ej. "Enfocarse en la conexión mente-músculo", "Usar straps").

## 3. Descansos (Rests)

Los descansos son elementos independientes que pueden colocarse entre series o entre ejercicios:

- **Duración:** Configurable en segundos (ej. "60s", "90s", "120s").

## 4. Estructura de la Rutina

- **Orden de elementos:** Los ejercicios y descansos pueden ser organizados libremente.
- **Selección múltiple:** Posibilidad de seleccionar múltiples ejercicios desde la base de datos para añadirlos rápidamente con una configuración por defecto.

<!-- IDEAS -->

IDEAS GENERALES:

- Posibilidad de implementar un sistema mediante el cual se puedan crear 'personas' o 'usuarios', que funcionen como carpetas en las cuales se guardaran las rutinas, notas del usuario, y todo lo relacionado con dichas personas. (orientado a personal trainers que gestionan a multiples personas)

- Calcular RM teorico del usuario a partir de un top set (no se como se implementaria)

IDEAS RUTINAS:

- Boton para convertir rutina en semana de descarga (-30/-50% peso/volumen de la rutina)

- Slider para aumentar o disminuir el peso/volumen de toda la rutina (porcentaje)

- Opcion para tomar de plantilla rutinas creadas anteriormente

- Notas de la rutina (devolucion del usuario, sensaciones, dolor, etc.)

IDEAS SETS:

- Tipos de sets : efectiva | calentamiento | aproximacion | top set | recuperacion (back off set) | superset

- Posibilidad de agregar tiempos de descanso entre dropsets (para simular rest pause/ myo reps)

- Boton rapido para hacer que la serie sea al fallo (rir y repes desactivadas)

- Velocidad de repeticiones (explosiva, lenta, normal)

- Repeticiones con ayuda (si / no) (tambien aplica para parciales) (supongo que seria un switch si/no)
