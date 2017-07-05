// 封装一个 ajax
var ajax = function(method, path, data, responseCallback) {
    var r = new XMLHttpRequest()
    r.open(method, path, true)
    r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = function() {
        if(r.readyState === 4 && r.status === 200) {
            responseCallback(r.response)
        }
    }
    r.send(data)
}

// 与后端数据通信的 api 接口
var apiTodoAll = function(callback) {
    var method = 'GET'
    var path = '/todo/all'
    var data = ''
    ajax(method, path, data, callback)
}

var apiTodoAdd = function(content, callback) {
    var method = 'POST'
    var path = '/todo/add'
    var data = {
        'content': content,
    }
    var data = JSON.stringify(data)
    ajax(method, path, data, callback)
}

var apiTodoUpdate = function(todo, callback) {
    var method = 'POST'
    var path = '/todo/update'
    var data = {
        'id': todo.id,
        'done': todo.done,
        'content': todo.content,
    }
    var data = JSON.stringify(data)
    ajax(method, path, data, callback)
}

var apiTodoDelete = function(todo, callback) {
    var method = 'POST'
    var path = '/todo/delete'
    var data = {
        'id': todo.id,
        'done': todo.done,
        'content': todo.content,
    }
    var data = JSON.stringify(data)
    ajax(method, path, data, callback)
}

// log 函数，定位 bug
var log = console.log.bind(console, '### bug =>')

var e = function(className) {
    return document.querySelector(className)
}

var toggleClass = function(element, className) {
    if(element.classList.contains(className)) {
        element.classList.remove(className)
    } else {
        element.classList.add(className)
    }
}

var appendHtml = function(element, html) {
    element.insertAdjacentHTML('beforeend', html)
}

var bindEvent = function(element, eventName, callback) {
    element.addEventListener(eventName, callback)
}

var bindAll = function(selector, eventName, callback) {
    var elements = document.querySelectorAll(selector)
    for(var i = 0; i < elements.length; i++) {
        var e = elements[i]
        bindEvent(e, eventName, callback)
    }
}

// 使用模板字符串生成 html 并返回
var templateTodo = function(id, done, todo) {
    //
    var status = ''
    // 根据参数来确定生成的模板
    var describe = '未完成'
    if(done) {
        describe = '完成'
        status = 'done'
    }
    // 使用模板字符串
    var html = `
        <div class="section-container-todo ${status}" data-todo=${id}>
                    <div class="section-content">${todo}</div>
                    <div class="section-state">${describe}</div>
                    <div class="section-button">
                        <button class="button-done">完成</button>
                        <button class="button-delete">删除</button>
                    </div>
                </div>
    `
    return html
}

// 添加到页面上
var innerTodo = function(id, done, content) {
    var html = templateTodo(id, done, content)
    var container = e('.section-container')
    container.innerHTML += html
}

// 载入页面的时候把 localStorage.todoApp 的值添加到页面
var loadTodos = function() {
    // 发送 ajsx 获取数据
    apiTodoAll(function(response) {
        // 取值
        var todos = JSON.parse(response)
        // log('todos', todos)
        // 获取页码
        var page = parseInt(e('.page-number').innerHTML)
        // 开始、结束的下标
        var start = (page - 1) * 10
        var end = start + 9
        // log('开始 结束', start, end, todos.length)
        if(end > todos.length) {
            end = todos.length - 1
        }
        // 循环添加到页面上
        for(var i = start; i <= end; i++) {
            var todo = todos[i]
            innerTodo(todo.id, todo.done, todo.content)
        }
    })
}

// 弹窗函数
var alertOne = function(message) {
    // html
    var t = `
        <div class="alert-main-one">
        <div class="alert-bg"></div>
        <div class="alert-container">
            <div class="alert-title">提示信息</div>
            <div class="alert-message">${message}</div>
            <div class="alert-control">
                <button class="alert-button" type="button" data-type="ok">确定</button>
            </div>
        </div>
        </div>
    `
    // 插入页面
    var body = e('body')
    appendHtml(body, t)
    // 绑定按钮事件
    var main = e('.alert-main-one')
    // log('alertone', main)
    main.querySelector('.alert-button').addEventListener('click', function(event) {
        main.remove()
    })
}

var alertTwo = function(self, div, message) {
    // html
    var t = `
        <div class="alert-main-two">
        <div class="alert-bg"></div>
        <div class="alert-container">
            <div class="alert-title">提示信息</div>
            <div class="alert-message">${message}</div>
            <div class="alert-control">
                <button class="alert-button-two" type="button" data-type="ok">确定</button>
                <button class="alert-button-two" type="button" data-type="cancel">取消</button>
            </div>
        </div>
        </div>
    `
    // 插入页面
    var body = e('body')
    appendHtml(body, t)
    // 判断按钮,绑定事件、处理事件
    var button = self.innerHTML
    if(button === '完成') {
        bindAlertTwoDone(div)
    } else {
        bindAlertTwoDelete(div)
    }
}

// 完成弹窗处理函数
var bindAlertTwoDone = function(div) {
    bindAll('.alert-button-two', 'click', function(event) {
        var self = event.target
        var type = self.dataset.type
        if(type === 'ok') {
            // 点击了确定,更改状态、发送 ajax 到后端更新数据、隐藏弹窗
            // 更改状态
            toggleClass(div, 'done')
            var done = false
            var state = div.querySelector('.section-state').innerHTML
            if(state === '完成') {
                div.querySelector('.section-state').innerHTML = '未完成'
            } else {
                div.querySelector('.section-state').innerHTML = '完成'
                done = true
            }
            // 发送 ajax 到后端更新数据
            var id = parseInt(div.dataset.todo)
            var content = div.querySelector('.section-content').innerHTML
            var todo = {
                'id': id,
                'done': done,
                'content': content,
            }
            apiTodoUpdate(todo, function(response) {
                var todo = JSON.parse(response)
            })
            // 隐藏弹窗
            var main = e('.alert-main-two')
            main.remove()
        } else {
            // 点击了取消
            // 隐藏弹窗
            var main = e('.alert-main-two')
            main.remove()
        }
    })
}

// 删除弹窗处理函数
var bindAlertTwoDelete = function(div) {
    bindAll('.alert-button-two', 'click', function(event) {
        var self = event.target
        var type = self.dataset.type
        if(type === 'ok') {
            // 点击了确定,删除、发送 ajax 到后端，更新数据、隐藏弹窗
            // 删除
            var todoId = parseInt(div.dataset.todo)
            div.remove()
            // 发送 ajax 到后端，更新数据
            var id = parseInt(div.dataset.todo)
            var done = false
            var doneState = div.querySelector('.section-state').innerHTML
            if(doneState === '完成') {
                done = true
            }
            var content = div.querySelector('.section-content').innerHTML
            var todo = {
                'id': id,
                'done': done,
                'content': content,
            }
            apiTodoDelete(todo, function(response) {
                var todo = JSON.parse(response)
                log('api delete todo', todo[0].content)
                // 删除之后需要重新 load 数据
                // 清空
                var container = e('.section-container')
                container.innerHTML = ''
                // 把对应的数据加载到页面
                loadTodos()
            })
            // 隐藏弹窗
            var main = e('.alert-main-two')
            main.remove()
        } else {
            // 点击了取消
            // 隐藏弹窗
            var main = e('.alert-main-two')
            main.remove()
        }
    })
}

// 绑定添加按钮的事件
var bindAdd = function() {
    var add = e('.button-add')
    add.addEventListener('click', function(event) {
        var self = event.target
        // 取到 input 的值
        var content = e('.todo-input-text').value
        if(content === '') {
            // 显示弹窗
            var message = '输入不能为空!'
            alertOne(message)
        } else {
            apiTodoAdd(content, function(response) {
                var todo = JSON.parse(response)
                // 判断页面中的数据是否超过 10 个
                var container = e('.section-container')
                var todoAll = container.querySelectorAll('.section-container-todo')
                // log('todoAll', todoAll.length)
                if(todoAll.length >= 10) {
                    // 页面中的数据超过 10 个，跳转到下一页
                    var page = parseInt(e('.page-number').innerHTML)
                    apiTodoAll(function(response) {
                        var todos = JSON.parse(response)
                        var pages = Math.ceil(todos.length / 10)
                        // log('测试效果', page, pages)
                        // 更新页面上的页码
                        e('.page-number').innerHTML = pages
                        // 清空
                        var container = e('.section-container')
                        container.innerHTML = ''
                        // 把对应的数据加载到页面
                        loadTodos()
                        // 添加完成后，把 input 里面的值清空
                        e('.todo-input-text').value = ''
                    })
                } else {
                    // 页面中的数据没有超过 10 个，直接添加到页面上
                    innerTodo(todo.id, todo.done, todo.content)
                    // 添加完成后，把 input 里面的值清空
                    e('.todo-input-text').value = ''
                }
            })
        }
    })
}

// 绑定完成按钮的事件
var bindDone = function() {
    // 使用事件委托绑定在父节点上
    var container = e('.section-container')
    container.addEventListener('click', function(event) {
        var self = event.target
        if(self.classList.contains('button-done')) {
            // 显示弹窗
            var div = self.closest('.section-container-todo')
            var state = div.querySelector('.section-state').innerHTML
            var message = '已经做完了吗?'
            if(state === '完成') {
                message = '没做完啊!'
            }
            alertTwo(self, div, message)
        }
    })
}

// 绑定删除按钮的事件
var bindDelete = function() {
    var container = e('.section-container')
    container.addEventListener('click', function(event) {
        var self = event.target
        var div = self.closest('.section-container-todo')
        if(self.classList.contains('button-delete')) {
            // 显示弹窗
            var message = '确定删除?不可撤销!'
            alertTwo(self, div, message)
        }
    })
}

// 绑定前进按钮的事件
var bindForward = function() {
    var buttonForward = e('.page-forward')
    buttonForward.addEventListener('click', function(event) {
        var self = event.target
        // 判断页码是否合法
        var page = parseInt(e('.page-number').innerHTML)
        apiTodoAll(function(response) {
            var todos = JSON.parse(response)
            var pages = Math.ceil(todos.length / 10)
            // log('pages', pages)
            // 把页码加 1，载入对应的数据到页面上
            page ++
            // 判断页码是否合法
            if(page <= pages) {
                // 更新页面上的页码
                e('.page-number').innerHTML = page
                // 清空
                var container = e('.section-container')
                container.innerHTML = ''
                // 把对应的数据加载到页面
                loadTodos()
            } else {
                // 显示弹窗
                var message = '已经是最后一页了'
                alertOne(message)
            }
        })
    })
}

// 绑定后退按钮的事件
var bindBack = function() {
    var buttonBack = e('.page-back')
    buttonBack.addEventListener('click', function(event) {
        // log('点击到了 后退按钮')
        var self = event.target
        // 判断页码是否合法
        var page = parseInt(e('.page-number').innerHTML)
        // 把页码减 1，载入对应的数据到页面上
        page = page - 1
        // log('page', page)
        // 判断页码是否合法
        if(page >= 1) {
            // 更新页面上的页码
            e('.page-number').innerHTML = page
            // 清空
            var container = e('.section-container')
            container.innerHTML = ''
            // 把对应的数据加载到页面
            loadTodos()
        } else {
            // 显示弹窗
            var message = '已经是第一页了'
            alertOne(message)
        }
    })
}

// 主函数（入口）
var __main = function() {
    // 载入页面时需要把 localStorage.todoApp 的值加载到页面上
    loadTodos()
    // 绑定添加按钮的事件
    bindAdd()
    // 绑定完成按钮的事件
    bindDone()
    // 绑定删除按钮的事件
    bindDelete()
    // 绑定前进按钮的事件
    bindForward()
    // 绑定后退按钮的事件
    bindBack()
}

__main()