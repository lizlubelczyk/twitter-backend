import { Options } from 'swagger-jsdoc'

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter Backend',
      version: '1.0.0',
      description: 'API documentation'
    }
  },
  apis: ['./src/domains/*/controller/*.ts']
}

export default options
