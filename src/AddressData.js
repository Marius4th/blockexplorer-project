import { Alchemy, Network, Utils } from 'alchemy-sdk';
import React from 'react';
import {parseWei} from './helpers';

/* global BigInt */

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

class AddressData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            currentAddress: 1
        }
    }

    async getData(addr) {
        const ethersProvider = await alchemy.config.getProvider();
        const balance = await ethersProvider.getBalance(addr);
        let code = await ethersProvider.getCode(addr);
        
        await fetch("https://api.etherscan.io/api?module=contract&action=getabi&address=" + addr)
            .then(response => response.json()).then(responseJson => {
                if (responseJson.result.startsWith('[')) code = JSON.stringify(JSON.parse(responseJson.result), null, 2);
            })
            .catch(error => {
                console.error(error);
            });

        let items = [];

        items.push( <div className='data-itemh'>Balance</div> );
        items.push( <div className='data-itemv'>{parseWei(balance)}</div> );
        items.push( <div className='data-itemh'>Code</div> );
        items.push( <div className='data-itemv code-block'>{code}</div> );
        
        this.setState({ items, currentAddress: addr });
        this.props.setLoadState(false);
    }

    componentDidMount() {
        if (!this.props.address) return;
        if (this.props.address != this.state.currentAddress) this.getData(this.props.address);
    }

    componentDidUpdate() {
        if (!this.props.address) return;
        if (this.props.address != this.state.currentAddress) this.getData(this.props.address);
    }

    render() {
        return (
            <div id="addr-data">
                <div className='data-list'>
                    {this.state.items}
                </div>
            </div>
        )
    }
}

export default AddressData;