import { Alchemy, Network, Utils } from 'alchemy-sdk';
import React from 'react';
import { parseWei, parseTimestamp, PromisesCache } from './helpers';

const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const ITEMS_SHOWN = 10;

const txsCache = new PromisesCache(100);
const blockDataCache = new PromisesCache(8);

class TransactionsList extends React.Component {
    constructor(props) 
    {
      super(props);
  
      this.state = {
        items: [],
        loading: false,
        invalidInput: false
      };
      
      this.dataIndex = 0;
      this.currentBlock = 1;
      this.data = {};

      this.getBlocks = this.getBlockTxs.bind(this);
      this.refreshList = this.refreshList.bind(this);
      this.loadOthers = this.loadOthers.bind(this);
      this.loadMore = this.loadMore.bind(this);
      this.loadAll = this.loadAll.bind(this);
      this.setLoadingExtra = this.setLoadingExtra.bind(this);
    }
  
    loadOthers(offset) {
      const newIndex = Math.max(0, this.dataIndex + offset);
      this.refreshList(this.data.transactions, newIndex, ITEMS_SHOWN);
      window.scrollTo(0, 0); 
    }

    loadMore() {
      this.setLoadingExtra(true)
      const newIndex = Math.max(0, this.dataIndex + ITEMS_SHOWN);
      this.refreshList(this.data.transactions, newIndex, ITEMS_SHOWN, true).then(() => this.setLoadingExtra(false));
    }

    loadAll() {
      this.setLoadingExtra(true)
      const newIndex = Math.max(0, this.dataIndex + ITEMS_SHOWN);
      this.refreshList(this.data.transactions, newIndex, this.data.transactions.length, true).then(() => this.setLoadingExtra(false));
    }

    setLoadingExtra(loading) {
      this.setState({loading});
    }

    async refreshList(txs, startIndex, numItems, add=false) {
      this.dataIndex = startIndex;
      let items = add ? [...this.state.items] : [];
      const time = parseTimestamp(parseInt(this.data.timestamp));

      this.props.setLoadState(true);

      try {
        for(let k = startIndex; k < txs.length && k < startIndex + numItems; k++) {
          const ethersProvider = await alchemy.config.getProvider();
          const fromBalance = await txsCache.fetchData(txs[k].from, () => ethersProvider.getBalance(txs[k].from));
          const toBalance = await txsCache.fetchData(txs[k].to, () => ethersProvider.getBalance(txs[k].to));

          items.push(
            <div className='list-item' key={"titem-" + k} id={"titem-" + k}>
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

      this.setState({ items, invalidInput: (items.length === 0) });
      this.props.setLoadState(false);
    }
  
    async getBlockTxs(block) 
    {
      this.currentBlock = block;
      this.props.setLoadState(true);
      
      try {
        this.data = await blockDataCache.fetchData(block, () => alchemy.core.getBlockWithTransactions(block));
        this.refreshList(this.data.transactions, 0, ITEMS_SHOWN);
      }
      catch(e) {
        console.error(e);
        this.props.setLoadState(false);
      }
    }
  
    componentDidMount() {
      //if (!this.props.block) return;
      if (this.props.block !== this.currentBlock) this.getBlockTxs(this.props.block);
    }

    componentDidUpdate() {
        //if (!this.props.block) return;
        if (this.props.block !== this.currentBlock && !this.state.invalidInput) this.getBlockTxs(this.props.block);
    }

    render() {
      const startIndex = this.dataIndex;
      const lastIndex = this.dataIndex + this.state.items.length;

      return (
        <div id="transactions-list">
          {this.state.items}
          {this.state.invalidInput && <div className='invalid'>ERROR OR INVALID BLOCK!</div>}
          {this.state.loading && <div className='loading'>LOADING...</div>}
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