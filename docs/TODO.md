# TODO

- Hacer mobile friendly la app del paciente
- Cachear http request del dashboard
- Reset password (hoy es manual; mientras no exista, los pacientes se quedan
  con la password inicial que les asigna el alta, ver PRODUCCION)

PRODUCCION (antes de mandar la encuesta):
- [URGENTE] Definir DEFAULT_PATIENT_PASSWORD en Render. El alta de pacientes de
  la app del medico (sos/src/Patient/Handler.tsx:17) no envia password, asi que
  sin esa variable el alta falla. Usar un valor distinto al que estaba
  hardcodeado, porque ese quedo en el historial del repo (que es publico).
- Verificar que JWT_SECRET en Render no sea el valor de desarrollo ('sos').
- Verificar que el deploy tomo el codigo nuevo de las rutas /user. No se puede
  comprobar desde afuera sin token, porque el middleware auth responde antes
  que la ruta: hay que loguearse y pegarle a GET /user, que ahora no existe
  (404) en vez de devolver el listado.
- Base efimera: el free tier de Render restaura el disco desde el repo en cada
  deploy, asi que todo lo que carguen los medicos se pierde con el proximo
  push a main. Congelar los pushes a main mientras dure la encuesta.
- Seed de los usuarios de los medicos de la encuesta, commiteado en
  prisma/dev.db (es la unica via que sobrevive un redeploy). Molde:
  prisma/seed.mjs, pero ojo que arranca con cleanDB().

DEUDA TECNICA (backend):
- La cookie donde la app del medico guarda el JWT no tiene HttpOnly, y se lee
  con document.cookie (sos/src/http/index.ts:11). Arreglarlo implica que el
  backend emita la cookie con Set-Cookie, ajustar CORS con credenciales y
  cambiar el manejo del token en las dos apps frontend. Se dejo afuera a
  proposito antes de la encuesta: si sale mal, el sintoma es que los medicos
  no pueden entrar. Encararlo despues del beta testing y probarlo end-to-end.
- repos/user.ts instancia su propio PrismaClient en lugar de usar el singleton
  de config/db, como hacen los demas repos. Son dos pools de conexiones.
- controllers/user.ts getAll quedo sin ruta (devolvia todos los usuarios a
  cualquier autenticado). Ya tiene el select seguro aplicado; cuando exista el
  rol de administrador, montarlo detras de un control de rol.
- controllers/auth.ts login() desestructura role del body y no lo usa.
- src/routes/v1/admin.ts y controllers/admin.ts estan enteros comentados.

INFORME:
- [PENDIENTE - PROXIMO PASO] Capturas de todas las pantallas de las apps (medico y paciente) + descripcion de cada una.
  Plan: levantar las 3 apps localmente con el seed y capturar con Puppeteer (o manualmente).
  Pantallas: Login, Dashboard, Pacientes, Detalle/EMR, Turnos, Nuevo turno, Horarios, Perfil, Videollamada (ambas apps)
- Hacer entrevistas a medicos (y entrevista formal a Marco Zani)
- ESCENARIOS: serian los casos de usos. EJ: el senior X quiere hacer una consulta pediatrica. Explicar como se resolveria en el sistema
- Conclusiones: tabla comparativa SOS vs plataformas de Antecedentes
- Parrafo final de la Introduccion (al final de todo)
- Mencionar los arreglos de seguridad del backend (PR #3 y #4) donde corresponda:
  el doble hasheo y el control de acceso de /user son ejemplos concretos de
  hallazgos del testing, y la password inicial hardcodeada conecta con la
  seccion de Trabajo a Futuro sobre reset de password.

HECHO:
- [x] Evaluacion personal en los antecedentes (limitaciones, viabilidad solidaria)
- [x] TESTING: pruebas de aceptacion documentadas (CA-01 a CA-24)
- [x] Tests unitarios en las 3 apps (commit dcb2e04)
- [x] Textos Fase 1: Prisma/SQLite, Render, emails, testing real
- [x] Seccion Trabajo a Futuro redactada
- [x] Diagrama de arquitectura: docs/arquitectura.png (fuente: docs/arquitectura.mmd)
- [x] Fix del doble hasheo de password en el registro de medicos (PR #3). El
      registro via POST /auth/register creaba medicos que no podian loguear.
- [x] Endurecimiento de las rutas /user (PR #4): control de identidad
      (requireSelf), se quito el listado que exponia los hashes, se hashea la
      password en el update, se bloqueo el cambio de rol (un paciente podia
      promoverse a medico), se arreglo la baja (fallaba con P2003 sin borrar
      nada y respondia dos veces) y la password inicial de pacientes salio del
      codigo al entorno. Tests del backend: de 9 a 23 casos.
