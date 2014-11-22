###Partie "Web" pour le projet R&D
Aperçu disponible sur [http://aftersoon.herokuapp.com](http://aftersoon.heroku.com)
Utiliser Postman pour faire des tests ([Postman sur le store](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm))

####Configurer Postman :
Dans l'url : http://aftersoon.herokuapp.com puis :
- `/users` avec la methode `POST` pour avoir la liste des utilisateurs
- `/user/<USERNAME>` avec la methode `POST` pour avoir les infos de l'utilisateur ayant l'username `<USERNAME>`
- `/user` avec la methode `POST` pour créer un nouvel utilisateur
- `/user/<USERNAME>` avec la methode `DELETE` pour supprimer l'utilisateur ayant l'username `<USERNAME>`
- `/user/<USERNAME>` avec la methode `PUT` pour mettre à jour l'utilisateur ayant l'username `<USERNAME>`

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
