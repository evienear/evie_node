import { Router } from "express";
import { FunctionsRpc } from "../utils/functionsRpc";

class NEARRoutes {
        router: Router;
    constructor() {
                this.router = Router();
                this.routes();

    }

    async getCart(req: any, res: { send: (arg0: string) => void; }) {
        res.send('NEAR API');
    }

    routes() {
        //Añadir parametro user: ?user=
        this.router.get('/Cart', async (req, res) => {
            const user = req.query.user?.toString();
            if (typeof user === 'undefined') {
                res.status(400).send('User is not defined');
            } else if (user === '') {
                res.status(400).send('User is empty');
         } else if (typeof user === 'string') {
            res.status(200).json(await FunctionsRpc.getCartItems(user));
            } else {
                console.log('User is not a string + ' + user);
            }
        });
        //Añadir parametro account: ?account=
        //Añadir parametro contract: &contract=
        this.router.get('/NftMetadata', (req, res: { send: (arg0: string) => void; }) => {

        });
    }
}

const nearRoutes = new NEARRoutes();
export default nearRoutes.router;