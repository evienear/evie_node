import {getConfig} from '../config';
import * as nearAPI from 'near-api-js';
import { Account, Near, keyStores } from 'near-api-js';
import { Request, Response, Router } from 'express';
import NEARRequest from '../models/NEARRequest';
//import { BrowserLocalStorageKeyStore } from 'near-api-js/lib/key_stores'
const { networkId, nodeUrl, walletUrl, helperUrl, contractName } = getConfig(process.env.NODE_ENV || 'mainnet');
import { FunctionsRpc } from '../utils/functionsRpc';
import { getNearContract, nearAccountCallerMainnet } from '../server';

const near = new Near({
    networkId,
    keyStore: new keyStores.InMemoryKeyStore(),
    nodeUrl,
    walletUrl,
    helperUrl,
    headers: {}
})

module.exports.nearAccountCallerMainnet = async function nearAccountCallerMainnet(): Promise<Account> {
    const nearAccountCaller = await near.account(contractName);
    console.log('nearAccountCallerMainnet', await nearAccountCaller.getAccountBalance());
    return await nearAccountCaller;
}

class NEARRoutesMainnet {
    router: Router;
    constructor() {
        this.router = Router();
        this.routes();
    }

    async getNftMetadata(req: Request, res: Response): Promise<void> {
        const receivedAccount = req.query.account?.toString() || "";
        console.log(receivedAccount);
        let listReceivedContractTyped: string[] = ["x.paras.near"];
        // const { receivedAccount, listReceivedContract } = req.body;
        // listReceivedContract.forEach( (i: string) => {
        //     listReceivedContractTyped.push(i);
        // });
        const listReceivedContractClean: string[] = FunctionsRpc.getMarketplacesClean(listReceivedContractTyped);
        const listReceivedContractNotEmpties: string[] = await FunctionsRpc.getMarketplacesNotEmpties(receivedAccount, listReceivedContractClean, await nearAccountCallerMainnet);
        const listTokens = await FunctionsRpc.getNftTokensFromListForOwnerPrivate(receivedAccount, listReceivedContractNotEmpties, await nearAccountCallerMainnet);
        res.json(listTokens);
    }

    async getNftTotalSupply(req: Request, res: Response): Promise<void> {
        const receivedContract = req.query.receivedContract?.toString() || "";
        const contract: nearAPI.Contract = getNearContract(await nearAccountCallerMainnet, receivedContract, 'nft_total_supply');
        // @ts-ignore
        const totalSupply = await contract.nft_total_supply({});
        res.json(totalSupply);
    }

   async getNftTokensForOwner(req: Request, res: Response): Promise<void> {
        const receivedAccount = req.query.account?.toString() || "";
        const receivedContract = req.query.receivedContract?.toString() || "";
        const contract: nearAPI.Contract = getNearContract(await nearAccountCallerMainnet, receivedContract, 'nft_tokens_for_owner');
        // @ts-ignore
        const tokens = await contract.nft_tokens_for_owner({
            "account_id": receivedAccount,
            "from_index": "0",
            "limit": 100
        });
        res.json(tokens);
   }

    //Funciona en testnet y en mainnet
    /* Devuelve todos los nfts de la serie requerida */
    async getNftTokensBySeries(req: Request, res: Response): Promise<void> {
        const TokenSeriesId = req.query.TokenSeriesId || "1"
            const contract: nearAPI.Contract = getNearContract(await nearAccountCallerMainnet, "x.paras.near", 'nft_tokens_by_series');
            // @ts-ignore
            const tokens = await contract.nft_tokens_by_series({
                "token_series_id": TokenSeriesId,
                "from_index": "0",
                "limit": 100
            });
            res.json(tokens);
   }

   async getNftSupplyForOwner(req: Request, res: Response): Promise<void> {
    const receivedAccount = req.query.account?.toString() || "";
    const receivedContract = req.query.receivedContract?.toString() || "";
        const contract: nearAPI.Contract = getNearContract(await nearAccountCallerMainnet, receivedContract, 'nft_supply_for_owner');
        // @ts-ignore
        const supply = await contract.nft_supply_for_owner({
            "account_id": receivedAccount
        });
        res.json(supply);
   }

   async getAllNftsFromUser(req: Request, res: Response): Promise<void> {
       const { receivedAccount, receivedContract } = req.body;
   }

   //Funciona en Mainnet y en Testnet
   /* Devuelve las series de los marketplaces */
   async getNftGetSeries(req: Request, res: Response): Promise<void> {
        const from = req.query.from || "0"
        const limit: number = Number(req.query.limit) || 100
        const contract: nearAPI.Contract = getNearContract(await nearAccountCallerMainnet, "x.paras.near", 'nft_get_series');
        // @ts-ignore
        const series = await contract.nft_get_series({
            "from_index": from,
            "limit": limit
        });
        res.json(series);
   }

   //Funciona en mainnet y testnet
   /* Devuelve un solo token solicitado por su TokenSeriesId            */
   async getNftGetSeriesSingle(req: Request, res: Response) {
        const TokenSeriesId = req.query.TokenSeriesId || "1"
        //For some reason the await is necessary here
        const contract: nearAPI.Contract = getNearContract(await nearAccountCallerMainnet, "x.paras.near", 'nft_get_series_single');
        // @ts-ignore
        const series = await contract.nft_get_series_single({
            "token_series_id": TokenSeriesId
        });
        res.json(series);
   }

    //Solo devuelve resultados de Mainnet
   /*La siguiente función no recibe ningún parámetro
   Devuelve una lista de stores en orden de creación
   especificamente devuelve lo siguiente:
   - token_id
   - owner_id de la store
   - titulo
   - media
   - tiempo de creación
   - referencia
   */
   async getLandingPageParas(req: Request, res: Response): Promise<void> {
       let listContracts: string[] = ["x.paras.near"];
    const finalMembersList = await FunctionsRpc.getLandingPageParasPrivate(await nearAccountCallerMainnet, listContracts);
    res.json(finalMembersList);
    }

    //Solo funciona en Mainnet
    //Devuelve las collecciones más vendidas por órden de volumen
    /* Devuelve lo siguiente:
    - _id del resultado
    - collection_id
    - volumen en near
    - volumen en usd
    - ventas totales
    - cartas totales
    - precio promedio near
    - precio promedio usd
    - descripción
    - id del dueño de la colección
    ejemplo:
                "_id": "61f0a9c8e0af1a189dd17416",
				"collection_id": "asac.near",
				"collection": "Antisocial Ape Club",
				"volume": "274189644148383769689990000000",
				"volume_usd": 3218059.059615341,
				"total_sales": 3868,
				"total_owners": 1239,
				"total_cards": 3329,
				"avg_price": "70886671186241925979831954",
				"avg_price_usd": 831.9697672221668,
				"description": "A collection of 3333 pixel art ape NFTs stored on the NEAR blockchain.",
				"media": "bafybeigc6z74rtwmigcoo5eqcsc4gxwkganqs4uq5nuz4dwlhjhrurofeq",
				"creator_id": "asac.near"                                           */
    async getMostSelledCollectionsParas(req: Request, res: Response): Promise<void> {
    const limit: number = Number(req.query.limit) || 10;
    res.json(await FunctionsRpc.getMostSelledCollectionsPrivate(
        (limit as number),
        ));
    }

    //Solo devuelve resultados de Mainnet
    /*La siguiente función no recibe ningún parámetro
    pero devuelve una lista de las principales stores
    de mintbase, especificamente devuelve lo siguiente:
    - El nombre de la store
    - El total de valor de las ventas
    - El contrato de la store
    - El account dueño de la store                  */
    async getLandingPageMintbase(req: Request, res: Response) {
        const landingPage = await FunctionsRpc.getLandingPageMintbasePrivate(100);
        res.json(landingPage);
    }
    
    async getLandingPageHiggsField(req: Request, res: Response) {
        const landingPage = await FunctionsRpc.getLandingPageHiggsFieldPrivate();
        res.json(landingPage);
    }

    async getNftToken(req: Request, res: Response) {
        const { contract, id } = req.query as { contract: string, id: string };
        const response = await FunctionsRpc.getNftTokenPrivate(await nearAccountCallerMainnet, contract, id)
        res.send(response);
        // res.json({
        //     "token_id": id,
        //     "owner_id": contract,
        //     "response": response
        // })
    }

    routes() {
        //Añadir parametro contract: ?receivedContract=x.paras.near
        this.router.get('/getSupply', this.getNftTotalSupply);
        
        //Añadir parametros account y contract: ?account=jeph.near&receivedContract=x.paras.near
        this.router.get('/getTokens', this.getNftTokensForOwner);

        //Añadir parametros account y contract: ?account=jeph.near&receivedContract=x.paras.near
        this.router.get('/getSupplyForOwner', this.getNftSupplyForOwner);

        //Añadir parametro query al final: ?account={NEARACCOUNT}
        this.router.get('/getMetadata', this.getNftMetadata);

        /* Añadir 2 parametros query al final: ?from={CAULQUIERNUMEROVALIDO}&limit={CUALQUIERNUMEROVALIDO} */
        this.router.get('/getNftGetSeries', this.getNftGetSeries);
        
        /* Añadir 1 parametro query al final: ?TokenSeriesId={CUALQUIERNUMEROVALIDO}*/
        this.router.get('/getNftGetSeriesSingle', this.getNftGetSeriesSingle);

        //Añadir 1 parametro query al final: ?TokenSeriesId={CUALQUIERNUMEROVALIDO}
        this.router.get('/getNftTokensBySeries', this.getNftTokensBySeries);

        this.router.get('/getLandingPageParas', this.getLandingPageParas);

        this.router.get('/getLandingPageMintbase', this.getLandingPageMintbase);

        this.router.get('/getLandingPageHiggsField', this.getLandingPageHiggsField);

        //Añadir ?limit={CUALQUIERNUMEROVALIDO}
        this.router.get('/getMostSelledCollections', this.getMostSelledCollectionsParas);

        //Añadir ?contract={el contrato de la store}&id={el id del token}
        this.router.get('/nftToken', this.getNftToken);
    }
}

const nearRoutesMainnet = new NEARRoutesMainnet();
export default nearRoutesMainnet.router;