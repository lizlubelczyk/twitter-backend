import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget to import it in your new controllers
import 'express-async-errors'

export const healthRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoint for the API
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Returns 200 if the service is up and running
 *     responses:
 *       200:
 *         description: Service is healthy
 */
healthRouter.get('/', (req: Request, res: Response) => {
  return res.status(HttpStatus.OK).send()
})

export default healthRouter
