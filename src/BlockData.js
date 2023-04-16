import { Alchemy, Network, Utils } from 'alchemy-sdk';
import React from 'react';
import {parseWei} from './helpers';

/* global BigInt */

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

class BlockData extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            currentBlock: 1
        }
    }

    async getData(block) {
        const ethersProvider = await alchemy.config.getProvider();
        const data = await ethersProvider.getBlock(block);
        
        let items = [];

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
                <div className='data-itemh'>{k}</div>
            );
            items.push(
                <div className={'data-itemv ' + extraClasses} onClick={clickFn}>{value}<em className='data-extra'>{extra}</em></div>
            );
        }

        this.setState({ items, currentBlock: block });
        this.props.setLoadState(false);
    }

    componentDidMount() {
        //if (!this.props.block) return;
        if (this.props.block !== this.state.currentBlock) this.getData(this.props.block);
    }

    componentDidUpdate() {
        //if (!this.props.block) return;
        if (this.props.block !== this.state.currentBlock) this.getData(this.props.block);
    }

    render() {
        return (
            <div id="block-data">
                <div className='data-list'>
                    {this.state.items}
                </div>
            </div>
        );
    }
}

export default BlockData;