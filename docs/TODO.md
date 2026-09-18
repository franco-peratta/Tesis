# TODO

Lista única de pendientes del proyecto: código, producción e informe. Antes
estaba partida entre este archivo y una sección al final de `docs/informe.md`;
se unificó acá para no tener dos listas que se contradigan.

---

## PRODUCCIÓN — antes de mandar la encuesta

- [ ] **[URGENTE]** Definir `DEFAULT_PATIENT_PASSWORD` en Render. El alta de
      pacientes de la app del médico (`sos/src/Patient/Handler.tsx:17`) no envía
      password, así que sin esa variable el alta falla. Usar un valor distinto
      al que estaba hardcodeado, porque ese quedó en el historial del repo (que
      es público).
- [ ] Verificar que `JWT_SECRET` en Render no sea el valor de desarrollo (`'sos'`).
- [ ] Verificar que el deploy tomó el código nuevo de las rutas `/user`. No se
      puede comprobar desde afuera sin token, porque el middleware `auth`
      responde antes que la ruta: hay que loguearse y pegarle a `GET /user`, que
      ahora no existe (404) en vez de devolver el listado.
- [ ] **Congelar los pushes a `main` mientras dure la encuesta.** El free tier de
      Render restaura el disco desde el repo en cada deploy, así que todo lo que
      carguen los médicos se pierde con el próximo push.

---

## ENCUESTA

- [ ] Seed de los usuarios de los médicos, commiteado en `prisma/dev.db` (es la
      única vía que sobrevive un redeploy). Molde: `prisma/seed.mjs`, pero ojo
      que arranca con `cleanDB()`.
- [ ] Reemplazar los resultados ficticios de la sección "Resultados de la
      Encuesta" del informe por las respuestas reales de los médicos.
- [ ] Ídem con el borrador ficticio de la entrevista a Marco Zani.

---

## APPS

- [ ] Hacer mobile friendly la app del paciente
- [ ] Cachear los http request del dashboard
- [ ] Reset password. Hoy es manual, y mientras no exista los pacientes se
      quedan con la password inicial que les asigna el alta.

---

## DEUDA TÉCNICA — backend

- [ ] La cookie donde la app del médico guarda el JWT no tiene `HttpOnly`, y se
      lee con `document.cookie` (`sos/src/http/index.ts:11`). Arreglarlo implica
      que el backend emita la cookie con `Set-Cookie`, ajustar CORS con
      credenciales y cambiar el manejo del token en las dos apps frontend. Se
      dejó afuera a propósito antes de la encuesta: si sale mal, el síntoma es
      que los médicos no pueden entrar. Encararlo después del beta testing y
      probarlo end-to-end.
- [ ] `repos/user.ts` instancia su propio `PrismaClient` en lugar de usar el
      singleton de `config/db`, como hacen los demás repos. Son dos pools de
      conexiones.
- [ ] `controllers/user.ts` `getAll` quedó sin ruta (devolvía todos los usuarios
      a cualquier autenticado). Ya tiene el `select` seguro aplicado; cuando
      exista el rol de administrador, montarlo detrás de un control de rol.
- [ ] `controllers/auth.ts` `login()` desestructura `role` del body y no lo usa.
- [ ] `src/routes/v1/admin.ts` y `controllers/admin.ts` están enteros comentados.

---

## INFORME

### Contenido visual (comentarios del tutor)

- [ ] Insertar la IMAGEN del diagrama de arquitectura en el Google Doc (archivo
      listo en `docs/arquitectura.png`; en el `.md` ya está referenciada).
- [ ] **[PRÓXIMO PASO]** Capturas de pantalla de todas las pantallas de las apps
      (médico y paciente) y describir para qué sirve cada una.
      Plan: levantar las 3 apps localmente con el seed y capturar con Puppeteer
      (o manualmente).
      Pantallas: Login, Dashboard, Pacientes, Detalle/EMR, Turnos, Nuevo turno,
      Horarios, Perfil, Videollamada (ambas apps).

### Dependen de terceros (tienen demora, arrancar ya)

- [ ] Reunión con Marco Zani: realizar entrevista formal documentada y ampliar
      la sección.
- [ ] Reuniones con médicos: recopilar los testimonios enviados por WhatsApp y
      enriquecer la sección con citas textuales.

### Redacción

- [ ] Mencionar los arreglos de seguridad del backend (PR #3 y #4) donde
      corresponda: el doble hasheo y el control de acceso de `/user` son
      ejemplos concretos de hallazgos del testing, y la password inicial
      hardcodeada conecta con la sección de Trabajo a Futuro sobre reset de
      password.

### Cierre

- [ ] Introducción: escribir el párrafo final que adelanta el resto del informe
      (dejar para lo último).
- [ ] Revisión general: ortografía, numeración de figuras, formato, consistencia
      de términos.

---

## HECHO

### Código

- [x] Tests unitarios en las 3 apps (commit `dcb2e04`)
- [x] Fix del doble hasheo de password en el registro de médicos (PR #3). El
      registro vía `POST /auth/register` creaba médicos que no podían loguear.
- [x] Endurecimiento de las rutas `/user` (PR #4): control de identidad
      (`requireSelf`), se quitó el listado que exponía los hashes, se hashea la
      password en el update, se bloqueó el cambio de rol (un paciente podía
      promoverse a médico), se arregló la baja (fallaba con P2003 sin borrar
      nada y respondía dos veces) y la password inicial de pacientes salió del
      código al entorno. Tests del backend: de 9 a 23 casos.

### Informe — consistencia informe ↔ código

- [x] Actualizar sección de base de datos: Prisma ORM + SQLite (reemplaza MySQL
      + PlanetScale), con el porqué de la migración
- [x] Actualizar sección de Hosting: Vercel (frontends) + Render (REST API)
- [x] Agregar subsección sobre el módulo de notificaciones por email
      (Nodemailer + Gmail + templates HTML)
- [x] Actualizar sección de Testing con los tests reales implementados
      (Jest + Supertest, Vitest + Testing Library)

### Informe — redacción

- [x] Escenarios de uso concretos paso a paso (sección "Escenarios de uso":
      paciente rural, consulta pediátrica con seguimiento, incorporación de
      médica voluntaria)
- [x] Conclusiones: comparación con las otras soluciones del mercado (tabla
      comparativa + tres observaciones centrales)
- [x] Trabajo a Futuro: redactar sección completa
- [x] Referencias completas y organizadas por categoría (plataformas,
      tecnologías, hosting, marco normativo) — links de leyes y PlanetScale
      verificados
- [x] Antecedentes — E-Consulta, DOC24, Teleconsultas BA, UMA: descripciones
      completas
- [x] Antecedentes: links, costos y evaluación personal de cada plataforma
      (limitaciones, viabilidad solidaria)
- [x] Testing: casos de prueba de aceptación documentados (CA-01 a CA-24)
- [x] Diagrama de arquitectura: `docs/arquitectura.png` (fuente:
      `docs/arquitectura.mmd`)
