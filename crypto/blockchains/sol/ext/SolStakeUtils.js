/**
 * @version 0.52
 */
import BlocksoftAxios from '@crypto/common/BlocksoftAxios'
import BlocksoftExternalSettings from '@crypto/common/BlocksoftExternalSettings'

import config from '@app/config/config'
import BlocksoftCryptoLog from '@crypto/common/BlocksoftCryptoLog'
import BlocksoftUtils from '@crypto/common/BlocksoftUtils'


const CACHE_STAKED = {}
const CACHE_VOTES = {
    data: [],
    time: 0
}
const CACHE_VALID_TIME = 12000000 // 200 minute

const validatorsConstants = require('@crypto/blockchains/sol/ext/validators')
const validators = {}
for (const tmp of validatorsConstants) {
    validators[tmp.id] = tmp
}

export default {


    // https://docs.solana.com/developing/clients/jsonrpc-api#getvoteaccounts
    async getVoteAddresses() {
        try {
            const now = new Date().getTime()
            if (CACHE_VOTES.time && now - CACHE_VOTES.time < CACHE_VALID_TIME) {
                return CACHE_VOTES.data
            }

            const apiPath = BlocksoftExternalSettings.getStatic('SOL_SERVER')
            const getVote = { 'jsonrpc': '2.0', 'id': 1, 'method': 'getVoteAccounts' }
            const resVote = await BlocksoftAxios._request(apiPath, 'POST', getVote)
            if (!resVote || typeof resVote.data === 'undefined' || typeof resVote.data.result === 'undefined' || !resVote.data.result || typeof resVote.data.result.current === 'undefined') {
                return CACHE_VOTES.data
            }
            CACHE_VOTES.data = []
            for (const tmp of resVote.data.result.current) {
                const validator = { address: tmp.votePubkey, commission: tmp.commission, activatedStake: tmp.activatedStake, name : '', description : '', website : '' }
                if (typeof validators[validator.address] !== 'undefined') {
                    validator.name = validators[validator.address].name
                    validator.description = validators[validator.address].description
                    validator.website = validators[validator.address].website
                }
                CACHE_VOTES.data.push(validator)
            }
            CACHE_VOTES.data.sort((a, b) => {
                const diff = a.commission - b.commission
                if (diff <= 0.1 && diff >= -0.1) {
                    return b.activatedStake - a.activatedStake
                }
                return diff
            })
            CACHE_VOTES.time = now
        } catch (e) {
            if (config.debug.cryptoErrors) {
                console.log('SolStakeUtils.getVoteAddresses error ' + e.message)
            }
            BlocksoftCryptoLog.log('SolStakeUtils.getVoteAddresses  error ' + e.message)
        }
        return CACHE_VOTES.data
    },

    checkAccountStaked(address, subaddress) {
        return typeof CACHE_STAKED[address].all[subaddress] !== 'undefined'
    },

    setAccountStaked(address, subaddress) {
        CACHE_STAKED[address].all[subaddress] = true
    },

    // https://docs.solana.com/developing/clients/jsonrpc-api#getprogramaccounts
    async getAccountStaked(address, isForce = false) {
        let accountInfo = false
        if (typeof CACHE_STAKED[address] === 'undefined' || isForce) {
            CACHE_STAKED[address] = {
                all: {},
                active: []
            }
        }
        try {
            const apiPath = BlocksoftExternalSettings.getStatic('SOL_SERVER')

            const getEpoch = { 'jsonrpc': '2.0', 'id': 1, 'method': 'getEpochInfo' }
            const resEpoch = await BlocksoftAxios._request(apiPath, 'POST', getEpoch)
            const currentEpoch = resEpoch.data.result.epoch || 0

            const checkData = {
                'jsonrpc': '2.0',
                'id': 1,
                'method': 'getProgramAccounts',
                'params': [
                    'Stake11111111111111111111111111111111111111',
                    {
                        'encoding': 'jsonParsed',
                        filters:
                            [{
                                memcmp: {
                                    offset: 0xc,
                                    bytes: address
                                }
                            }]
                    }
                ]
            }
            const res = await BlocksoftAxios._request(apiPath, 'POST', checkData)

            accountInfo = []
            for (const tmp of res.data.result) {
                const parsed = tmp.account.data.parsed
                const item = { amount: tmp.account.lamports, stakeAddress: tmp.pubkey, reserved: 0, active: true, status: '' }
                if (typeof parsed.info !== 'undefined') {
                    if (typeof typeof parsed.info.meta !== 'undefined') {
                        if (typeof parsed.info.meta.rentExemptReserve !== 'undefined') {
                            item.reserved = parsed.info.meta.rentExemptReserve
                        }
                    }
                    const deactivationEpoch = parsed.info.stake.delegation.deactivationEpoch || 0
                    const activationEpoch = parsed.info.stake.delegation.activationEpoch || 0
                    if (currentEpoch && currentEpoch * 1 >= deactivationEpoch * 1) {
                        item.order = 1
                        item.active = false
                        item.status = 'inactive'
                    } else if (currentEpoch && currentEpoch === activationEpoch) {
                        item.order = 3
                        item.status = 'activating'
                    } else {
                        item.order = 2
                        item.status = 'staked'
                    }
                }
                item.diff = BlocksoftUtils.diff(item.amount, item.reserved).toString()
                accountInfo.push(item)
                CACHE_STAKED[address].all[item.stakeAddress] = true
            }
            accountInfo.sort((a, b) => {
                if (b.order === a.order) {
                    return BlocksoftUtils.diff(b.diff, a.diff) * 1
                } else {
                    return b.order - a.order
                }
            })
            CACHE_STAKED[address].active = accountInfo
        } catch (e) {
            if (config.debug.cryptoErrors) {
                console.log('SolStakeUtils.getAccountStaked ' + address + ' error ' + e.message)
            }
            BlocksoftCryptoLog.log('SolStakeUtils.getAccountStaked ' + address + ' error ' + e.message)
            return CACHE_STAKED[address].active
        }
        return accountInfo
    }
}
