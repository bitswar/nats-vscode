# NATS VSCode Extension

Расширение для Visual Studio Code, которое позволяет работать с NATS сервером прямо из редактора. Создавайте `.nats` файлы, подключайтесь к серверу и выполняйте команды через удобный интерфейс.

## 🚀 Возможности

- **Подключение к NATS серверу** - быстрое подключение с сохранением настроек
- **Code Lens интерфейс** - интерактивные кнопки прямо в коде
- **Поддержка всех NATS операций**:
  - `SUBSCRIBE` - подписка на сообщения
  - `REQUEST` - отправка запросов
  - `PUBLISH` - публикация сообщений
- **Гибкий парсинг данных**:
  - JSON объекты (однострочные и многострочные)
  - Простые строки в кавычках
  - Функция `randomId()` для генерации UUID
- **Автоматические выходные каналы** - отдельные окна для каждого subject
- **Авто-подключение** - автоматическое подключение при запуске

## 📦 Установка

1. Установите расширение из VS Code Marketplace
2. Или соберите из исходного кода:
   ```bash
   npm install
   npm run compile
   ```

## 🎯 Быстрый старт

### 1. Создайте NATS файл

Создайте файл с расширением `.nats` (например, `test.nats`):

```nats
SUBSCRIBE foo.bar
REQUEST foo.bar { "data": "hello" }
PUBLISH foo.bar { "data": "world", "timestamp": 1726233600 }
```

### 2. Подключитесь к серверу

1. Откройте Command Palette (`Ctrl+Shift+P`)
2. Выполните команду `NATS: Connect`
3. Введите URL вашего NATS сервера (например: `nats://localhost:4222`)

### 3. Используйте Code Lens

После подключения над каждой командой появятся интерактивные кнопки:
- **Subscribe/Unsubscribe** - для команд `SUBSCRIBE`
- **Send request** - для команд `REQUEST`
- **Publish** - для команд `PUBLISH`

## 📝 Синтаксис NATS файлов

### Команды

#### SUBSCRIBE
```nats
SUBSCRIBE subject.name
```
Подписывается на сообщения по указанному subject.

#### REQUEST
```nats
REQUEST subject.name { "data": "request payload" }
```
Отправляет запрос и ожидает ответ.

#### PUBLISH
```nats
PUBLISH subject.name { "data": "message payload" }
```
Публикует сообщение по указанному subject.

### Форматы данных

#### JSON объекты
```nats
# Однострочный JSON
REQUEST user.create { "name": "John", "email": "john@example.com" }

# Многострочный JSON
REQUEST user.create 
{ 
    "name": "John", 
    "email": "john@example.com",
    "metadata": {
        "role": "admin",
        "permissions": ["read", "write"]
    }
}

# JSON на отдельных строках
REQUEST user.create 
{ 
    "name": "John", 
    "email": "john@example.com" 
}
```

#### Простые строки
```nats
# Строка в той же строке
PUBLISH notification.send "Hello, World!"

# Строка на отдельной строке
PUBLISH notification.send 
"Hello, World!"
```

#### Функция randomId()
```nats
# Генерация случайного UUID
REQUEST user.create 
{ 
    "id": randomId(),
    "name": "John",
    "parent_id": randomId()
}
```

## 🎮 Команды расширения

### Основные команды

| Команда | Описание |
|---------|----------|
| `NATS: Connect` | Подключиться к NATS серверу |
| `NATS: Disconnect` | Отключиться от сервера |
| `NATS: Clear Saved Connection` | Очистить сохраненные настройки подключения |

### Code Lens команды

| Кнопка | Описание |
|--------|----------|
| **Subscribe** | Начать подписку на subject |
| **Unsubscribe** | Остановить подписку |
| **Send request** | Отправить запрос |
| **Publish** | Опубликовать сообщение |

## 📊 Выходные данные

### Глобальный канал
- **Название**: `NATS`
- **Содержит**: Ответы на запросы, системные сообщения

### Каналы подписок
- **Название**: `NATS - {subject}`
- **Содержит**: Сообщения, полученные по подписке

## ⚙️ Настройки

### Авто-подключение
Расширение автоматически подключается к последнему использованному серверу при запуске VS Code.

### Сохранение настроек
URL сервера сохраняется в глобальных настройках VS Code и используется для авто-подключения.

## 🔧 Примеры использования

### Тестирование API
```nats
# Подписка на события
SUBSCRIBE events.user.created

# Создание пользователя
REQUEST user.create 
{ 
    "name": "Alice",
    "email": "alice@example.com",
    "id": randomId()
}

# Отправка уведомления
PUBLISH notification.send 
{ 
    "user_id": randomId(),
    "message": "Welcome to our service!",
    "type": "welcome"
}
```


## 🐛 Устранение неполадок

### Проблема: "Not connected to nats server"
**Решение**: Выполните команду `NATS: Connect` и введите правильный URL сервера.

### Проблема: Code Lens не появляется
**Решение**: 
1. Убедитесь, что файл имеет расширение `.nats`
2. Проверьте подключение к серверу
3. Перезагрузите окно VS Code

### Проблема: "nil body" в сообщениях
**Решение**: Убедитесь, что данные правильно отформатированы:
- JSON должен быть валидным
- Строки должны быть в кавычках
- Проверьте синтаксис многострочного JSON

## 📚 Дополнительные ресурсы

- [NATS Documentation](https://docs.nats.io/)
- [NATS Server](https://github.com/nats-io/nats-server)
- [NATS Client Libraries](https://docs.nats.io/developing-with-nats)

## 🤝 Поддержка

Если у вас возникли проблемы или есть предложения:
1. Создайте Issue в репозитории проекта
2. Опишите проблему подробно
3. Приложите пример `.nats` файла, если возможно

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.