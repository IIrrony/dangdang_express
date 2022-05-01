// 导入mongoose模型
const { User } = require("./models")

const express = require('express')
const jwt = require("jsonwebtoken")
const bookdata = require("./book.json")
const asidebookdata = require("./asidebook.json")
const { default: mongoose } = require("mongoose")
const app = express()

//jwt加密密钥 (应放在环境变量中)
const SECRET = "dfb2jh340vt5342kjhjbav49f"

app.use(express.json())

app.get('/api/users', async (req, res) => {
  const users = await User.find()
  res.send(users)
})

//注册
app.post("/api/register", async (req, res) => {
  console.log(req.query);
  const exist = await User.findOne({
    username: req.query.username
  })
  if (!exist) {
    const user = await User.create({
      username: req.query.username,
      password: req.query.password,
    })
    return res.send({
      code: 200,
      data: {
        msg: "注册成功，请登录哦！！！",
        user
      }
    })
  } else {
    return res.send({
      code: 422,
      data: {
        msg: "用户名已存在，请输入其他用户名！！！"
      }
    })
  }
})

//登录
app.post("/api/login", async (req, res) => {

  const user = await User.findOne({
    username: req.query.username
  })
  if (!user) return res.send({
    code: 422,
    data: {
      msg: "用户不存在，请输入正确的用户名！！！"
    }
  })

  const isPasswordValid = require('bcrypt').compareSync(
    req.query.password,
    user.password
  )

  if (!isPasswordValid) {
    return res.send({
      code: 422,
      data: {
        msg: "密码错误！！！请重新输入密码！！！"
      }
    })
  }
  //生成token
  const token = jwt.sign({
    id: String(user._id)
  }, SECRET)

  res.send({
    code: 200,
    data: {
      msg: "恭喜你，登录成功了哦！！！",
      user,
      token
    },
  })
})

// 检验是否有登录中间件
const auth = async (req, res, next) => {
  const raw = String(req.headers.authorization).split(' ').pop()
  //解密token, 只需要id
  const {
    id
  } = jwt.verify(raw, SECRET)

  req.user = await User.findById(id)

  next()
}

//获取用户信息
app.get('/api/profile', auth, async (req, res) => {
  const userinfo = req.user
  if (userinfo) {
    res.send({
      code: 200,
      data: {
        msg: "获取登陆状态成功！！",
        userinfo
      }
    })
  } else {
    res.send({
      code: 422,
      data: {
        msg: "用户权限无效，请重新登录！！！"
      }
    })
  }
})

//搜索
app.post('/api/search', async (req, res) => {
  console.log(req.query);
  if (req.query.keyword == "围城") {
    res.send({
      code: 200,
      data: {
        msg: "success",
        bookdata,
        asidebookdata,
      }
    })
  } else {
    res.send({
      code: 400,
      data: {
        msg: [{title:req.query.keyword}]
      }
      
    })
  }
})


app.listen(3001, () => {
  console.log("http://localhost:3001");
})