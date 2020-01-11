/**
 * @version 0.5
 */
import TronUtils from './ext/TronUtils'

export default class TrxAddressProcessor {
    /**
     * @param {string|Buffer} privateKey
     * @param {*} data
     * @returns {Promise<{privateKey: string, address: string, addedData: *}>}
     */
    async getAddress(privateKey, data = {}) {
        let pubKey = TronUtils.privHexToPubHex(privateKey)
        let addressHex = TronUtils.pubHexToAddressHex(pubKey)
        let address = TronUtils.addressHexToStr(addressHex)
        return { address, privateKey : privateKey.toString('hex'), addedData: {addressHex, pubKey} }
    }
}
