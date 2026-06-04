# 🌍 Africa Freelancer — Guide de démarrage

## Stack technique
- **Frontend** : React + Vite + TanStack Query + React Router
- **Backend**  : Django + Django REST Framework + JWT
- **Base de données** : SQLite (développement)

---

## ⚡ Démarrage rapide

### 1. Backend Django

```bash
cd backend

# Installer les dépendances
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow python-dotenv

# Appliquer les migrations
python manage.py migrate

# Créer un compte admin
python manage.py createsuperuser

# Lancer le serveur (port 8000)
python manage.py runserver
```

L'API sera accessible sur : http://localhost:8000/api
L'admin Django sur : http://localhost:8000/admin

---

### 2. Frontend React

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement (port 5173)
npm run dev
```

L'application sera accessible sur : http://localhost:5173

---

## 📁 Structure du projet

```
africa-freelancer/
├── backend/
│   ├── config/              → Settings Django, URLs principales
│   ├── users/               → Auth, profils freelance et client
│   ├── projects/            → Projets et livraisons
│   ├── proposals/           → Offres des freelances
│   ├── messages_chat/       → Messagerie
│   ├── payments/            → Paiements (escrow)
│   ├── reviews/             → Système d'avis
│   ├── notifications/       → Notifications
│   └── manage.py
│
└── frontend/
    └── src/
        ├── api/client.js    → Toutes les fonctions API (Axios)
        ├── context/         → AuthContext (état global auth)
        ├── components/      → Navbar
        └── pages/           → Toutes les pages de l'app
```

---

## 🔗 Endpoints API principaux

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | /api/auth/register/ | Inscription |
| POST | /api/auth/login/ | Connexion |
| GET | /api/auth/me/ | Profil connecté |
| GET | /api/projects/ | Liste des projets |
| POST | /api/projects/ | Créer un projet |
| POST | /api/proposals/project/{id}/ | Soumettre une offre |
| POST | /api/proposals/{id}/accept/ | Accepter une offre |
| GET | /api/messages/inbox/ | Boîte de réception |
| POST | /api/messages/send/ | Envoyer un message |
| POST | /api/payments/project/{id}/pay/ | Effectuer un paiement |
| POST | /api/reviews/project/{id}/ | Laisser un avis |

---

## 🚀 Flux principal d'utilisation

1. **Client** s'inscrit → crée un projet
2. **Freelance** s'inscrit → parcourt les projets → soumet une offre
3. **Client** reçoit les offres → accepte une offre → effectue le paiement (escrow)
4. **Freelance** travaille → soumet la livraison
5. **Client** valide la livraison → paiement libéré au freelance
6. **Client** laisse un avis sur le freelance

---

## 🔒 Sécurité
- Mots de passe hashés par Django (PBKDF2)
- Authentification JWT (access 1 jour, refresh 7 jours)
- CORS configuré pour le frontend uniquement
- Validation des données côté serveur (DRF)
- Permissions par rôle (CLIENT, FREELANCE, ADMIN)

---

## 🔧 Variables d'environnement backend (.env)
```
SECRET_KEY=votre_secret_django
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```
