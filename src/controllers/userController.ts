import { Request, Response } from 'express'
// const productService = require('../services/productsService')

export const getHello = async (req: Request, res: Response) => {
  // const products = await productService.getAllProducts()
  // res.json(products)
  try {
    return res.status(200).send('Hello')
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).send('Internal Server Error')
  }
}
