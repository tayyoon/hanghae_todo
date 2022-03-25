const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Todo = require("./models/todo");

mongoose.connect("mongodb://localhost/todo-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hi!");
});
// db에 있는 할일을 가져오는 API
router.get("/todos", async (req, res) => {
    const todos = await Todo.find().sort("-order").exec();

    res.send({todos});
});

// 할일 추가 API, 사용해서 해야할일을 추가하는것, 추가는것은 즉 생성하는것이기 때문에 post사용
router.post("/todos", async (req, res) => {
    const { value } = req.body;
    const maxOrderTodo = await Todo.findOne().sort("-order").exec();    
    // order앞에 -는 원래는 오름차순으로 정렬이 되는데 order을 기준으로 내림차순으로 정렬되게 하기 위함
    // exec() 실행해주는 메소드 -> promise로 나와서 await 설정 필요
    let order = 1;
    if(maxOrderTodo) {
        order = maxOrderTodo.order + 1;   // 만약에 가장 높은 수가 있으면, order값을 가장높은고 + 1로 해주는것
    }

    const todo = new Todo({ value, order});
    await todo.save();

    res.send({todo});
});

router.patch("/todos/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const { order, value, done } = req.body;
    

    const todo = await Todo.findById(todoId).exec();

    // down or up 을 했을때 위치가 이동하면서 이동하는 위이촤 번호가 서로 바뀌는 기능
    if(order) {
        const targetTodo = await Todo.findOne({ order}).exec();
        if (targetTodo) {
            targetTodo.order = todo.order;
        }
        todo.order = order;
        await todo.save();
    }else if (value) {  // 할일 을 수정하기 todo의value를 위에서 바이로 부터 받아온 req.body 의 value로 바꿔주고 save()해주기!
        todo.value = value;
    }else if (done !== undefined) { // 체크박스에 체크가 될수 있도록 또는 풀리도록 하기, 값이 true나 false로 둘다 올수가 있기 때문에 빈값이 아닐 경우로 조건을 걸어준다.
        todo.doneAt = done ? new Date() : null; // 투두의 doneAt 이 체크가 되면 그 체크되는 시간이 new Date로 시간이 저장될 수 있도록 해준다 이때 값이 true 로나오면 시간이 저장되고 false면 null로 저장된다
    }

    await todo.save();

    res.send( {});
});

// 리스트 삭제하기
router.delete("/todos/:todoId", async (req, res) => {
    const { todoId } = req.params;

    const todo = await Todo.findById(todoId).exec();
    await todo.delete();
    res.send({});
});

// app.use: 미들웨어 붙히는 코드, '/api'가 붙어있어야만 express.json()과 router 미들웨어에 연결됨
app.use("/api", bodyParser.json(), router);

app.use(express.static("./assets"));

app.listen(8080, () => {
  console.log("서버가 켜졌어요!");
});
