import { Alchemy, Network, Utils } from 'alchemy-sdk';
import React from 'react';
import { parseWei, PromisesCache } from './helpers';

/* global BigInt */

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const dataCache = new PromisesCache(10);

class TransactionData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            invalidInput: false
        }

        this.currentTx = 1;
    }

    async getData(tx) {
        this.currentTx = tx;
        this.props.setLoadState(true);
        let items = [];
        let data = null;
        
        try {
            const ethersProvider = await alchemy.config.getProvider();
            data = await dataCache.fetchData(tx, () => ethersProvider.getTransaction(tx));
            
            for (let k in data) {
                let value = data[k];
                let extra = '';
                let clickFn = null;
                let extraClasses = '';

                if (value == null) continue;

                // Parse special cases
                if (k === 'blockHash' || k === 'blockNumber') {
                    clickFn = () => this.props.goToBlock(data[k]);
                    extraClasses = 'btn';
                }
                else if (k === 'from' || k === 'to') {
                    clickFn = () => this.props.goToAddress(data[k]);
                    extraClasses = 'btn';
                }
                else if (k === 'chainId') {
                    const network = await ethersProvider.getNetwork(data[k]);
                    if (network != null) {
                        extra = " (" + network.name + ")";
                    }
                }
                else if (k === 'value' || k === 'gasPrice' || k === 'maxFeePerGas') {
                    extra = " (" + value._hex + ")";
                    value = parseWei(value._hex);
                }
                else if (k === 'accessList' && data[k] != null) {
                    extraClasses = 'code-block';
                    value = [];

                    for(let ak in data[k]) {
                        const item = data[k][ak];
                        const lis = item.storageKeys.reduce((a, akey) => a = [...a, <li key={akey}>{akey}</li>], [])
                        value.push(
                            <div key={item.address}><span>Address {item.address}:</span>
                            <ul>{lis}</ul></div>);
                    }
                }
                // Get abi and code from data
                else if (k === 'data' && data[k].length > 3) {
                    let codeAbi = '';

                    try {
                        await fetch("https://api.etherscan.io/api?module=contract&action=getabi&address=" + data.to)
                            .then(response => response.json()).then(responseJson => {
                                codeAbi = responseJson.result;
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    
                        if (codeAbi != null && codeAbi.startsWith('[')) {
                            const iface = new Utils.Interface(codeAbi);
                            const decodedData = iface.parseTransaction({ data: data[k], value: data.value });
                            
                            value = JSON.stringify(decodedData, null, 2);
                            extraClasses = 'code-block'
                        }
                    }
                    catch(e) { console.error(e); }
                }
                // Parse general data
                else {
                    if (value._hex != null) {
                        extra = " (" + value._hex + ")";
                        value = BigInt(value._hex).toString();
                    }
                    else if (typeof value === 'object' || typeof value === 'function') {
                        value = JSON.stringify(value, null, 2);
                    }
                    if (value && value.toString().length < 20 && value.toString().startsWith('0x')) value = parseInt(value, 16);
                }

                items.push(
                    <div id={k + 'h'} key={k + 'h'} className='data-itemh'>{k}</div>
                );
                items.push(
                    <div id={k + 'v'} key={k + 'v'} className={'data-itemv ' + extraClasses} onClick={clickFn}>{value}<em className='data-extra'>{extra}</em></div>
                );
            }

        }
        catch(e) { console.error(e); }
        
        this.setState({ items, invalidInput: (items.length === 0) });
        this.props.setLoadState(false);
        // if no data retrieved, try to use the hash to fetch block data instead
        if (data === null) this.props.goToBlock(tx);
    }

    componentDidMount() {
        //if (!this.props.transaction) return;
        if (this.props.transaction !== this.currentTx) this.getData(this.props.transaction);
    }

    componentDidUpdate() {
        //if (!this.props.transaction) return;
        if (this.props.transaction !== this.currentTx && !this.state.invalidInput) this.getData(this.props.transaction);
    }

    render() {
        return (
            <div id="tx-data">
                {this.state.invalidInput && <div className='invalid'>ERROR OR INVALID TRANSACTION HASH!</div>}
                <div className='data-list'>
                    {this.state.items}
                </div>
            </div>
        );
    }
}

export default TransactionData;