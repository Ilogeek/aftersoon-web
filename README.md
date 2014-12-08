#Partie "Web" pour le projet R&D

##SOMMAIRE
1. Models
	+ Utilisateurs
	+ Evenements
2. Routes
    + /user
    + /event
    + /friend
3. Essais avec Postman

## Models
### Utilisateurs
#### Structure 
```javascript
var UserSchema = new Schema({
    username        : {type: String, required: true, index: { unique: true }},
    email           : {type: String, required: true, index: { unique: true }},
    password        : {type: String, required: true},
    telephone       : {type: String},
    adresse         : {type: String, required: true},
    gps             : {type: String},
    loginAttempts   : {type: Number, required: true, default: 0},
    lockUntil       : {type: Number},
    friends         : {type: [String], default: []}, // accepted friends
    askedToBeFriend : {type: [String], default: []}, // people I asked to be friend with me
    requestFrom     : {type: [String], default: []}, // people WHO asked to be friend with me
    bannedBy        : {type: [String], default: []} // people who refused to be friend with me
});
```
#### Method
- User.comparePassword(PasswordATester, callback)
- User.incLoggingAttempts(callback)
- getAuthenticated(username, password, callback)

### Evenements
#### Structure 
```javascript
var EventSchema = new Schema({
    title       : {type: String, required: true},
    date        : {type: Date, required: true, default: Date.now},
    owner       : {type: String}, //{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    guests      : {type: [String]}, //<-- USERNAME LIST  -- [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    coming      : {type: [String]}, //<-- USERNAME LIST  -- [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    refusedBy   : {type: [String]}, //<-- USERNAME LIST  -- [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    place_name  : {type: String, required: true},
    place_gps   : {type: String, required: true},
    date_locked : {type: Date, required: true, default: Date.now},
    version     : {type: Number, required: true, default: 1},
    type        : {type: String, enum: ['Bar', 'Lunch', 'Meeting', 'Restaurant', 'Sport', 'Hangout', 'Walk', 'Other'], default: 'Other'}
});
```
#### Method
- Event.ownedBy(username)
- Event.imInvited(username)
- Event.iRefused(username)
- Event.iWillgo(username)

### Routes
#### UTILISATEURS
- `/users` avec la methode `POST` pour avoir la liste des utilisateurs
- `/user/<USERNAME>` avec la methode `POST` pour avoir les infos de l'utilisateur ayant l'username `<USERNAME>`
- `/user` avec la methode `POST` pour créer un nouvel utilisateur
- `/user/<USERNAME>` avec la methode `DELETE` pour supprimer l'utilisateur ayant l'username `<USERNAME>`
- `/user` avec la methode `PUT` pour mettre à jour l'utilisateur ayant l'username passé en paramètre (myUsername)
- `/user/nick/<USERNAME>` avec la methode `GET` pour regarder si l'username <USERNAME> est déjà pris (retourne 0 ou 1);

#### EVENEMENTS
- `/events` avec la methode `POST` pour avoir la liste des evenements
- `/event/<ID>` avec la methode `POST` pour avoir les infos de l'evenement ayant l'id `<ID>`
- `/event` avec la methode `POST` pour créer un nouvel événement
- `/event/<ID>` avec la methode `DELETE` pour supprimer l'événement ayant l'id `<ID>`
- `/event/<ID>` avec la methode `PUT` pour mettre à jour l'événement ayant l'id `<ID>`

#### AMIS
- `/friend/add/<USERNAME>` avec la methode `POST` pour demander l'utilisateur `<USERNAME>` en ami
- `/friend/accept/<USERNAME>` avec la methode `POST` pour accepter la demande de `<USERNAME>`
- `/friend/refuse/<USERNAME>` avec la methode `POST` pour refuser la demande de `<USERNAME>`
- `/friend/remove/<USERNAME>` avec la methode `POST` pour supprimer `<USERNAME>` de sa liste d'amis

### Essais avec Postman
Aperçu disponible sur [http://aftersoon.herokuapp.com](http://aftersoon.heroku.com)

Utiliser Postman pour faire des tests ([Postman sur le store](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm))

####Configurer Postman :
Dans l'url : http://aftersoon.herokuapp.com puis :

Pour l'encart `Headers` (bouton en haut à droite), ajouter :
- `Header` : Content-Type
- `Value` : application/json
Les données sont traitées en JSON côté serveur

Les données à transférer pour chacune des urls se fait via l'onglet `raw` (dernier de la liste des choix). Il faut ensuite choisir dans le menu déroulant `JSON`

> **Pour chaque requête autre que l'ajout d'un utilisateur, pour des raisons de sécurité, il faut passer en plus en parametre `myUsername` et `myPassword`** (à voir à l'avenir pour améliorer la méthode avec un système de session par exemple)

####Exemple pour l'affichage d'un utilisateur :
- URL : http://aftersoon.herokuapp.com/user/Hugo
- Methode : POST
- Header: Content-Type : application/json
- raw JSON :
```json
{
    "myUsername": "test2",
    "myPassword": "test"
}
```

> Différents exemples pré-écrits : [https://www.getpostman.com/collections/43ee17c2a77880dccb3e](https://www.getpostman.com/collections/43ee17c2a77880dccb3e) à importer dans Postman