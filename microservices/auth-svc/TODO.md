# TODO - Implémentation Auth Service avec Prisma

## Fichiers à créer

- [ ] src/services/auth.service.js
  - [ ] register(email, password) - créer Account avec username généré
  - [ ] login(email, password) - vérifier credentials et générer JWT
  
- [ ] src/controllers/auth.controller.js
  - [ ] register() - HTTP 201, retourner email + role
  - [ ] login() - HTTP 200, retourner token
  - [ ] validate() - HTTP 200, vérifier req.user

- [ ] src/middlewares/auth.middleware.js
  - [ ] authenticate() - vérifier Bearer token, décoder, stocker dans req.user

- [ ] src/routes/auth.routes.js
  - [ ] POST /register
  - [ ] POST /login
  - [ ] GET /validate (avec middleware authenticate)

- [ ] src/index.js
  - [ ] Importer et enregistrer authRoutes
  - [ ] Tester connexion Prisma au démarrage

## Points clés Prisma
- Username est la clé primaire (pas d'UUID)
- Email doit être unique
- Vérifier par email ET username pour l'enregistrement
- Utiliser hashPassword et comparePassword de bcrypt.util
- Utiliser generateToken de jwt.util
- JWT payload: { email, role }

## Tests curl
- [ ] GET /api/health
- [ ] POST /api/auth/register (email + password)
- [ ] POST /api/auth/login (email + password)
- [ ] GET /api/auth/validate (Bearer token)
