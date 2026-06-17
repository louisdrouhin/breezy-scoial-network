# Audit d'Architecture - Breezy

**Date:** 2026-06-17  
**Branche:** api/posts  
**État:** Répertoire de travail propre

---

## Résumé Exécutif

Le projet est **partiellement aligné** avec l'architecture cible :

✅ **Bon** : monorepo pnpm déjà configuré ; structure des dossiers microservices existante ; scaffolding de base `package.json` en place  
⚠️ **À corriger** : les services manquent de structure interne (pas de controllers, routes, middlewares, models, services) ; Dockerfile et docker-compose manquants ; pas de nginx ; configuration des ports incohérente ; fichiers `.env` des services non standardisés

---

## Audit Détaillé

### 1. Configuration du Monorepo & Workspace

#### État actuel
- ✅ `pnpm-workspace.yaml` existe à la racine, déclare correctement :
  ```yaml
  packages:
    - 'microservices/*'
    - 'gateway'
    - 'front'
  ```
- ✅ Root `package.json` définit des scripts de dev utiles :
  - `pnpm dev` — lance tous les services en parallèle
  - `pnpm dev:<service>` — lance un service individuellement
  - `pnpm docker:up` — déclenche docker compose (mais docker-compose.yml n'existe pas encore)

#### Problèmes
- Pas de `pnpm-lock.yaml` global à la racine (fichiers lock par service fragmentent le contrôle de version)
- Root `package.json` a des dépendances minimales (juste `dotenv@^17.4.2`)

#### À faire
- S'assurer que tous les services s'installent à partir du lockfile root une fois docker-compose configuré

---

### 2. Structure des Microservices

#### État actuel

Les 4 services existent sous `microservices/` avec les noms attendus :
- `auth-svc` (port 3002 selon le .env du service)
- `user-svc` (port 3003)
- `post-svc` (port 3004)
- `notif-svc` (port 3005)
- **Manquant** : `feed-svc` (port 3005 selon l'archi, pas encore créé)

Chaque service a :
- `package.json` — déclare correctement `type: "module"` (ES modules)
- `.env` — présent seulement dans auth-svc ; manquant dans user-svc, post-svc, notif-svc
- `pnpm-lock.yaml` — individuel par service (non partagé)
- `tsconfig.json` — présent mais probablement inutilisé (fichiers .js, pas TypeScript)
- `src/index.js` — point d'entrée unique (minimal/vide dans la plupart des services)
- `node_modules/` — installé, prêt à fonctionner

#### Structure Interne Manquante

**Aucun des services n'a la structure cible :**
```
<service>/src/
├── config/          ❌ Manquant
├── controllers/     ❌ Manquant
├── middlewares/     ❌ Manquant
├── models/          ❌ Manquant
├── routes/          ❌ Manquant
├── services/        ❌ Manquant
└── utils/           ❌ Manquant
```

#### Analyse du Package.json

**Dépendances (tous les services) :**
| Paquet | Version | État |
|--------|---------|------|
| `express` | `^5.2.1` | ✅ Cohérent partout |
| `@prisma/client` | `~6.19.3` | ✅ Cohérent dans microservices |
| `prisma` (dev) | `~6.19.3` | ✅ Cohérent dans microservices |
| `dotenv` | `^17.4.2` | ✅ Cohérent (auth-svc: présent; user/post/notif: manquant) |
| `@types/node` | **Incohérent** | ⚠️ auth-svc: `^20.19.41`; user/post/notif: `^25.9.2` |

**Analyse des Scripts :**

Tous les services utilisent `"dev": "node --watch src/index.js"` — ✅ cohérent.  
⚠️ Script `start` manquant pour la production : pas de champ `"start"` défini.

**Problèmes :**
1. Pas de script `start` pour les déploiements en production
2. Mismatch de version `@types/node` (auth-svc utilise v20, les autres v25)
3. `dotenv` non déclaré dans user/post/notif-svc (seulement dans auth-svc)
4. `gateway` manque `dotenv` et `@types/node`

#### Auth-svc Spécifique

- Possède un fichier `.env` avec URL base de données, secrets JWT, et port (3001, mais `.env` root dit 3002 pour AUTH_SVC_PORT — **conflit**)
- Possède un `.gitignore` (inhabituel pour services individuels en monorepo)
- Possède `node_modules` et `pnpm-lock.yaml` (typique par service)

---

### 3. Gateway

#### État actuel
- ✅ Dossier existe à `gateway/`
- ✅ `package.json` configuré
- ✅ Minimal `src/index.js` (vide)
- ✅ `pnpm-lock.yaml` pour les dépendances

#### Problèmes
- ❌ Pas de fichier `.env`
- ❌ Pas de configuration pour les ports ou validation auth_request
- ❌ Pas de nginx (utilise actuellement Express ; la cible est Nginx comme reverse proxy)
- ❌ Dépendance dotenv manquante
- ❌ `@types/node` manquant

---

### 4. Frontend

#### État actuel
- ✅ Dossier existe à `front/`
- ✅ Utilise Next.js 16.2.7 (App Router moderne)
- ✅ Tailwind CSS configuré
- ✅ React 19.2.4 + react-dom
- ✅ Bon `package.json` avec scripts dev/build/start
- ✅ Dossier `.next/` (sortie de compilation)

#### Problèmes
- ⚠️ Dépendances indépendantes des services backend (pas de packages partagés)
- Pas de fichier `.env` pour la configuration de l'URL API gateway

---

### 5. Conteneurisation (Docker & Docker Compose)

#### État actuel
- ❌ **Pas de Dockerfile dans aucun service**
- ❌ **Pas de Dockerfile dans gateway**
- ❌ **Pas de docker-compose.yml à la racine**
- ❌ **Pas de nginx.conf**

#### À faire
- Créer `Dockerfile` dans chaque microservice (base node:24-alpine)
- Créer `gateway/Dockerfile` (ou utiliser image Docker nginx)
- Créer `docker-compose.yml` à la racine avec :
  - 5 conteneurs microservices (auth-svc, user-svc, post-svc, notif-svc, + feed-svc manquant)
  - 5 conteneurs PostgreSQL (un par service)
  - Conteneur reverse proxy Nginx
  - Conteneur frontend Next.js
  - Réseau bridge partagé (`app-network`)
- Créer `nginx.conf` avec :
  - Routes publiques : `/login`, `/register` (pass-through)
  - Routes protégées : toutes les autres (exigent JWT via `auth_request`)
  - Injection de header : `X-User-Id` depuis la réponse auth

---

### 6. Configuration de l'Environnement

#### État actuel

**Root `.env` :**
```
FRONT_PORT=3000
GATEWAY_PORT=3001
AUTH_SVC_PORT=3002
USER_SVC_PORT=3003
POST_SVC_PORT=3004
NOTIF_SVC_PORT=3005
```

**auth-svc/.env :**
```
DATABASE_URL="postgresql://louisdrouhin@localhost:5432/auth_svc?schema=public"
JWT_SECRET="change_me_in_production"
JWT_EXPIRY="15m"
PORT=3001  ❌ Conflicte avec root (root dit 3002)
```

#### Problèmes
1. **Conflit de ports** : root `.env` dit `AUTH_SVC_PORT=3002`, mais `auth-svc/.env` dit `PORT=3001`
2. **Nom d'utilisateur codé en dur** : `louisdrouhin` dans URLs base de données (non portable)
3. **`.env` manquant dans autres services** : user-svc, post-svc, notif-svc n'ont pas de `.env`
4. **Pas de `.env.example`** : pas de template pour les développeurs

#### À faire
- Standardiser le mapping des ports (décider : utiliser root `.env` comme source unique de vérité)
- Créer `.env` pour tous les microservices avec :
  - DATABASE_URL (chaîne de connexion PostgreSQL)
  - PORT (port du service)
  - Secrets spécifiques au service (JWT_SECRET, etc.)
- Créer `.env.example` pour chaque service (référence git-tracked)
- Utiliser des noms d'utilisateur indépendants de l'environnement dans les URLs BD (ex: `postgres`)

---

### 7. Base de Données (Prisma)

#### État actuel
- ❌ **Pas de fichiers Prisma schema** (`prisma/schema.prisma`) trouvés dans aucun service
- ✅ `@prisma/client` et `prisma` sont déjà dans les dépendances
- ✅ Fichiers `.env` référencent `DATABASE_URL` (convention Prisma)

#### À faire
- Créer `prisma/schema.prisma` dans chaque service avec modèles domaine-spécifiques :
  - **auth-svc** : User (credentials, JWT info)
  - **user-svc** : UserProfile (bio, avatar, relations follow)
  - **post-svc** : Post, Like, Comment, Tag models
  - **notif-svc** : Notification model
  - **feed-svc** : (si implémenté) pourrait utiliser vues sur données d'autres services

---

### 8. Structure du Code & Complétude

#### État actuel
- ✅ Services ont des points d'entrée `src/index.js` (mostly empty/minimal)
- ❌ Pas de handlers de routes définis
- ❌ Pas de controllers définis
- ❌ Pas de models définis
- ❌ Pas de setup middleware

#### Notes
- C'est acceptable pour la Phase 1 (audit seulement) ; Phase 2 ne devrait pas créer de nouvelle logique métier, juste réorganiser le code existant s'il existe.

---

### 9. Configuration Git

#### État actuel
- ✅ `.gitignore` à la racine (exhaustif, couvre Node/Next/IDEs)
- ⚠️ Ligne inutilisée à la fin : `Expliquer` (typo ou artifact ?)
- ⚠️ `auth-svc/.gitignore` existe (redondant en monorepo ; devrait hériter de root)
- ✅ `.env` est gitignored (section `local env files`)
- ✅ `.DS_Store` est gitignored (MacOS clutter)
- ✅ Fichiers générés Prisma ne sont pas explicitement ignorés ; besoin d'ajouter `.prisma/` et `prisma/migrations/`

---

## Tableau Récapitulatif : Ce qui Existe vs. Ce qui Manque

| Composant | Existe | État | Notes |
|-----------|--------|------|-------|
| **pnpm-workspace.yaml** | ✅ | Prêt | Structure correcte |
| **Root package.json** | ✅ | À mettre à jour | Dépendances partagées manquantes, scripts incomplets |
| **Microservices (4/5)** | ✅ | Partiel | feed-svc manquant ; scaffolding basique seulement |
| **Structure interne services** | ❌ | Manquant | Pas de controllers, routes, models, etc. |
| **Dockerfile** | ❌ | Manquant | Nécessaire pour tous les 6 services (+ gateway) |
| **docker-compose.yml** | ❌ | Manquant | Critique pour orchestration |
| **nginx.conf** | ❌ | Manquant | Nécessaire pour reverse proxy & auth_request |
| **Fichiers .env services** | ⚠️ | Partiel | Seulement auth-svc en a un ; autres manquants |
| **Schémas base de données** | ❌ | Manquant | Pas de `prisma/schema.prisma` dans aucun service |
| **Frontend** | ✅ | Bon | Next.js 14+ fonctionne ; pas de config backend |
| **Gateway** | ⚠️ | Squelette | App Express mais pas de logique routing |

---

## Ordre Recommandé Phase 2

1. **Standardiser les fichiers `.env`** — s'assurer que tous les services ont des ensembles cohérents de variables avec ports corrects
2. **Créer `Dockerfile` pour chaque service** — base node:24-alpine, patterns Node.js standards
3. **Créer `docker-compose.yml`** — déclarer tous les services, instances PostgreSQL, nginx, frontend
4. **Créer `nginx.conf`** — implémenter logique auth_request et injection de headers
5. **Réorganiser services internals** — déplacer/créer dossiers controllers, routes, models, middlewares, services, utils (seulement si code existe; pas de dossiers vides)
6. **Harmoniser scripts `package.json`** — s'assurer que tous les services ont `dev`, `start`, `seed` (si besoin)
7. **Ajouter schémas Prisma** — si structure base de données est déjà conçue, intégrer ; sinon différer
8. **Créer fichiers `.env.example`** — templates git-tracked pour les développeurs

---

## Blocages & Questions pour l'Utilisateur

1. **feed-svc** : Devrait-il être créé maintenant (Phase 2), ou est-ce une priorité plus basse ?
2. **Conflit de ports** : `AUTH_SVC_PORT` devrait être 3001 ou 3002 ? (Root `.env` dit 3002, service `.env` dit 3001)
3. **Nom d'utilisateur base de données** : Les services devraient-ils utiliser `postgres` ou un utilisateur dédié ? (Actuellement codé en dur comme `louisdrouhin`)
4. **Prisma vs. Sequelize** : Le doc architecture mentionne Sequelize ORM, mais le projet utilise Prisma. Continuer avec Prisma ?
5. **nginx ou Express Gateway ?** L'archi cible dit Nginx, mais la gateway actuelle est Express. Basculer vers Nginx ou améliorer la gateway Express ?
6. **Configuration API Frontend** : D'où devrait provenir l'URL de base API du frontend (var env, hardcodée, etc.) ?

---

## Fichiers à Supprimer/Archiver

Pendant Phase 2, considérer :
- `auth-svc/.gitignore` (hériter de root)
- Fichiers `.DS_Store` (ajouter au .gitignore global s'il n'est pas déjà dedans)
- `pnpm-lock.yaml` individuels dans les services (utiliser un seul lock à la racine ; cela demande `pnpm install` depuis root)

---

## Prochaines Étapes

En attente de la validation de l'utilisateur avant le début de la Phase 2. Cet audit est en lecture seule ; aucun code n'a été modifié.
