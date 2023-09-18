import express, { Request, Response } from 'express';
import { ProductController } from '../controllers/ProductController';
import { IProduct } from '../models/Product';

const productRouter = express.Router();
const productController = new ProductController();

productRouter.post("/", async (req: Request, res: Response): Promise<Response> => {
    try {
        const product: IProduct = req.body;
        console.log(req.body);
        const savedProduct = await productController.saveProduct(product);
        return res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error);
        return res.status(500).json(error);
    }
});

export default productRouter;