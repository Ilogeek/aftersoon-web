#Partie "Web" pour le projet R&D

##SOMMAIRE
1. Models
	+ Utilisateurs
	+ Evenements
2. Routes
    + /user
    + /event
    + /friend
3. Ebauche pour le calcul des trajets
4. Essais avec Postman

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

## Routes
### UTILISATEURS
- `/users` avec la methode `POST` pour avoir la liste des utilisateurs
- `/user/<USERNAME>` avec la methode `POST` pour avoir les infos de l'utilisateur ayant l'username `<USERNAME>`
- `/user` avec la methode `POST` pour créer un nouvel utilisateur
- `/user/<USERNAME>` avec la methode `DELETE` pour supprimer l'utilisateur ayant l'username `<USERNAME>`
- `/user` avec la methode `PUT` pour mettre à jour l'utilisateur ayant l'username passé en paramètre (myUsername)
- `/user/nick/<USERNAME>` avec la methode `GET` pour regarder si l'username <USERNAME> est déjà pris (retourne 0 ou 1);

### EVENEMENTS
- `/events` avec la methode `POST` pour avoir la liste des evenements
- `/event/<ID>` avec la methode `POST` pour avoir les infos de l'evenement ayant l'id `<ID>`
- `/event` avec la methode `POST` pour créer un nouvel événement
- `/event/<ID>` avec la methode `DELETE` pour supprimer l'événement ayant l'id `<ID>`
- `/event/<ID>` avec la methode `PUT` pour mettre à jour l'événement ayant l'id `<ID>`

### AMIS
- `/friend/add/<USERNAME>` avec la methode `POST` pour demander l'utilisateur `<USERNAME>` en ami
- `/friend/accept/<USERNAME>` avec la methode `POST` pour accepter la demande de `<USERNAME>`
- `/friend/refuse/<USERNAME>` avec la methode `POST` pour refuser la demande de `<USERNAME>`
- `/friend/remove/<USERNAME>` avec la methode `POST` pour supprimer `<USERNAME>` de sa liste d'amis

## Ebauche pour le calcul des trajets
Nous utiliserons l'API google Map afin de nous aider pour le calcul des trajets et découvrir les lieux à proximité.

Puisque l'API ne peut s'exécuter que côté client, la page [/map](http://aftersoon.heroku.com/map) a été créée. Elle servira à récupérer les données qui seront ensuite traitées par le serveur et envoyées au client mobile.

Actuellement il est possible de calculer :
- Le trajet le plus court à pied, en voiture, en transport en commun
- Trouver le "mi chemin"
- Trouver dans un rayon donné un type d'établissement donné

Tous les paramètres se passent directement dans l'URL (méthode GET). L'adresse ressemble à :
`/map?firstAddress=LAT_1, LONG_1&secondAddress=LAT_2, LONG_2&travelModeParam=TYPE_OF_TRAVEL&typeOfPlaces=TYPE_OF_PLACE&radius=NUMBER`
#### Paramètres obligatoires
- Les coordonnées des adresses doivent être séparées par une virgule suivi d'un espace (ex : `48.581073, 7.749145` ce qui donne encodé : `48.581073,%207.749145`)
- Le paramètre travelModeParam peut prendre les valeurs `DRIVING`, `WALKING`, `TRANSIT` ([documentation](https://developers.google.com/maps/documentation/directions/#TravelModes))
- Le paramètre typeOfPlaces peut prendre les valeurs présentées à [cette adresse](https://developers.google.com/places/documentation/supported_types)

#### Paramètres optionnels
- Le paramètre openNow prend la valeur `yes` ou `no` en fonction du choix souhaité ([documentation](https://developers.google.com/places/documentation/search)) **Par défaut : no**
- Le paramètre radius prend un nombre (mètre) comme valeur ([documentation](https://developers.google.com/places/documentation/search)) **Par défaut : 200**
- Le paramètre rankBy peut être ajouté avec la valeur `DISTANCE`. A ce moment, le radius n'est plus pris en compte mais une liste est créée en cherchant les établissements les plus proches (pourra être utilisé lorsque le lieu calculé est pauvre en établissement)

> Exemple : 
> - [http://aftersoon.herokuapp.com/map?firstAddress=48.581073,%207.749145&secondAddress=48.583483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&radius=100&openNow=yes](http://aftersoon.herokuapp.com/map?firstAddress=48.581073,%207.749145&secondAddress=48.583483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&radius=100&openNow=yes) **(sans rankBy)**
> - [http://aftersoon.herokuapp.com/map?firstAddress=48.501073,%207.749145&secondAddress=48.483483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&rankBy=DISTANCE](http://aftersoon.herokuapp.com/map?firstAddress=48.501073,%207.749145&secondAddress=48.483483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&rankBy=DISTANCE) **(avec rankBy)**
> **Actuellement la page affiche une carte pour être sur des résultats. L'objet est visible dans la console.**

> **TODO : Affiner les recherches avec les paramètres optionnels du type "minprice", "maxprice". ([documentation](https://developers.google.com/places/documentation/search))**

## Essais avec Postman
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

> Différents exemples pré-écrits : [POSTMAN - Aftersoon.json](POSTMAN%20-%20Aftersoon.json) à la racine du projet, à importer dans Postman 