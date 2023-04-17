import { Alchemy, Network } from 'alchemy-sdk';
import React from 'react';
import { parseWei, PromisesCache } from './helpers';

/* global BigInt */

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const blocksCache = new PromisesCache(10);

class BlocksList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            errorLoading: false
        };

        this.getBlocks = this.getBlocks.bind(this);
        this.buildList = this.buildList.bind(this);
    }

    buildList(blocks) {
        let items = [];

        for (let k in blocks) {
            const gasBaseFee = BigInt(blocks[k].baseFeePerGas._hex);
            const gas = parseInt(blocks[k].gasUsed._hex, 16);
            const gasPerc = Math.floor(gas / parseInt(blocks[k].gasLimit._hex, 16) * 100);
            const txs = blocks[k].transactions.length;
            const txValTotal = blocks[k].transactions.reduce((a, item) => BigInt(a) + BigInt(item.value._hex), BigInt(0));

            items.push(
                <div className='list-item' key={"bitem" + k} id={"bitem" + k}>
                    <div className='item-header btn' onClick={() => this.props.goTo(blocks[k].hash)}>
                        <span className='filler'><b>{blocks[k].number}</b>: {blocks[k].hash}</span>
                        <span>{Math.round(Date.now() / 1000 - blocks[k].timestamp)} secs ago</span>
                    </div>
                    <div className='item-info'>
                        <div className='info-pair'>
                            <span>Total Value</span>
                            <span>{parseWei(txValTotal)}</span>
                        </div>
                        <div className='info-pair btn' onClick={() => this.props.goToTxs(blocks[k].number)}>
                            <span>Transactions</span>
                            <span>{txs}</span>
                        </div>
                        <div className='info-pair'>
                            <span>Gas Used</span>
                            <span>{gasPerc}%
                                <div className='health-bar'><span style={{ width: gasPerc + '%' }}></span></div></span>
                        </div>
                        <div className='info-pair'>
                            <span>Base Gas Fee</span>
                            <span>{parseWei(gasBaseFee)}</span>
                        </div>
                        <div className='info-pair btn' onClick={() => this.props.goToAddress(blocks[k].miner)}>
                            <span>Miner</span>
                            <span>{blocks[k].miner}</span>
                        </div>
                    </div>
                </div>);
        }

        this.setState({ items, errorLoading: (items.length === 0) });
    }

    async getBlocks() {
        const blocks = [];
        
        try {
            this.props.setLoadState(true);
            let blockNum = await alchemy.core.getBlockNumber();
            const dataFetcher = () => blocksCache.fetchData(blockNum, () => alchemy.core.getBlockWithTransactions(blockNum));

            for (let i = 0; i < 10; i++) {
                const blockData = await dataFetcher();
                blockNum--;
                blocks.push(blockData);
            }

            this.buildList(blocks);
            this.props.setLoadState(false);
        }
        catch (e) {
            this.setState({ errorLoading: true });
            this.props.setLoadState(false);
            console.error(e);
        }
    }

    componentDidMount() {
        this.getBlocks();
    }

    render() {
        return (
            <div id="blocks-list">
                {this.state.errorLoading && <div className='invalid'>SOMETHING WENT WRONG!</div>}
                {this.state.items}
            </div>
        );
    }
}

export default BlocksList;