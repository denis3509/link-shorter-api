# link-shorter-api
Для установки зависимостей воспользуйтесь командой npm i
Для запуска сервера npm run start

Для хранения сведений о ссылках необходима регистрация.
Файл с настройками хранится в config/index. 
Для работы сервера необходима MongoDB.

Методы api.
Тело запроса должно быть объектом json.
Для авторизованных пользователей:

GET: `{url}/users/table` - таблица с ссылками, созданными пользователем. 
Содержит коротку ссылку, оригинальную ссылку, количество переходов.

POST:  `{url}/users/link` создает ссылку и добавляет ее в список ссылок пользователя. 
Тело запроса должно содержать поле url с оригинальной ссылкой например:
{
	"url" : "https://material-ui.com/ru/getting-started/installation/"
}

DELETE:  `{url}/users/link?link_id={link_id}` удаляет ссылку из базы. link_id - id ссылки в формате Object_id (mongodb)
 

GET: `{url}/users/link` возвращает имя пользователя. Используется на клиенте для аутентификации.
Запросы для авторизованных пользователей должны содержать заголовок "Authorization" : "Bearer {token}". Токен выдается при авторизации.
Для всех пользователей: 

POST: `{url}/users/signUp` - регистрация. Тело запроса должно содержать email, userName, password, например: 
{
	"email" : "denis3509@gmail.com",
	"userName" : "Денис Богатырев"
	"password" : "12345"
}

POST: `{url}/users/signIn` - авторизация. Возвращает userName и token. Тело запроса должно содержать email, password, например: 
{
	"email" : "denis3509@gmail.com",
	"password" : "12345"
}
 
POST: `{url}/links/link` - создает короткую ссылку и возвращает ее. 
Тело запроса должно содержать url оригинально ссылки (как в примере выше).

GET `{url}/{shortUrl}` - адрес для редиректа. {shortUrl} - уникальный идентификатор(короткий) ссылки.
