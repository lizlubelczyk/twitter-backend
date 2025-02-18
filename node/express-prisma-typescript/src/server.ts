import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { Constants, NodeEnv, Logger } from '@utils'
import { router } from '@router'
import { ErrorHandling } from '@utils/errors'
import { createServer } from 'http'
import { setupIO } from '@utils/socketIO'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import swaggerConfig from './swaggerConfig'

const app = express()
const server = createServer(app)

// Set up request logger
if (Constants.NODE_ENV === NodeEnv.DEV) {
  app.use(morgan('tiny')) // Log requests only in development environments
}

// Set up request parsers
app.use(express.json()) // Parses application/json payloads request bodies
app.use(express.urlencoded({ extended: false })) // Parse application/x-www-form-urlencoded request bodies
app.use(cookieParser()) // Parse cookies

// Set up CORS
app.use(
  cors({
    origin: Constants.CORS_WHITELIST
  })
)

app.use('/api', router)

app.use(ErrorHandling)

setupIO(server)

// Swagger setup
const specs = swaggerJsdoc(swaggerConfig)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

server.listen(Constants.PORT, () => {
  Logger.info(`Server listening on port ${Constants.PORT}`)
})
