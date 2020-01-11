/**
 * @version 0.5
 */
import BlocksoftCryptoLog from '../../common/BlocksoftCryptoLog'
import EthScannerProcessor from './EthScannerProcessor'

const abi = require('./ext/erc20.js')

export default class EthScannerProcessorErc20 extends EthScannerProcessor {

    constructor(settings) {
        super(settings)
        // noinspection JSUnusedGlobalSymbols
        this._etherscanApiPath = `https://api${this._etherscanSuffix}.etherscan.io/api?module=account&action=tokentx&sort=desc&contractaddress=${settings.tokenAddress}&apikey=YourApiKeyToken`
        // noinspection JSUnresolvedVariable
        this._token = new this._web3.eth.Contract(abi.ERC20, settings.tokenAddress)
    }

    /**
     * @param {string} address
     * @return {Promise<{balance, unconfirmed, provider}>}
     */
    async getBalance(address) {
        // noinspection JSUnresolvedVariable
        let balance = await this._token.methods.balanceOf(address).call()
        BlocksoftCryptoLog.log('EthScannerProcessorErc20.getBalance finished', address + ' => ' + balance)
        return {balance, unconfirmed : 0, provider : 'etherscan'}
    }
}
