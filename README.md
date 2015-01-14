#Partie "Web" pour le projet R&D

**TODO : Pensez à créer les callback lors des créations / update d'événements pour notifier les invités**

##SOMMAIRE
1. Models
	+ Utilisateurs
	+ Evenements
    + Now
2. Routes
    + /user
    + /event
    + /friend
    + /now
3. RECHERCHE : Calcul des trajets
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
    bannedBy        : {type: [String], default: []}, // people who refused to be friend with me
    GCMid           : {type: String, required: true}
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
    owner       : {type: String},
    guests      : {type: [String]},
    coming      : {type: [String]},
    refusedBy   : {type: [String]},
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

### Now
#### Structure 
```javascript
var NowSchema = new Schema({
    titleMessage       : {type: String},
    responseMessage    : {type: String},
    responseStatus     : {type: Number, enum: [1, 0]},
    travelMode         : {type: String, required:true, enum: ['walking', 'driving', 'transit'], default: 'transit'},
    radius             : {type: Number, default:200},
    rankBy             : {type: String, enum: ['DISTANCE', 'PROMINENCE'], default: 'PROMINENCE'},
    date               : {type: Date,   required: true, default: Date.now},
    owner              : {type: String, required:true}, 
    guest              : {type: String, required:true}, 
    seen               : {type: String}, // the owner can see if the message appeared on the guest's phone ? 
    latOwner           : {type: Number, default:0},
    lonOwner           : {type: Number, default:0}, 
    latGuest           : {type: Number, default:0},
    lonGuest           : {type: Number, default:0},
    latMiddlePoint     : {type: Number, default:0},
    lonMiddlePoint     : {type: Number, default:0},
    type               : {type: String, enum: ['bar', 'cafe', 'library', 'movie\_theater', 'museum', 'night\_club', 'parking', 'restaurant', 'subway_station', 'none'], default: 'none'},
    // Type from https://developers.google.com/places/documentation/supported_types
    // 'none' will return the middlepoint between the 2 persons
    placesAround       : {type: Array,  default:[]},
    version            : {type: Number, default:1}
});
```

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
- `/friend/add/email/<EMAIL>` avec la methode `POST` pour demander l'utilisateur `<EMAIL>` en ami
- `/friend/accept/<USERNAME>` avec la methode `POST` pour accepter la demande de `<USERNAME>`
- `/friend/refuse/<USERNAME>` avec la methode `POST` pour refuser la demande de `<USERNAME>`
- `/friend/remove/<USERNAME>` avec la methode `POST` pour supprimer `<USERNAME>` de sa liste d'amis

### NOW
- `/nows` avec la methode `POST` pour avoir la liste des 'Nows'
- `/now/<ID>` avec la methode `POST` pour avoir les infos du 'Now' ayant l'id `<ID>`
- `/now` avec la methode `POST` pour créer un nouveau 'Now'
- `/now/<ID>` avec la methode `DELETE` pour supprimer le 'Now' ayant l'id `<ID>`
- `/now/<ID>` avec la methode `PUT` pour mettre à jour le 'Now' ayant l'id `<ID>`

## RECHERCHE : Calcul des trajets

Un des points importants de notre projet est la recherche d'un point de rencontre optimal entre les participants.

Nous utilisons l'API google Map afin de nous aider pour le calcul des trajets et découvrir les lieux à proximité. En effet, leur base de donnée en OPEN DATA nous permet d'obtenir très rapidement des éléments d'aide pour nos calculs.

### Chronologie de notre recherche

- Recherche documentée sur les API google (map, direction, places)
- Première itération avec la création d'un script côté client
- Tentatives pour appliquer le code créé côté serveur
- Deuxième itération avec la création d'un script côté serveur et recherche d'une solution tendant vers l'optimal

#### Recherche documentée sur les API google

Très naturellement, nous nous sommes tournés vers l'utilisation de l'immense base de données accessible par tous que propose Google via ses API. Nous avons dû nous documenter pour mieux savoir : ce qu'il était possible de faire et ce que nous ne pouvions pas faire avec les outils à notre disposition.

Le résultat suivant semblait être une bonne solution :
- Utilisation de l'API google map pour placer les coordonnées GPS de nos clients sur un repère de type carte
- Utilisation de l'API google direction pour obtenir le chemin optimal entre les clients
- Utilisation d'une librairie complémentaire (epoly.js) pour obtenir le "route halfway" entre les clients
- Utilisation de l'API google places pour obtenir les établissements situés autour du point obtenu précédement

#### Première itération avec la création d'un script côté client

Puisque l'API ne peut s'exécuter que côté client, les pages [/map](http://aftersoon.heroku.com/map) (version illustrée) [/map/json](http://aftersoon.heroku.com/map/json) (version rendant le JSON) ont été créées. Elles servent à récupérer les données qui seraient ensuite traitées par le serveur et envoyées au client mobile.

Actuellement il est possible de calculer :
- Le trajet le plus court à pied, en voiture, en transport en commun
- Trouver le "mi chemin"
- Trouver dans un rayon donné un type d'établissement donné

Tous les paramètres se passent directement dans l'URL (méthode GET). L'adresse ressemble à :
`/map?firstAddress=LAT_1, LONG_1&secondAddress=LAT_2, LONG_2&travelModeParam=TYPE_OF_TRAVEL&typeOfPlaces=TYPE_OF_PLACE[&radius=NUMBER&openNow=yes&rankBy=DISTANCE]`
##### Paramètres obligatoires
- Les coordonnées des adresses doivent être séparées par une virgule suivi d'un espace (ex : `48.581073, 7.749145` ce qui donne encodé : `48.581073,%207.749145`)
- Le paramètre travelModeParam peut prendre les valeurs `DRIVING`, `WALKING`, `TRANSIT` ([documentation](https://developers.google.com/maps/documentation/directions/#TravelModes))
- Le paramètre typeOfPlaces peut prendre les valeurs présentées à [cette adresse](https://developers.google.com/places/documentation/supported_types)

##### Paramètres optionnels
- Le paramètre openNow prend la valeur `yes` ou `no` en fonction du choix souhaité ([documentation](https://developers.google.com/places/documentation/search)) **Par défaut : no**
- Le paramètre radius prend un nombre (mètre) comme valeur ([documentation](https://developers.google.com/places/documentation/search)) **Par défaut : 200**
- Le paramètre rankBy peut être ajouté avec la valeur `DISTANCE`. A ce moment, le radius n'est plus pris en compte mais une liste est créée en cherchant les établissements les plus proches (pourra être utilisé lorsque le lieu calculé est pauvre en établissement)

> Exemple : 
> - [http://aftersoon.herokuapp.com/map?firstAddress=48.581073,%207.749145&secondAddress=48.583483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&radius=100&openNow=yes](http://aftersoon.herokuapp.com/map?firstAddress=48.581073,%207.749145&secondAddress=48.583483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&radius=100&openNow=yes) **(sans rankBy)**
> - [http://aftersoon.herokuapp.com/map?firstAddress=48.501073,%207.749145&secondAddress=48.483483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&rankBy=DISTANCE](http://aftersoon.herokuapp.com/map?firstAddress=48.501073,%207.749145&secondAddress=48.483483,%207.746404&travelModeParam=TRANSIT&typeOfPlaces=bar&rankBy=DISTANCE) **(avec rankBy)**

> **Actuellement la page affiche une carte pour être sur des résultats. L'objet est visible dans la console. En utilisant la même URL mais en ajoutant `/json` après `/map` l'objet JSON apparait**

#### Tentatives pour appliquer le code créé côté serveur

Une fois notre codé réalisé, nous avons tenté de récupérer les données côté serveur. Nous espérions appeler la page `/map/json` et récupérer son contenu pour l'ajouter à notre objet. 
Néanmoins nous n'avions pas pensé qu'une requête de type GET n'exécute pas le Javascript présent sur la cible. Nous ne pouvions donc pas obtenir nos données. 
Nous avons essayé de plusieurs façon d'intégrer notre code côté serveur. Google ne permet pas d'utiliser ses scripts côté serveur. Malgré nos recherches durant plusieurs jours, en essayant d'utiliser d'autres plateformes, nous étions donc dans une impasse.

#### Deuxième itération avec la création d'un script côté serveur et recherche d'une solution tendant vers l'optimal

Nous avons donc décidé de réflechir à nouveau à une solution côté serveur.
Nos ressources étaient limité à l'utilisation des API google retournant directement du JSON.
Nous avions donc :
- La possibilité d'utiliser les coordonnées GPS des clients
- Utiliser l'API google direction pour récupérer un objet JSON de notre requête
- Utiliser l'API google places pour récupérer un objet JSON de notre requête

Malheureusement l'API principale, celle de Google Map n'était plus disponible tout comme la librairie de calcul (epoly.js). Nous ne pouvions donc plus trouver le point de rencontre.

Nous avons néanmoins trouvé une solution permettant d'approximer ce point de rencontre de manière fiable :
Le JSON retourné par l'API google direction contient :
    + la distance totale du trajet
    + un tableau contenant toutes les étapes pour naviguer d'un point à l'autre qui contient pour chaque étape :
        + la distance de l'étape
        + un polyline (structure qui encode un tableau de coordonnées GPS définissant la courbe du trajet du début de l'étape à la fin de l'étape)

Notre solution est donc la suivante :
- Nous parcourons le tableau des étapes jusqu'à dépasser le milieu du trajet (distance totale / 2),
- Nous gardons l'étape où se trouve le milieu du trajet, la distance totale parcourue au début et à la fin de celui-ci,
- Nous décodons le polyline de l'étape pour créer un tableau de coordonnées GPS qui correspondent à la forme de l'étape,
- Nous calculons la distance entre le début de l'étape et le milieu du trajet pour établir un pourcentage qui servira à obtenir l'index correspondant au mieux au milieu du trajet :
```
GPSarray[0]                    GPSarray[calculé]        GPSarray[length]
DistanceDebutEtape             Milieu Trajet            DistanceFinEtape
 |------------------------------|------------------------|
```
En effet, sur des grandes étapes, nous pouvons admettre que la disposition des différentes coordonnées GPS du polyline sont placées de façon continue et régulière (loi des grands nombres et probabilité). Pour des petites étapes, même si cette disposition est moins bien respectée, l'impact est négligeable de par la petite distance.
Avec cette solution nous pouvons obtenir des résultats très convaincants pour le milieu d'un trajet (de plus le rayon de recherche d'un établissement effacera également les disparités avec le vrai milieu du trajet).
- Une fois le milieu obtenu, nous formons une URL qui ira chercher un objet JSON via l'API google places.

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