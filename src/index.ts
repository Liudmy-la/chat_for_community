import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import routerAll from './routes/routerAll'
// import { swaggerRouter } from './swagger/router'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 7001

app.use('/', routerAll)
// app.use('/api_docs', swaggerRouter)

app.listen(port, () => {
  console.log(`Server is running on: http://localhost:${port}`)
})
