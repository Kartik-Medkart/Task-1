import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
});
import { sequelize } from './db/index.js'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express();

console.log(process.env.POSTGRES_USERNAME)

app.use(cors({
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync models with the database
sequelize.sync(
    {
        force: true
    }
)
  .then(() => {
    console.log('Database & tables created! \n\n\n\n');
  })
  .catch(err => {
    console.error('Error creating database & tables:', err);
  });

app.get( ('/') ,(req,res)=> {
    res.json({
        "Message": "Hello World"
    })
})

import userRouter from './routes/user.route.js'
app.use('/api/v1/user', userRouter);

app.listen(5000, ()=> {
    console.log("Server is running On PORT: 5000");
})