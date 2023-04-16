import { Alchemy, Network, Utils } from 'alchemy-sdk';
import React from 'react';
import { parseWei, parseTimestamp } from './helpers';

/* global BigInt */

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const ITEMS_SHOWN = 10;

class TransactionsList extends React.Component {
    constructor(props) 
    {
      super(props);
  
      this.state = {
        items: [],
        currentBlock: 1,
        dataIndex: 0,
        loading: false
      };
  
      this.data = {};

      this.getBlocks = this.getBlockTxs.bind(this);
      this.refreshList = this.refreshList.bind(this);
      this.loadOthers = this.loadOthers.bind(this);
      this.loadMore = this.loadMore.bind(this);
      this.loadAll = this.loadAll.bind(this);
      this.setLoadingExtra = this.setLoadingExtra.bind(this);
    }
  
    loadOthers(offset) {
      const newIndex = this.state.dataIndex + offset;
      this.setState({dataIndex: Math.max(0, newIndex)});
      this.refreshList(this.data.transactions, newIndex, ITEMS_SHOWN);
      window.scrollTo(0, 0); 
    }

    loadMore() {
      this.setLoadingExtra(true)
      const newIndex = Math.max(0, this.state.dataIndex + ITEMS_SHOWN);
      this.setState({dataIndex: Math.max(0, newIndex)});
      this.refreshList(this.data.transactions, newIndex, ITEMS_SHOWN, true).then(() => this.setLoadingExtra(false));
    }

    loadAll() {
      this.setLoadingExtra(true)
      const newIndex = this.state.dataIndex + ITEMS_SHOWN;
      this.setState({dataIndex: Math.max(0, newIndex)});
      this.refreshList(this.data.transactions, newIndex, this.data.transactions.length, true).then(() => this.setLoadingExtra(false));
    }

    setLoadingExtra(loading) {
      this.setState({loading});
    }

    async refreshList(txs, startIndex, numItems, add=false) {
      let items = add ? [...this.state.items] : [];
      const time = parseTimestamp(parseInt(this.data.timestamp));

      this.props.setLoadState(true);

      try {
        for(let k = startIndex; k < txs.length && k < startIndex + numItems; k++) {
          const ethersProvider = await alchemy.config.getProvider();
          const fromBalance = await ethersProvider.getBalance(txs[k].from);
          const toBalance = await ethersProvider.getBalance(txs[k].to);

          items.push(
            <div className='list-item' key={"titem" + k}>
              <div className='item-header btn' onClick={() => this.props.goToTx(txs[k].hash)}>
                <span className='filler'><b>{txs[k].hash}</b></span>
                <span>{time} ago</span>
              </div>
              <div className='item-info'>
                <div className='info-pair'>
                  <span>Value</span>
                  <span>{parseWei(txs[k].value._hex)}</span>
                </div>
                <div className='info-pair'>
                  <span>From / To</span>
                  <span className='btn' onClick={() => this.props.goToAddress(txs[k].from)}>{txs[k].from}</span>
                  <span className='btn' onClick={() => this.props.goToAddress(txs[k].to)}>{txs[k].to}</span>
                </div>
                <div className='info-pair'>
                  <span>Balances</span>
                  <span>{Math.round(Utils.formatEther(fromBalance) * 1000000) / 1000000} ETH</span>
                  <span>{Math.round(Utils.formatEther(toBalance) * 1000000) / 1000000} ETH</span>
                </div>
                <div className='info-pair' style={{maxWidth: '200px', width: '200px'}}>
                  <span>Data</span>
                  <span>{txs[k].data}</span>
                </div>
                <div className='info-pair'>
                  <span>Nonce</span>
                  <span>{parseInt(txs[k].nonce)}</span>
                </div>
              </div>
            </div>);
        }
      }
      catch(e) {console.error(e);}

      this.setState({ items });
      this.props.setLoadState(false);
    }
  
    async getBlockTxs(block) 
    {
      try {
        this.setState({ currentBlock: block });
        this.data = await alchemy.core.getBlockWithTransactions(block);
        this.refreshList(this.data.transactions, 0, ITEMS_SHOWN);
      }
      catch(e) {
        console.error(e);
      }
    }
  
    componentDidMount() {
      //if (!this.props.block) return;
      if (this.props.block !== this.state.currentBlock) this.getBlockTxs(this.props.block);
    }

    componentDidUpdate() {
        //if (!this.props.block) return;
        if (this.props.block !== this.state.currentBlock) this.getBlockTxs(this.props.block);
    }

    render() {
      const startIndex = this.state.dataIndex;
      const lastIndex = this.state.dataIndex + this.state.items.length;
      return (
        <div id="transactions-list">
          {this.state.items}
          {this.state.loading && <div id='loading'>LOADING...</div>}
          <div id='list-nav-showing'>Showing {startIndex + 1} - {lastIndex|| ITEMS_SHOWN}{ this.data.transactions && ' (' + this.data.transactions.length + ')'}</div>
          <div id='list-nav'>
            {this.state.dataIndex > 0 && <div className='btn list-nav-btn' onClick={() => this.loadOthers(-ITEMS_SHOWN)}>&lt;</div>}
            <div className='btn list-nav-btn' onClick={() => this.loadMore()}>More</div>
            <div className='btn list-nav-btn' onClick={() => this.loadAll()}>All</div>
            {this.data.transactions && lastIndex < this.data.transactions.length && <div className='btn list-nav-btn' onClick={() => this.loadOthers(ITEMS_SHOWN)}>&gt;</div>}
          </div>
        </div>
      );
    }
  }

  export default TransactionsList;