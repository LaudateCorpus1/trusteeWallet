/**
 * @version 0.43
 */
import React from 'react'
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native'
import _isEqual from 'lodash/isEqual'
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'

import GradientView from '@app/components/elements/GradientView'
import CurrencyIcon from '@app/components/elements/CurrencyIcon'
import LetterSpacing from '@app/components/elements/LetterSpacing'
import Loader from '@app/components/elements/LoaderItem'

import { showModal } from '@app/appstores/Stores/Modal/ModalActions'

import { ThemeContext } from '@app/theme/ThemeProvider'

import Log from '@app/services/Log/Log'
import Toast from '@app/services/UI/Toast/Toast'
import copyToClipboard from '@app/services/UI/CopyToClipboard/CopyToClipboard'
import checkTransferHasError from '@app/services/UI/CheckTransferHasError/CheckTransferHasError'

import BlocksoftPrettyStrings from '@crypto/common/BlocksoftPrettyStrings'
import BlocksoftPrettyNumbers from '@crypto/common/BlocksoftPrettyNumbers'

import { strings } from '@app/services/i18n'

import NavStore from '@app/components/navigation/NavStore'
import CustomIcon from '@app/components/elements/CustomIcon'
import { HIT_SLOP } from '@app/theme/HitSlop'
import trusteeAsyncStorage from '@appV2/services/trusteeAsyncStorage/trusteeAsyncStorage'

import { getExplorerLink } from '../helpers'

class HeaderBlocks extends React.Component {

    shouldComponentUpdate(nextProps) {
        return !_isEqual(this.props, nextProps)
    }


    handleOpenLink = async (address, forceLink = false) => {
        const now = new Date().getTime()
        const diff = now - this.props.cacheAsked * 1
        if (!this.props.cacheAsked || diff > 10000) {
            showModal({
                type: 'YES_NO_MODAL',
                title: strings('account.externalLink.title'),
                icon: 'WARNING',
                description: strings('account.externalLink.description')
            }, () => {
                trusteeAsyncStorage.setExternalAsked(now + '')
                this.props.cacheAsked = now
                this.actualOpen(address, forceLink)
            })
        } else {
            this.actualOpen(address, forceLink)
        }
    }

    actualOpen = async (address, forceLink = false) => {
        const { currencyCode } = this.props.cryptoCurrency

        const actualLink = forceLink || getExplorerLink(currencyCode, 'address', address)
        try {
            let linkUrl = actualLink
            if (linkUrl.indexOf('?') === -1) {
                linkUrl += '?from=trustee'
            }
            Linking.openURL(linkUrl)
        } catch (e) {
            Log.err('Account.AccountScreen open URI error ' + e.message + ' ' + actualLink)
        }

    }

    handleBtcAddressCopy = (address) => {
        const { cryptoCurrency, account } = this.props
        const { walletHash } = account
        const { currencyCode, currencySymbol } = cryptoCurrency
        checkTransferHasError({
            walletHash,
            currencyCode,
            currencySymbol,
            addressFrom: address,
            addressTo: address
        })
        copyToClipboard(address)
        Toast.setMessage(strings('toast.copied')).show()
    }

    renderBalance = () => {

        const { colors, GRID_SIZE } = this.context

        const { isBalanceVisible, isBalanceVisibleTriggered, triggerBalanceVisibility, originalVisibility, account } = this.props
        const finalIsBalanceVisible = isBalanceVisibleTriggered ? isBalanceVisible : originalVisibility

        const { isSynchronized, balancePretty, basicCurrencySymbol, basicCurrencyBalance } = account

        let tmp = BlocksoftPrettyNumbers.makeCut(balancePretty, 7, 'AccountScreen/renderBalance').separated
        if (typeof tmp.split === 'undefined') {
            throw new Error('AccountScreen.renderBalance split is undefined')
        }

        tmp = tmp.slice(0, 11)
        const tmps = tmp.split('.')
        let balancePrettyPrep1 = tmps[0]
        let balancePrettyPrep2 = ''
        if (typeof tmps[1] !== 'undefined' && tmps[1]) {
            balancePrettyPrep1 = tmps[0] + '.'
            balancePrettyPrep2 = tmps[1]
        }

        if (isSynchronized) {
            return (
                <View style={{ ...styles.topContent__top, marginHorizontal: GRID_SIZE }}>
                    <View style={{ ...styles.topContent__title, flexGrow: 1 }}>
                        <TouchableOpacity
                            onPressIn={() => triggerBalanceVisibility(true, originalVisibility)}
                            onPressOut={() => triggerBalanceVisibility(false, originalVisibility)}
                            activeOpacity={1}
                            disabled={originalVisibility}
                            hitSlop={{ top: 10, right: finalIsBalanceVisible ? 60 : 30, bottom: 10, left: finalIsBalanceVisible ? 60 : 30 }}
                        >
                            {finalIsBalanceVisible ? (
                                <Text style={{ ...styles.topContent__title_first, color: colors.common.text1 }} numberOfLines={1} >
                                    {balancePrettyPrep1}
                                    <Text style={{ ...styles.topContent__title_last, color: colors.common.text1 }}>
                                        {balancePrettyPrep2}
                                    </Text>
                                </Text>
                            ) : (
                                <Text style={{ ...styles.topContent__title_last, color: colors.common.text1, marginTop: 10, paddingHorizontal: 15, fontSize: 52, lineHeight: 60 }}>
                                    ****
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    {finalIsBalanceVisible && (
                        <LetterSpacing
                            text={basicCurrencySymbol + ' ' + basicCurrencyBalance}
                            textStyle={{ ...styles.topContent__subtitle, color: colors.common.text2 }}
                            letterSpacing={.5}
                        />
                    )}
                </View>
            )
        } else {
            return (
                <View style={styles.topContent__top}>
                    <View style={styles.topContent__title}>
                        <View style={{ height: Platform.OS === 'ios' ? 46 : 51, alignItems: 'center' }}>
                            <Loader size={30} color={colors.accountScreen.loaderColor} />
                        </View>
                    </View>
                </View>
            )
        }
    }

    handleSettingAccount = (currencyCode) => {

        const { colors } = this.context

        return (
            <TouchableOpacity style={{ flex: 1, paddingLeft: 23 }} onPress={() => this.accountSetting(currencyCode)} hitSlop={HIT_SLOP}>
                <View style={{ paddingVertical: 12 }}>
                    <CustomIcon name={'coinSettings'} size={20} color={colors.common.text1} />
                </View>
            </TouchableOpacity>
        )
    }

    accountSetting = (currencyCode) => {
        if (currencyCode === 'FIO') {
            NavStore.goNext('FioMainSettings')
        } else {
            NavStore.goNext('AccountSettings', { account : currencyCode })
        }
    }

    settings = (currencyCode) => {
        switch (currencyCode) {
            case 'BTC':
            case 'USDT':
            case 'XVG':
            case 'ETC':
            case 'ETH':
            case 'FIO':
            case 'XMR':
            case 'TRX':
            case 'BNB':
            case 'SOL':
                return this.handleSettingAccount(currencyCode)
            default:
                return null
        }
    }

    render() {
        const { colors } = this.context

        let { account, cryptoCurrency, isSegwit } = this.props
        const { shownAddress, walletPubs } = account
        const { currencyCode, currencySymbol } = cryptoCurrency
        let forceLink = false
        if (currencyCode === 'BTC' && walletPubs) {
            isSegwit = isSegwit ? 'btc.84' : 'btc.44'
            if (typeof walletPubs[isSegwit] !== 'undefined' && walletPubs[isSegwit].walletPubValue) {
                forceLink = 'https://blockchair.com/bitcoin/xpub/' + walletPubs[isSegwit].walletPubValue
            }
        }

        const addressPrep = BlocksoftPrettyStrings.makeCut(shownAddress, 6, 6)

        return (
            <View style={styles.topContent}>
                <View style={styles.topContent__content}>
                    <View style={{ flexDirection: 'row' }} >
                        <View style={{ marginTop: 16 }}>
                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => this.handleOpenLink(shownAddress, forceLink)}
                            >
                                <View style={{ width: 50, height: 50 }}>
                                    <GradientView
                                        style={styles.topContent__icon}
                                        array={colors.accountScreen.containerBGIcon}
                                        start={styles.containerBG.start}
                                        end={styles.containerBG.end}
                                    />
                                    <View style={styles.icon}>
                                        <CurrencyIcon
                                            currencyCode={currencyCode}
                                            containerStyle={{ borderWidth: 0 }}
                                            markStyle={{ top: 30 }}
                                            textContainerStyle={{ bottom: -19 }}
                                            textStyle={{ backgroundColor: 'transparent' }}
                                        />
                                    </View>
                                    <View style={styles.topContent__bottom__btn__shadow}>
                                        <View style={styles.topContent__bottom__btn__shadow__item} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 22 }}>
                            <Text style={{ ...styles.currencyName, color: colors.common.text1 }}>{currencySymbol}</Text>
                            <TouchableOpacity
                                style={styles.topContent__middle}
                                onPress={() => this.handleBtcAddressCopy(shownAddress)}
                                hitSlop={HIT_SLOP}
                            >
                                <View style={{ alignItems: 'center' }}>
                                    <LetterSpacing text={addressPrep} textStyle={styles.topContent__address} letterSpacing={1} />
                                </View>
                                <View onPress={() => this.handleBtcAddressCopy(shownAddress)} style={styles.copyBtn}>
                                    <IconMaterial name="content-copy" size={15} color={'#939393'} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ ...styles.settings, right: 0, position: 'absolute' }}>
                            {this.settings(currencyCode)}
                        </View>
                    </View>
                    {this.renderBalance()}
                </View>
                <GradientView
                    style={styles.bg}
                    array={colors.accountScreen.containerBG}
                    start={styles.containerBG.start}
                    end={styles.containerBG.end}
                />
                <View style={styles.topContent__bg}>
                    <View style={{ ...styles.shadow, backgroundColor: colors.accountScreen.headBlockBackground }} />
                </View>
            </View>
        )
    }
}

HeaderBlocks.contextType = ThemeContext

export default HeaderBlocks

const styles = {
    linkButton: {
        position: 'relative',
        padding: 20,
        paddingTop: 0,
        alignItems: 'center',
    },
    containerBG: {
        start: { x: 0.0, y: 0 },
        end: { x: 0, y: 1 }
    },
    bg: {
        position: 'absolute',
        top: 0,
        left: 0,

        width: '100%',
        height: 216,

        zIndex: 1,

        borderRadius: 16,
    },

    topContent: {
        position: 'relative',

        height: 244,

        marginTop: 25,
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 16
    },
    topContent__top: {
        position: 'relative',
        alignItems: 'center',
    },
    currencyName: {
        flexDirection: 'row',
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
    },
    topBlock__top_bg: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: 140,
    },
    topContent__title: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 16,
    },
    topContent__subtitle: {
        marginTop: -10,
        fontFamily: 'SFUIDisplay-SemiBold',
        fontSize: 14,
        textAlign: 'center'
    },
    topContent__title_first: {
        height: 42,
        fontSize: 52,
        fontFamily: 'Montserrat-Regular',
        lineHeight: 50
    },
    topContent__title_last: {
        height: 42,
        fontSize: 32,
        fontFamily: 'Montserrat-Medium',
        lineHeight: 50,
        opacity: 1,
    },
    topContent__bottom: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Platform.OS === 'ios' ? -20 : -30,
        overflow: 'visible'
    },
    topContent__middle: {
        flexDirection: 'row',
        paddingTop: 4,
    },
    topContent__address: {
        marginBottom: 3,
        fontFamily: 'SFUIDisplay-Bold',
        fontSize: 14,
        color: '#999999'
    },
    segwitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 74,
        paddingLeft: 50,
        paddingRight: 50,
        marginTop: -35
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginLeft: 10
    },
    copyBtn__text: {
        marginTop: 6,
        marginRight: 7,
        fontFamily: 'Montserrat-Bold',
        fontSize: 10,
        color: '#864dd9'
    },
    copyBtn__icon: {
        marginTop: 7
    },
    shadow: {
        marginTop: 10,
        marginHorizontal: 5,

        height: '100%',
        borderRadius: 16,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,

        elevation: 10
    },
    topContent__content: {
        position: 'relative',
        zIndex: 2,
    },
    topContent__tag: {
        position: 'absolute',
        top: 0,
        right: 0,

        paddingLeft: 30,
        paddingBottom: 30,
        zIndex: 1
    },
    topContent__content__tag: {
        alignItems: 'center',

        width: 70,
        paddingVertical: 5,

        backgroundColor: '#8D51E4',
        borderTopRightRadius: 16,
        borderBottomLeftRadius: 16,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5
    },
    topContent__tag__text: {
        fontFamily: 'Montserrat-Semibold',
        fontSize: 12,
        color: '#f4f4f4'
    },
    topContent__bg: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 206,
        borderRadius: 16,

        zIndex: 0
    },
    topContent__icon: {
        position: 'relative',

        width: 50,
        height: 50,

        borderRadius: 30,

        zIndex: 1
    },
    topContent__bottom__btn: {

        justifyContent: 'center',
        alignItems: 'center',

        width: 50,
        height: 50,

        borderRadius: 50
    },
    topContent__bottom__btn__white: {
        position: 'absolute',
        top: 0,
        left: 0,

        width: 50,
        height: 50,

        backgroundColor: '#fff',
        borderRadius: 50,

        zIndex: 1
    },
    topContent__bottom__btn__wrap: {
        position: 'relative',

        width: 50,
        height: 50,

        borderRadius: 50,

        zIndex: 2
    },
    topContent__bottom__btn__line: {
        width: 16,
        height: 1.5,

        marginTop: 2,

        backgroundColor: '#864DD9'
    },
    topContent__bottom__btn__shadow: {
        position: 'absolute',
        top: 2,
        // left: 3,

        width: 40,
        height: 40,

        zIndex: 0,

        borderRadius: 30
    },
    topContent__bottom__btn__shadow__item: {
        width: 50,
        height: 46,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,

        backgroundColor: '#fff',
        borderRadius: 100,

        zIndex: 0
    },
    topContent__bottom__btn__text: {
        marginTop: 5,

        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontFamily: 'SFUIDisplay-Regular'
    },
    icon: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 3
    },
    settings: {
        marginRight: 20,
        marginTop: 10
    }
}
