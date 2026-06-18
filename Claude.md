# CLAUDE.md — Breezy Social Network

Ce fichier cadre toutes les instances de Claude (Claude Code, Claude.ai, etc.)
qui interviennent sur ce monorepo, peu importe le membre de l'équipe qui
travaille. Chaque service peut avoir son propre `CLAUDE.md` plus spécifique
(c'est déjà le cas de `front/CLAUDE.md`) — en cas de conflit, le fichier le
plus proche du code modifié l'emporte sur celui-ci, mais ce fichier reste la
référence pour tout ce qui est transverse (architecture, conventions, choix
techniques validés en équipe).

**Avant toute modification structurelle (nouveau service, changement de
schéma de données, changement de port, etc.), relis ce fichier en entier.**

---

## 1. Contexte du projet

Breezy est un réseau social (façon Twitter/X) développé dans le cadre du
module "Développement d'applications distribuées" (PGE A3 FISA INFO, CESI).
Le projet est noté sur un rapport + une soutenance, donc la documentation et
la justification des choix d'architecture comptent autant que le code qui
tourne.

Fonctionnalités cœur attendues (cf. cahier des charges, non exhaustif) :

- Inscription / authentification (JWT)
- Publication de posts (280 caractères max)
- Commentaires et réponses à l'infini (un commentaire EST un post)
- Likes
- Follow / unfollow entre utilisateurs
- Fil d'actualité chronologique des comptes suivis
- Notifications (mention, like, nouveau follower, commentaire)
- Profil utilisateur (bio, avatar, bannière)
- Recherche (par tags notamment)

**Toujours vérifier le scope réel des fonctionnalités dans le sujet avant
d'ajouter une feature "parce que c'est dans un réseau social classique" —
on a déjà retiré plusieurs Fx du scope initial (suspension, médias riches,
signalement, préférences de langue/thème) pour rester réaliste sur la
charge de travail. Si une instance Claude pense qu'une fonctionnalité
manque, elle doit demander avant de l'ajouter, pas l'implémenter par
anticipation.**

---

## 2. Architecture générale

Architecture en microservices, chaque service ayant sa propre base de
données (pattern _database per service_, sauf `feed-svc`, voir plus bas).
Pas d'API Gateway codée à la main : on utilise **Nginx comme reverse
proxy pur**, configuré via `gateway/nginx.conf`. Aucun service Node.js
custom ne doit exister dans `gateway/` — si du code Node.js y est trouvé,
c'est un résidu à migrer vers une config Nginx, pas une architecture
alternative à maintenir.

```
client (navigateur)
        │
        ▼
   Nginx (reverse proxy)   (point d'entrée unique, vérifie le JWT)
        │
   ┌────┼─────────┬─────────────┬─────────────┐
   ▼    ▼         ▼             ▼             ▼
auth-svc user-svc post-svc  notif-svc     feed-svc
   │       │         │             │             │
PostgreSQL PostgreSQL MongoDB   MongoDB      (aucune DB)
```

`feed-svc` existe comme service à part entière mais **sans base de
données**. Le feed est calculé **à la volée** (fan-out on read) : à
chaque consultation du fil d'actualité, `feed-svc` interroge `user-svc`
(liste des comptes suivis) puis `post-svc` (posts de ces comptes), trie
par date et renvoie. Ce choix est documenté comme axe d'amélioration
potentiel dans le rapport (migration vers fan-out on write si la charge
en lecture devient un problème). **Ne pas créer de base de données pour
un feed matérialisé sans discussion préalable avec l'équipe.**

### Règle de cohérence inter-services : le `username`

Le `username` est la clé de cohérence partagée entre tous les services.
Règles strictes à respecter dans tout code généré :

- Le `username` est **immuable** : aucune route de modification de
  username ne doit exister, dans aucun service.
- Le `username` est la **clé primaire** des entités utilisateur
  (`Account` dans `auth-svc`, `Profile` dans `user-svc`) — pas d'UUID
  parallèle pour ces entités précises.
- Les autres services (`post-svc`, `notif-svc`) ne font **aucune foreign
  key technique** vers `auth-svc`/`user-svc` (impossible de toute façon
  entre bases différentes). Ils stockent juste le `username` en tant que
  champ simple (`authorUsername`, `recipientUsername`, etc.).
- La cohérence est **applicative**, pas technique : c'est à `auth-svc` de
  garantir l'unicité du username à la création de compte, les autres
  services lui font confiance.

---

## 3. Schémas de données (Prisma)

| Service     | Moteur     | Raison du choix                                                 |
| ----------- | ---------- | --------------------------------------------------------------- |
| `auth-svc`  | PostgreSQL | données critiques, contraintes fortes, transactions ACID        |
| `user-svc`  | PostgreSQL | le graphe de follow est un many-to-many relationnel classique   |
| `post-svc`  | MongoDB    | volume d'écriture élevé, structure semi-flexible                |
| `notif-svc` | MongoDB    | fort volume d'écriture, payload variable selon le type de notif |
| `feed-svc`  | — (aucune) | calculé à la volée, voir section 2                              |

Modèle important à respecter : **dans `post-svc`, un commentaire EST un
post**, simplement doté d'un `parentId` pointant vers un autre `Post`. Ne
pas recréer une entité `Comment` séparée — ça casse le modèle de thread à
profondeur illimitée qu'on a choisi.

Chaque service avec base de données a son `schema.prisma` dans
`microservices/<service>/prisma/`. `feed-svc` n'a pas de dossier
`prisma/` puisqu'il n'a pas de base. Avant de modifier un schéma,
vérifier l'historique des décisions déjà prises (champs volontairement
retirés du scope : médias riches, modération/signalement, préférences
de langue/thème, état de révocation de token — voir section 6 pour le
détail des choix tranchés).

---

## 4. Conventions Git

On suit **Gitflow** + **Conventional Commits**, comme vu dans le module.

### Branches

- `main` : code stable, déployable
- `develop` : branche d'intégration
- `feature/<nom-service>-<courte-description>` (ex: `feature/auth-svc-login`)
- `fix/<courte-description>`
- Toujours partir de `develop`, jamais de `main`, pour une nouvelle feature.

### Commits (Conventional Commits)

Format : `<type>(<scope>): <description>`

Types principaux : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`,
`style`.

Scope = le service concerné quand pertinent : `auth-svc`, `user-svc`,
`post-svc`, `notif-svc`, `feed-svc`, `gateway`, `front`.

Exemples :

```
feat(auth-svc): ajoute la route de login avec génération JWT
fix(post-svc): corrige le calcul de replyCount sur les threads imbriqués
docs(readme): met à jour les instructions d'installation
chore(deps): bump prisma vers la dernière version
```

**Toute instance Claude qui commit pour le compte d'un humain doit
respecter ce format sans exception**, et ne doit jamais committer
directement sur `main` ou `develop`.

### Issues / board Kanban

Le board GitHub Projects suit 3-4 colonnes : À faire / En cours / Terminé /
(Blocage, optionnelle). Si une instance Claude identifie une tâche
restante, elle peut proposer une issue mais ne doit pas la créer sans
validation explicite de l'utilisateur.

---

## 5. Conventions transverses (tous services Node.js)

Ces conventions s'appliquent à `auth-svc`, `user-svc`, `post-svc`,
`notif-svc`, `feed-svc`, et `gateway` — pas au `front` qui suit son
propre `CLAUDE.md`.

### Arborescence standard par service (avec base de données)

```
<service>/
├── Dockerfile
├── .env                 (jamais commité, voir .gitignore)
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── src/
    ├── controllers/
    ├── routes/
    ├── services/
    ├── models/
    ├── middlewares/
    ├── config/
    ├── seed/
    └── index.js
```

`feed-svc` suit la même arborescence **sans le dossier `prisma/`** —
il n'a aucune base de données, son `seed/` (s'il existe) sert au plus à
peupler des données de test côté `post-svc`/`user-svc` pour les démos,
pas à initialiser une base qui lui serait propre.

### Règles de code

- Toutes les routes exposées par un service sont préfixées `/api`.
- Chaque service expose une route `/health` (vérification de bon
  fonctionnement, utile pour le `depends_on` / healthcheck Docker) —
  y compris `feed-svc` malgré l'absence de base de données.
- Gestion d'erreurs centralisée (middleware d'erreur Express), pas de
  `try/catch` qui renvoie des messages d'erreur bruts/stack traces au
  client.
- CORS configuré explicitement, pas de wildcard `*` en environnement de
  démo/production.
- Variables d'environnement via `dotenv`, jamais de secret en dur dans le
  code.
- Niveau 2 du modèle de maturité de Richardson minimum : ressources
  nommées au pluriel, verbes HTTP sémantiquement corrects (`GET`, `POST`,
  `PATCH`/`PUT`, `DELETE`), codes de statut HTTP corrects (`201` à la
  création, `204` à une suppression sans contenu retourné, `400` vs `401`
  vs `403` vs `404` utilisés à bon escient — ne pas tout renvoyer en
  `400`/`500`).
- `nodemon` en développement uniquement, jamais en production/Docker
  final (le `Dockerfile` doit lancer `node` directement, pas `nodemon`).

### Sécurité / Auth

- Aucun service backend ne doit être directement exposé à l'extérieur du
  réseau Docker — seul Nginx (gateway) a un port mappé vers l'hôte.
- La vérification du JWT se fait via `auth_request` côté Nginx, qui
  délègue la validation effective à `auth-svc` (`/api/auth/validate`).
  Les services métier (`post-svc`, `notif-svc`, `user-svc`, `feed-svc`)
  ne réimplémentent pas leur propre logique de vérification JWT — ils
  font confiance aux headers transmis par Nginx après validation
  (`X-User-Username`, `X-User-Role`, voir section 6).
- `auth-svc` ne stocke que les informations strictement nécessaires à
  l'authentification (`username`, `email`, `passwordHash`, `role`,
  `active`). Toute donnée de profil va dans `user-svc`.

---

## 6. Décisions déjà tranchées (ne pas re-discuter sans raison)

Ces points ont été débattus et validés. Une instance Claude ne doit pas
les remettre en question ou les modifier sans qu'on en discute
explicitement :

- **`feed-svc` existe comme service mais sans base de données.**
  Fan-out on read, stateless. Voir section 2.
- **Le `username` est immuable et sert de clé primaire** pour les entités
  utilisateur (`Account`, `Profile`). Pas d'UUID parallèle pour ces
  entités.
- **Un commentaire est un `Post` avec un `parentId`**, pas une entité
  séparée. Permet les threads à profondeur illimitée.
- **Header transmis par Nginx après validation JWT : `X-User-Username`
  et `X-User-Role`.** Fixé une fois pour toutes — tous les services
  métier lisent ces deux headers, aucun autre nom ne doit être introduit.
- **Gateway = Nginx pur, pas de service Node.js.** Tout code Node.js
  trouvé dans `gateway/` est un résidu à migrer, pas une architecture
  alternative.
- **Bases de données par service : voir tableau section 3.** Ne pas
  changer un moteur de DB sans discussion (impact sur le `compose.yml`,
  les Dockerfiles, et les schémas).
- **Pas de champ de révocation (`revoked`) sur les refresh tokens.**
  Déconnexion = suppression de la ligne en base, pas de flag d'état.
- **Hors scope pour l'instant** (retiré volontairement, à ne pas
  réintégrer sans validation) :
  - Médias riches sur les posts (images/vidéos)
  - Signalement de contenu / modération
  - Préférences de langue et de thème sur le profil
  - Suspension/bannissement avancé (le champ `active` sur `Account`
    suffit pour bloquer un compte)
- **Isolation du client Prisma en monorepo pnpm** : on utilise un
  `.npmrc` racine avec `public-hoist-pattern[]=!@prisma/client` et
  `public-hoist-pattern[]=!.prisma/client` plutôt qu'un `output` custom
  dans chaque schéma. Ne pas réintroduire de `output` custom sans
  retirer cette règle du `.npmrc` (les deux approches ne doivent pas
  coexister).

---

## 7. Points encore ouverts / À répartir entre les Claude du groupe

Ces points ne sont **pas encore figés**. Si tu es l'instance Claude qui
travaille sur le service concerné, propose une convention et **redescends
l'info ici** (ou demande à l'utilisateur de mettre ce fichier à jour)
pour que les autres services s'alignent.

- **Port d'entrée de la gateway** : proposition par défaut à valider —
  `8080` exposé côté hôte, `80` à l'intérieur du container Nginx. À
  confirmer par la personne qui code `gateway/`.
- **Convention de nommage des variables `.env`** par service —
  proposition par défaut :
  ```
  PORT=3000
  DATABASE_URL=postgresql://user:password@host:5432/dbname
  # ou pour Mongo :
  DATABASE_URL=mongodb://host:27017/dbname
  JWT_SECRET=...        (auth-svc uniquement, jamais répliqué ailleurs)
  ```
- **Nom exact des containers/services dans `compose.yml`** (ex:
  `auth-postgres`, `user-postgres`, `post-mongo`, `notif-mongo`) — doit
  matcher l'host utilisé dans chaque `DATABASE_URL`.
- **Contenu exact de `feed-svc/src/seed/`** (s'il en a un) : à clarifier
  si ce dossier sert uniquement à peupler des comptes/posts de démo via
  les API de `user-svc`/`post-svc`, ou s'il est inutile et doit être
  supprimé.

---

## 8. Pour les instances Claude : comportement attendu

- **Ne jamais committer ou pousser sans qu'un humain l'ait explicitement
  demandé.**
- **Ne jamais s'ajouter en tant que co-auteur sur un commit** (pas de
  trailer `Co-Authored-By: Claude` ou équivalent) — les commits restent
  attribués uniquement aux membres de l'équipe.
- **Ne jamais écrire ou modifier du code sans demande explicite.** Une
  instance Claude peut analyser, expliquer, proposer un plan ou un
  diagramme sans qu'on le lui demande, mais ne touche aux fichiers de
  code que si l'utilisateur le formule clairement (ex: "code la route
  X", "corrige ce bug").
- **Ne jamais modifier le schéma Prisma d'un autre service que celui sur
  lequel on travaille**, sauf demande explicite — chaque service est
  "possédé" par un sous-ensemble de l'équipe.
- Si une fonctionnalité semble manquante par rapport à un réseau social
  "complet", vérifier d'abord la section 6 (hors scope volontaire) avant
  de proposer de l'ajouter.
- Si un choix technique de cette page semble contredit par le code
  existant (ex: du code Node.js dans `gateway/`), le signaler à
  l'utilisateur plutôt que de trancher seul.
- Toujours justifier les choix d'architecture dans les commentaires de
  code ou la documentation produite — le rapport de fin de projet doit
  pouvoir réutiliser ces justifications presque telles quelles.
