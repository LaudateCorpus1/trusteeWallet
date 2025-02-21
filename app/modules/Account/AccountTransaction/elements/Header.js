import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import Feather from 'react-native-vector-icons/Feather'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import LetterSpacing from '@app/components/elements/LetterSpacing'

import { capitalize } from '@app/services/UI/Capitalize/Capitalize'
import { strings } from '@app/services/i18n'
import { useTheme } from '@app/theme/ThemeProvider'


const getTransactionDate = (transaction) => {
    const datetime = new Date(transaction.createdAt)
    return datetime.toTimeString().slice(0, 8) + ' ' +
        (datetime.getDate().toString().length === 1 ? '0' + datetime.getDate() : datetime.getDate()) + '/' +
        ((datetime.getMonth() + 1).toString().length === 1 ? '0' + (datetime.getMonth() + 1) : (datetime.getMonth() + 1)) + '/' + datetime.getFullYear()
}

const prepareStatusHeaderToView = (status) => {
    return strings(`account.transactionScreen.header.status.${status.toLowerCase()}`).toUpperCase()
}

const HeaderTx = (props) => {

    const { transaction, color, cryptoCurrency, notification } = props

    if (Object.keys(transaction).length === 0) {
        return (
            <View></View>
        )
    }

    const { colors, GRID_SIZE } = useTheme()

    const { transactionDirection, addressAmountPretty, addressAmountPrettyPrefix, wayType, transactionVisibleStatus } = transaction

    const currencySymbol = typeof cryptoCurrency !== 'undefined' ? cryptoCurrency.currencySymbol : ''

    let status = transactionVisibleStatus

    let arrowIcon = <Feather name={'arrow-up-right'} style={{ color: colors.common.text1, fontSize: 17 }} />

    if (transactionDirection === 'income' || transactionDirection === 'claim' || transactionDirection === 'swap_income') {
        arrowIcon = <Feather name={'arrow-down-left'} style={{ color: colors.common.text1, fontSize: 17 }} />
    }
    if (transactionDirection === 'self') {
        arrowIcon = <FontAwesome5 name='infinity' style={{ color: colors.common.text1, fontSize: 17 }} />
    }
    // if (transactionStatus === 'fail' || transactionStatus === 'missing' || transactionStatus === 'replaced') {
    //     arrowIcon = <Feather name='x' style={{ color: colors.common.text1, fontSize: 17 }} />
    // }

    let amountTxt = addressAmountPrettyPrefix + ' ' + addressAmountPretty
    let statusTxt = strings('account.transaction.' + wayType.toLowerCase())
    if (addressAmountPretty === '?') {
        if (transaction.bseOrderData) {
            amountTxt = '#' + transaction.bseOrderData.orderHash
        }
        if (notification && notification.title) {
            statusTxt = notification.title
            if (notification.newsName === 'ORDER_SUCCESS') {
                status = 'SUCCESS' // @hard fix todo remove
            }
        }
    }
    return (
        <View style={[styles.wrapper, { paddingBottom: GRID_SIZE }]}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ ...styles.txDirection, color: colors.common.text1 }}>
                    {capitalize(statusTxt)}
                </Text>
                <View>
                    {arrowIcon}
                </View>
            </View>
            <View style={{ paddingVertical: 8 }}>
                <Text
                    style={styles.date}>{getTransactionDate(transaction)}</Text>
            </View>
            <View style={styles.statusWrapper}>
                <View style={{ ...styles.statusLine, borderBottomColor: color }} />
                <View style={{ paddingHorizontal: 17, backgroundColor: colors.common.header.bg }}>
                    <View style={{ ...styles.statusBlock, backgroundColor: color }}>
                        <LetterSpacing text={prepareStatusHeaderToView(status)}
                            textStyle={{ ...styles.status, color: colors.transactionScreen.status }} letterSpacing={1.5} />
                    </View>
                </View>
            </View>
            <View style={styles.topContent__title}>
                <>
                    <Text style={{ ...styles.amount, color: colors.common.text1 }}>
                        {amountTxt}
                    </Text>
                    <Text style={{ ...styles.code, color: color }}>{currencySymbol}</Text>
                </>
            </View>

        </View>
    )

}

export default HeaderTx

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
    },
    txDirection: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        lineHeight: 17,
        paddingRight: 4
    },
    date: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        lineHeight: 14,
        color: '#999999'
    },
    statusLine: {
        position: 'absolute',
        borderBottomWidth: 1.5,
        width: '100%',
        top: 14
    },
    statusBlock: {
        height: 30,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        minWidth: 120,
        maxWidth: 180
    },
    topContent__title: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -6,
        marginTop: 6
    },
    amount: {
        fontSize: 32,
        fontFamily: 'Montserrat-Medium'
    },
    code: {
        fontSize: 20,
        fontFamily: 'Montserrat-Medium',
        marginBottom: -8,
        paddingLeft: 6
    },
    status: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 12
    },
    statusWrapper: {
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
    }
})
