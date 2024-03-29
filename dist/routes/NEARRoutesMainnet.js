"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const near_api_js_1 = require("near-api-js");
const express_1 = require("express");
//import { BrowserLocalStorageKeyStore } from 'near-api-js/lib/key_stores'
const { networkId, nodeUrl, walletUrl, helperUrl, contractName } = (0, config_1.getConfig)(process.env.NODE_ENV || 'mainnet');
const functionsRpc_1 = require("../utils/functionsRpc");
const server_1 = require("../server");
const near = new near_api_js_1.Near({
    networkId,
    keyStore: new near_api_js_1.keyStores.InMemoryKeyStore(),
    nodeUrl,
    walletUrl,
    helperUrl,
    headers: {}
});
module.exports.nearAccountCallerMainnet = async function nearAccountCallerMainnet() {
    const nearAccountCaller = await near.account(contractName);
    console.log('nearAccountCallerMainnet', await nearAccountCaller.getAccountBalance());
    return await nearAccountCaller;
};
class NEARRoutesMainnet {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    async getNftMetadata(req, res) {
        var _a;
        const receivedAccount = ((_a = req.query.account) === null || _a === void 0 ? void 0 : _a.toString()) || "";
        console.log(receivedAccount);
        let listReceivedContractTyped = ["x.paras.near"];
        // const { receivedAccount, listReceivedContract } = req.body;
        // listReceivedContract.forEach( (i: string) => {
        //     listReceivedContractTyped.push(i);
        // });
        const listReceivedContractClean = functionsRpc_1.FunctionsRpc.getMarketplacesClean(listReceivedContractTyped);
        const listReceivedContractNotEmpties = await functionsRpc_1.FunctionsRpc.getMarketplacesNotEmpties(receivedAccount, listReceivedContractClean, await server_1.nearAccountCallerMainnet);
        const listTokens = await functionsRpc_1.FunctionsRpc.getNftTokensFromListForOwnerPrivate(receivedAccount, listReceivedContractNotEmpties, await server_1.nearAccountCallerMainnet);
        res.json(listTokens);
    }
    async getNftTotalSupply(req, res) {
        var _a;
        const receivedContract = ((_a = req.query.receivedContract) === null || _a === void 0 ? void 0 : _a.toString()) || "";
        const contract = (0, server_1.getNearContract)(await server_1.nearAccountCallerMainnet, receivedContract, 'nft_total_supply');
        // @ts-ignore
        const totalSupply = await contract.nft_total_supply({});
        res.json(totalSupply);
    }
    async getNftTokensForOwner(req, res) {
        var _a, _b;
        const receivedAccount = ((_a = req.query.account) === null || _a === void 0 ? void 0 : _a.toString()) || "";
        const receivedContract = ((_b = req.query.receivedContract) === null || _b === void 0 ? void 0 : _b.toString()) || "";
        const contract = (0, server_1.getNearContract)(await server_1.nearAccountCallerMainnet, receivedContract, 'nft_tokens_for_owner');
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
    async getNftTokensBySeries(req, res) {
        const TokenSeriesId = req.query.TokenSeriesId || "1";
        const contract = (0, server_1.getNearContract)(await server_1.nearAccountCallerMainnet, "x.paras.near", 'nft_tokens_by_series');
        // @ts-ignore
        const tokens = await contract.nft_tokens_by_series({
            "token_series_id": TokenSeriesId,
            "from_index": "0",
            "limit": 100
        });
        res.json(tokens);
    }
    async getNftSupplyForOwner(req, res) {
        var _a, _b;
        const receivedAccount = ((_a = req.query.account) === null || _a === void 0 ? void 0 : _a.toString()) || "";
        const receivedContract = ((_b = req.query.receivedContract) === null || _b === void 0 ? void 0 : _b.toString()) || "";
        const contract = (0, server_1.getNearContract)(await server_1.nearAccountCallerMainnet, receivedContract, 'nft_supply_for_owner');
        // @ts-ignore
        const supply = await contract.nft_supply_for_owner({
            "account_id": receivedAccount
        });
        res.json(supply);
    }
    async getAllNftsFromUser(req, res) {
        const { receivedAccount, receivedContract } = req.body;
    }
    //Funciona en Mainnet y en Testnet
    /* Devuelve las series de los marketplaces */
    async getNftGetSeries(req, res) {
        const from = req.query.from || "0";
        const limit = Number(req.query.limit) || 100;
        const contract = (0, server_1.getNearContract)(await server_1.nearAccountCallerMainnet, "x.paras.near", 'nft_get_series');
        // @ts-ignore
        const series = await contract.nft_get_series({
            "from_index": from,
            "limit": limit
        });
        res.json(series);
    }
    //Funciona en mainnet y testnet
    /* Devuelve un solo token solicitado por su TokenSeriesId            */
    async getNftGetSeriesSingle(req, res) {
        const TokenSeriesId = req.query.TokenSeriesId || "1";
        //For some reason the await is necessary here
        const contract = (0, server_1.getNearContract)(await server_1.nearAccountCallerMainnet, "x.paras.near", 'nft_get_series_single');
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
    async getLandingPageParas(req, res) {
        let listContracts = ["x.paras.near"];
        const finalMembersList = await functionsRpc_1.FunctionsRpc.getLandingPageParasPrivate(await server_1.nearAccountCallerMainnet, listContracts);
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
    async getMostSelledCollectionsParas(req, res) {
        const limit = Number(req.query.limit) || 10;
        res.json(await functionsRpc_1.FunctionsRpc.getMostSelledCollectionsPrivate(limit));
    }
    //Solo devuelve resultados de Mainnet
    /*La siguiente función no recibe ningún parámetro
    pero devuelve una lista de las principales stores
    de mintbase, especificamente devuelve lo siguiente:
    - El nombre de la store
    - El total de valor de las ventas
    - El contrato de la store
    - El account dueño de la store                  */
    async getLandingPageMintbase(req, res) {
        const landingPage = await functionsRpc_1.FunctionsRpc.getLandingPageMintbasePrivate(100);
        res.json(landingPage);
    }
    async getLandingPageHiggsField(req, res) {
        const landingPage = await functionsRpc_1.FunctionsRpc.getLandingPageHiggsFieldPrivate();
        res.json(landingPage);
    }
    async getNftToken(req, res) {
        const { contract, id } = req.query;
        const response = await functionsRpc_1.FunctionsRpc.getNftTokenPrivate(await server_1.nearAccountCallerMainnet, contract, id);
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
exports.default = nearRoutesMainnet.router;
