###Partie "Web" pour le projet R&D
Aperçu disponible sur [http://aftersoon.herokuapp.com](http://aftersoon.heroku.com)
Utiliser Postman pour faire des tests ([Postman sur le store](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm))

####Configurer Postman :
Dans l'url : http://aftersoon.herokuapp.com puis :

##### UTILISATEURS
- `/users` avec la methode `POST` pour avoir la liste des utilisateurs
- `/user/<USERNAME>` avec la methode `POST` pour avoir les infos de l'utilisateur ayant l'username `<USERNAME>`
- `/user` avec la methode `POST` pour créer un nouvel utilisateur
- `/user/<USERNAME>` avec la methode `DELETE` pour supprimer l'utilisateur ayant l'username `<USERNAME>`
- `/user/<USERNAME>` avec la methode `PUT` pour mettre à jour l'utilisateur ayant l'username `<USERNAME>`

##### EVENEMENTS
- `/events` avec la methode `POST` pour avoir la liste des evenements
- `/event/<ID>` avec la methode `POST` pour avoir les infos de l'evenement ayant l'id `<ID>`
- `/event` avec la methode `POST` pour créer un nouvel événement
- `/event/<ID>` avec la methode `DELETE` pour supprimer l'événement ayant l'id `<ID>`
- `/event/<ID>` avec la methode `PUT` pour mettre à jour l'événement ayant l'id `<ID>`

___

Pour l'encart `Headers` (bouton en haut à droite), ajouter :
- `Header` : Content-Type
- `Value` : application/json
Les données sont traitées en JSON côté serveur

Les données à transférer pour chacune des urls se fait via l'onglet `raw` (dernier de la liste des choix). Il faut ensuite choisir dans le menu déroulant `JSON`

> Pour chaque requête autre que l'ajout d'un utilisateur, pour des raisons de sécurité, il faut passer en plus en parametre `myUsername` et `myPassword`

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