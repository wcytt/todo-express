// 引入 express body-parser fs
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')

// 创建 express 实例赋值给 app
const app = express()

// 配置静态文件目录
app.use(express.static('public'))

// 解析前端发过来的 json 数据
app.use(bodyParser.json())

// 全局变量 todos
var todos = [
    {
        id: 1,
        done: false,
        content: '测试数据'
    }
]

// 路由处理函数
// log 函数
const log = console.log.bind(console, '## bug =>')

// 读取 html 返回 html
const sendHtml = function(path, response) {
    var fs = require('fs')
    var options = {
        encoding: 'utf-8'
    }
    fs.readFile(path, options, function(err, data) {
        if(err !== null) {
            console.log('err', err)
        } else {
            // console.log('读取的数据', data)
            response.send(data)
        }
    })
}

// 读取文件载入数据
const loadTodosFromFile = function(callback) {
    // 判断文件是否存在
    var path = 'appTodos.json'
    var exists = fs.existsSync(path)
    if(exists) {
        fs.readFile(path, 'utf8', function(error, data) {
            if(error !== null) {
                log('loadTodosFromFile 中的 readFile', error)
                // 出错的情况
                var todos = []
                callback(todos)
            } else {
                // log(`${path} 读取成功`, data, typeof(data))
                // data 是一个 json 格式的字符串
                todos = JSON.parse(data)
                callback(todos)
            }
        })
    } else {
        // 文件不存在，则创建文件
        var s = JSON.stringify(todos, null, 4)
        fs.appendFile(path, s, function(error) {
            if(error !== null) {
                log('loadTodosFromFile 中的 error', error)
            } else {
                callback(todos)
            }
        })
    }
}

// 把 todos 写入文件
const writeTodosToFile = function(todos) {
    // 把数据转成 json 格式
    var s = JSON.stringify(todos, null, 4)
    // 写入文件
    var path = 'appTodos.json'
    // // 读取之前的数据添加新的数据
    // fs.readFile(path, 'utf8', function(error, data) {
    //     if(error !== null) {
    //         log('writeTodosToFile 中的 readFile', error)
    //     } else {
    //         log(`${path} 读取成功`, data, typeof(data))
    //         data = JSON.parse(data)
    //         todos.push(data)
    //         log('todos', todos, typeof(todos))
    //
    //     }
    // })
    fs.writeFile(path, s, (error) => {
        if(error !== null) {
            log('writeTodosToFile 中的 writeFile', error)
        } else {
            log(`writeTodosToFile 中的 ${path} 写入成功`)
        }
    })
}

// 把数据补全并写入文件后返回数据
const todoAdd = function(todo, response) {
    // {"content":"待办事项 1"}
    // 读取文件里面的数据
    var path = 'appTodos.json'
    fs.readFile(path, 'utf8', function(error, data) {
        if(error !== null) {
            log('todoAdd 中的 readFile', error)
        } else {
            // log('注意这里的 data', data, typeof data)
            todos = JSON.parse(data)
            // 计算 id
            if(todos.length === 0) {
                todo.id = 1
            } else {
                // log('todos', todos)
                var todoId = todos[todos.length - 1].id
                todo.id = todoId + 1
            }
            // 加上状态
            todo.done = false
            // 把 todo 加入 todos 数组
            todos.push(todo)
            // log('todo add', todos)
            // 把数据写入文件中
            writeTodosToFile(todos)
            // log('todo', todo)
            // 把生成的数据返回给前端
            response.send(todo)
        }
    })
}

// 把数据修改并保存后返回数据
const updateToFile = function(todo, response) {
    // 读取文件的数据
    var path = 'appTodos.json'
    fs.readFile(path, 'utf8', function(error, data) {
        if(error !== null) {
            log('updateToFile 中的 readFile error', error)
        } else {
            var todos = JSON.parse(data)
            log('updateToFile', todos, typeof(todos))
            for(var i = 0; i < todos.length; i++) {
                var obj = todos[i]
                if(todo.id === obj.id) {
                    obj.done = todo.done
                    obj.content = todo.content
                    break
                }
            }
            // 修改完成，保存 todos
            var s = JSON.stringify(todos, null, 4)
            fs.writeFile(path, s, function(error) {
                if(error !== null) {
                    log('updateToFile 中的 writeFile', error)
                } else {
                    // log(`updateToFile 中的 ${path} 写入成功`)
                    // 返回数据
                    response.send(todo)
                }
            })
        }
    })
}

// 
const deleteFromFile = function(todo, response) {
    // 读取文件的数据
    var path = 'appTodos.json'
    fs.readFile(path, 'utf8', function(error, data) {
        if(error !== null) {
            log('deleteFromFile 中的 readFile error', error)
        } else {
            var todos = JSON.parse(data)
            log('deleteFromFile', todos, typeof(todos))
            var index = -1
            for(var i = 0; i < todos.length; i++) {
                var obj = todos[i]
                if(todo.id === obj.id) {
                    index = i
                    break
                }
            }
            if(index > -1) {
                // 找到了
                todo = todos.splice(index, 1)
                // 删除完成，保存 todos
                var s = JSON.stringify(todos, null, 4)
                fs.writeFile(path, s, function(error) {
                    if(error !== null) {
                        log('deleteFromFile 中的 writeFile', error)
                    } else {
                        // 返回数据
                        log('删除数据成功', todo)
                        response.send(todo)
                    }
                })
            } else {
                // 没找到这个数据，返回
                var r = JSON.stringify({"state": "没有这个数据"})
                response.send(r)
            }
        }
    })
}

// 路由
app.get('/', function(request, response) {
    var path = 'index.html'
    sendHtml(path, response)
})

app.get('/todo/all', function(request, response) {
    // 从文件中读取数据
    loadTodosFromFile(function(todos) {
        // 把数据返回给前端
        var r = JSON.stringify(todos, null, 4)
        response.send(r)
    })
})

app.post('/todo/add', function(request, response) {
    // 得到数据
    var todo = request.body
    // 处理数据并返回
    todoAdd(todo, response)
})

app.post('/todo/update', function(request, response) {
    // 得到数据
    var todo = request.body
    // 处理数据 返回数据
    updateToFile(todo, response)
})

app.post('/todo/delete', function(request, response) {
    // 得到数据
    var todo = request.body
    log('todo delete',todo)
    // 处理数据 返回数据
    deleteFromFile(todo, response)
})

// server 
const server = app.listen(9000, function() {
    var host = server.address().address
    var port = server.address().port
    log("应用实例，访问地址为 http://", host, port)
})
