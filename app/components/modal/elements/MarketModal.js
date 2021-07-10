/**
 * @version 0.31
 * @author yura
 */
import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'

import Layout from '@app/components/elements/modal/Layout'
import Title from '@app/components/elements/modal/Title'
import Text from '@app/components/elements/modal/Text'
import Button from '@app/components/elements/modal/Button'
import Icon from '@app/components/elements/modal/Icon'
import { hideModal } from '@app/appstores/Stores/Modal/ModalActions'

import { ThemeContext } from '@app/theme/ThemeProvider'
import { strings } from '@app/services/i18n'
import CheckBox from '@app/components/elements/new/CheckBox'

import trusteeAsyncStorage from '@appV2/services/trusteeAsyncStorage/trusteeAsyncStorage'

class MarketModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            notShowAgain: false
        }
    }

    handleHide = () => {
        hideModal()
    }

    handleContinue = () => {

        const { callback } = this.props
        const { notShowAgain } = this.state

        trusteeAsyncStorage.setSmartSwapMsg(notShowAgain ? '1' : '0')
        hideModal()
        callback()
    }

    showHandler = () => {
        this.setState({
            notShowAgain: !this.state.notShowAgain
        })
    }

    render() {
        const { notShowAgain } = this.state
        const { show } = this.props
        const { icon, title, description } = this.props.data

        const { colors } = this.context

        return (
            <Layout visible={show} >
                <View>
                    <Icon callback={this.handleHide} icon={icon.toLowerCase()} color={colors.modal.success} />
                    <Title style={{ ...styles.title, color: colors.common.text1 }}>
                        {title}
                    </Title>
                    <View style={{ marginTop: 12, marginBottom: 15 }}>
                        <Text style={{ ...styles.text, color: colors.sendScreen.amount }}>
                            {description}
                        </Text>
                    </View>
                    <CheckBox
                        checked={notShowAgain}
                        onPress={this.showHandler}
                        title={strings('modal.marketModal.notShowAgain')}
                        style={{ alignSelf: 'center', marginTop: 8 }}
                    />
                    <View>
                        <Button onPress={this.handleContinue} color={colors.modal.success} shadow={true} style={{ marginTop: 17 }}>
                            {strings('modal.marketModal.continue')}
                        </Button>
                        <Button onPress={this.handleHide} style={{ backgroundColor: 'transparent', color: colors.modal.success }}>
                            {strings('walletBackup.skipElement.no')}
                        </Button>
                    </View>
                </View>
            </Layout>
        )
    }
}

MarketModal.contextType = ThemeContext

export default MarketModal

const styles = StyleSheet.create({
    title: {
        fontFamily: 'Montserrat-Bold',
        fontStyle: 'normal',
        fontWeight: 'bold',
        fontSize: 18,
        lineHeight: 26,
        textAlign: 'center',
        marginTop: -10,
        marginBottom: -2

    },
    text: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: -6
    }
})
