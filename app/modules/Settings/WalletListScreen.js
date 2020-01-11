import React, { Component } from 'react'

import { connect } from 'react-redux'

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native'

import GradientView from "../../components/elements/GradientView"

import AntDesign from "react-native-vector-icons/MaterialCommunityIcons"
import IoniconsIcons from "react-native-vector-icons/Ionicons"

import cryptoWalletActions from '../../appstores/Actions/CryptoWalletActions'

import { strings } from '../../services/i18n'

import Navigation from "../../components/navigation/Navigation"
import firebase from "react-native-firebase"

class WalletListScreen extends Component {

    constructor(props){
        super(props)
        this.state = {}
    }

    componentDidMount() {
        console.log(' WalletListScreen.props.settings')
        console.log(this.props.settings)
    }

    setCryptoWallet = async (item) => {

        const { wallet_hash: walletHash } = item

        cryptoWalletActions.setSelectedWallet(walletHash)

    }

    render() {
        firebase.analytics().setCurrentScreen('Settings.WalletListScreen')

        const { selectedWallet } = this.props.main

        return (
            <GradientView style={styles.wrapper} array={styles_.array} start={styles_.start} end={styles_.end}>
                <Navigation
                    title={ strings('settings.walletList.title') }
                />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.wrapper__scrollView}>
                    <View style={styles.wrapper__content}>
                        <View style={styles.block}>
                                {
                                    this.props.main.wallets.map((item, index) => {
                                        return (
                                            <View style={styles.block__content} key={index}>
                                                <TouchableOpacity
                                                    style={{...styles.block__item}}
                                                    onPress={() => this.setCryptoWallet(item)}
                                                    key={index}
                                                    disabled={item.wallet_hash === selectedWallet.wallet_hash}>
                                                    <View style={styles.block__item__content}>
                                                        <Text style={styles.block__text}>{ item.wallet_name }</Text>
                                                    </View>
                                                    <View style={checkBox.styleBox}>
                                                        { item.wallet_hash === selectedWallet.wallet_hash ?  <View style={{ position: 'relative', top: Platform.OS === 'ios' ? 0 : 0 }}><IoniconsIcons name='ios-checkmark' size={30} color='#7127ac' /></View>: null }
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    })
                                }
                        </View>
                    </View>
                </ScrollView>
            </GradientView>
        )
    }
}

const styles_ = {
    array: ["#fff","#F8FCFF"],
    start: { x: 0.0, y: 0 },
    end: { x: 0, y: 1 }
}

const checkBox = {
    array: ["#f9f9f9","#f9f9f9"],
    array_: ["#43156d","#7027aa"],
    start: { x: 0.0, y: 0 },
    end: { x: 0, y: 1 },
    styleBox: {
        alignItems: 'center',

        width: 30,
        height: 30,
    },
    styleGradient: {
        width: 20,
        height: 20,
        borderRadius: 4
    }
}

const mapStateToProps = (state) => {
    return {
        main: state.mainStore,
        settings: state.settingsStore
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletListScreen)

const styles = StyleSheet.create({
    wrapper: {
        flex: 1
    },
    wrapper__scrollView: {
        marginTop: 80,
    },
    wrapper__top: {
        height: 145,
        marginBottom: 35
    },
    wrapper__bg: {
        width: '100%',
        height: '100%'
    },
    wrapper__content: {
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 35
    },
    title: {
        position: 'absolute',
        top: 75,
        width: '100%',
        fontSize: 24,
        fontFamily: 'SFUIDisplay-Semibold',
        color: '#f4f4f4',
        textAlign: 'center'
    },
    block__content: {
        paddingLeft: 5,
        paddingRight: 5,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
        backgroundColor: '#fff',
        borderRadius: 40,
    },
    block__title: {
        paddingLeft: 15,
        marginBottom: 5,
        fontSize: 14,
        fontFamily: 'SFUIDisplay-Semibold',
        color: '#7127ac'
    },
    block__item: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        height: 40,
        paddingLeft: 8,
        paddingRight: 8,
    },
    block__item__content: {
        paddingTop: 5,
        paddingBottom: 5
    },
    block__text: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 14,
        color: '#404040'
    },
    block__subtext: {
        marginTop: -6,
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 11,
        color: '#999999'
    },
    block__text__right: {
        marginLeft: 'auto',
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 14,
        color: '#999999'
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#e3e6e9'
    },
    icon: {
        marginRight: 15,
        marginBottom: 1,
        color: '#999999'
    },
})
