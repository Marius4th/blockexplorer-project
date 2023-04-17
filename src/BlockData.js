import { Alchemy, Network } from 'alchemy-sdk';
import React from 'react';
import { parseWei, PromisesCache } from './helpers';

/* global BigInt */

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const dataCache = new PromisesCache(10);

class BlockData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            invalidInput: false
        }

        this.currentBlock = 1;
    }

    async getData(block) {
        this.currentBlock = block;
        this.props.setLoadState(true);
        let items = [];
        
        try {
            const ethersProvider = await alchemy.config.getProvider();
            const data = await dataCache.fetchData(block, () => ethersProvider.getBlock(block));

            for (let k in data) {
                let value = data[k];
                let extra = '';
                let clickFn = null;
                let extraClasses = '';
                
                // Parse special cases
                if (k === 'transactions') {
                    clickFn = () => this.props.goToTxs(data.hash);
                    value = value.length + " txs";
                    extraClasses = 'btn';
                }
                else if (k === 'miner') {
                    clickFn = () => this.props.goToAddress(value);
                    extraClasses = 'btn';
                }
                else if (k === 'timestamp') {
                    extra = " (" + new Date(value * 1000) + ")";
                }
                else if (k === 'parentHash') {
                    clickFn = () => this.props.goToBlock(value);
                    extraClasses = 'btn';
                }
                else if (k === 'baseFeePerGas') {
                    extra = " (" + value._hex + ")";
                    value = parseWei(value._hex).toString();
                }
                // Parse general data
                else {
                    if (value._hex != null) {
                        extra = " (" + value._hex + ")";
                        value = BigInt(value._hex).toString();
                    }
                    else if (typeof value === 'object') {
                        value = JSON.stringify(value, null, 2);
                    }
                    if (value.toString().length < 20 && value.toString().startsWith('0x')) value = parseInt(value, 16);
                }

                items.push(
                    <div id={'data-itemh-' + k} key={'data-itemh-' + k} className='data-itemh'>{k}</div>
                );
                items.push(
                    <div id={'data-itemv-' + k} key={'data-itemv-' + k} className={'data-itemv ' + extraClasses} onClick={clickFn}>{value}<em className='data-extra'>{extra}</em></div>
                );
            }
        }
        catch(e) { console.error(e); }
        
        this.setState({ items, invalidInput: (items.length === 0) });
        this.props.setLoadState(false);
    }

    componentDidMount() {
        //if (!this.props.block) return;
        if (this.props.block !== this.currentBlock) this.getData(this.props.block);
    }

    componentDidUpdate() {
        //if (!this.props.block) return;
        if (this.props.block !== this.currentBlock && !this.state.invalidInput) this.getData(this.props.block);
    }

    render() {
        return (
            <div id="block-data">
                {this.state.invalidInput && <div className='invalid'>ERROR OR INVALID BLOCK!</div>}
                <div className='data-list'>
                    {this.state.items}
                </div>
            </div>
        );
    }
}

export default BlockData;