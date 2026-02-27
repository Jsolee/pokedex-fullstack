Mini Pokédex Full-Stack (PokeAPI + Supabase)
Objetivo
Desarrollar una aplicación web desplegada en Vercel que consuma la PokeAPI:
y persista parte de la información en Supabase completo end-to-end:
(PostgreSQL), demostrando un flujo
UI → servidor → base de datos → despliegue
El objetivo de la prueba es evaluar la capacidad de estructurar un proyecto full-stack,
organizar el código y resolver un problema funcional de forma clara y mantenible.
Requisitos
1. Proyecto base y entrega
●
●
●
●
●
Repositorio público en GitHub (incluir enlace en la entrega).
Despliegue en Vercel conectado al repositorio.
Variables de entorno gestionadas correctamente (.env.local y .env.example).
README con instrucciones claras para ejecutar el proyecto en local.
Estilos responsive básicos.
2. Funcionalidad PokeAPI (Frontend)
Pantallas mínimas
2.1 Listado / búsqueda
●
Listado paginado de Pokémon (por ejemplo, 20 por página) o búsqueda por nombre.
●
Cada elemento debe mostrar:
○
Nombre
○
Enlace a la página de detalle
2.2 Detalle de Pokémon
Ruta tipo:
●
/pokemon/[name]
o
●
/pokemon/[id]
Debe mostrar como mínimo:
●
Nombre
●
Imagen
●
Tipos
●
Estadísticas principales (HP, ATK, DEF, etc.)
●
Abilities
Se valorará:
●
Gestión de estados de loading.
●
Estado vacío (empty).
●
Estado de error.
●
Interfaz clara y funcional, aunque sea sencilla.
3. Persistencia en Supabase (caché)
3.1 Tabla types
●
Crear una tabla en PostgreSQL para almacenar los tipos (por ejemplo, types).
●
Implementar una pantalla /types con el siguiente comportamiento:
○
Si la tabla está vacía:
■ Obtener los datos desde la PokeAPI.
■ Guardarlos en la base de datos mediante Prisma (upsert).
■ Mostrarlos en la interfaz.
○
Si la tabla ya contiene datos:
■ Leer desde la base de datos.
■ No volver a solicitar los datos a la PokeAPI.
3.2 Caché de detalle de Pokémon
Crear una tabla pokemon_cache con los siguientes campos:
●
name
●
payload (JSON)
●
updatedAt
Comportamiento esperado:
●
Si el Pokémon existe en la base de datos y el registro es reciente, se debe leer
desde la base de datos.
●
Si no existe o está desactualizado, se debe obtener desde la PokeAPI y actualizar el
registro.
Back / Base de datos
●
●
●
●
Prisma configurado correctamente con Supabase.
Schema de Prisma incluido en el repositorio.
Uso adecuado de Prisma para consultas y operaciones de upsert.
Estructura clara entre lógica de acceso a datos y lógica de presentación.
Calidad del código
●
●
●
●
Commits con sentido y progresivos.
Componentes organizados de forma coherente.
Código legible y estructurado.
Separación mínima de responsabilidades.
UX y accesibilidad
●
●
●
Diseño responsive básico.
Estados visuales claros (loading, error).
Accesibilidad básica (por ejemplo, atributos alt en imágenes, botones identificables,
estructura semántica).
Consideraciones
●
●
No es necesario implementar autenticación.
No es necesario un diseño visual avanzado.
●
No es necesario cubrir toda la PokeAPI.
●
No es necesaria una optimización extrema.
No se busca perfección técnica ni un producto final completamente pulido. Se valora
especialmente que la solución funcione, esté bien planteada y que el razonamiento técnico
sea claro.
Entrega
●
●
Enlace al repositorio GitHub con historial de commits razonable.
URL del despliegue en Vercel funcionando.