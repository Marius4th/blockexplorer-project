import { Alchemy, Network } from 'alchemy-sdk';
import React from 'react';
import {parseWei} from './helpers';

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
            invalidInput: false
        };

        this.currentAddress = 1;
    }

    async getData(addr) {
        this.currentAddress = addr;
        this.props.setLoadState(true);
        let items = [];

        try {
            const ethersProvider = await alchemy.config.getProvider();
            const balance = await ethersProvider.getBalance(addr);
            let code = await ethersProvider.getCode(addr);
            let foundAbi = false;
            
            await fetch("https://api.etherscan.io/api?module=contract&action=getabi&address=" + addr)
                .then(response => response.json()).then(responseJson => {
                    if (responseJson.result.startsWith('[')) {
                        code = JSON.stringify(JSON.parse(responseJson.result), null, 2);
                        foundAbi = true;
                    }
                })
                .catch(error => {
                    console.error(error);
                });
                
            items.push( <div className='data-itemh' id='balanceh' key='balanceh'>Balance</div> );
            items.push( <div className='data-itemv' id='balancev' key='balancev'>{parseWei(balance)}</div> );
            items.push( <div className='data-itemh' id='codeh' key='codeh'>Code</div> );
            items.push( <div className='data-itemv code-block' id='codev' key='codev' style={!foundAbi ? {whiteSpace: 'break-spaces'} : {}}>{code}</div> );
        }
        catch(e) { console.error(e); }
            
        this.setState({ items, invalidInput: (items.length === 0) });
        this.props.setLoadState(false);
    }

    componentDidMount() {
        //if (!this.props.address) return;
        if (this.props.address !== this.currentAddress) this.getData(this.props.address);
    }

    componentDidUpdate() {
        //if (!this.props.address) return;
        if (this.props.address !== this.currentAddress && !this.state.invalidInput) this.getData(this.props.address);
    }

    render() {
        return (
            <div id="addr-data">
                <div className='data-list'>
                    {this.state.invalidInput && <div className='invalid'>ERROR OR INVALID ADDRESS!</div>}
                    {this.state.items}
                </div>
            </div>
        )
    }
}

export default AddressData;