export class ProductRepository {
    constructor () { }

     save = async (product: any) => {
        console.log('saving user in the repository" ' + product);
        const saveResult = await product.save();
        return saveResult;
     }
}