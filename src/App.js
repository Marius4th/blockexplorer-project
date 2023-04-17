//import { Alchemy, Network } from 'alchemy-sdk';
import React from 'react';

import './styles/app.scss';
import './styles/commons.scss';
import './styles/data-lists.scss';
import './styles/commons.scss';

import BlocksList from './BlocksList';
import TransactionsList from './TransactionsList';
import TransactionData from './TransactionData';
import BlockData from './BlockData';
import AddressData from './AddressData';
import SearchBar from './SearchBar';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
/*const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};*/

// You can read more about the packages here:
// https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
//const alchemy = new Alchemy(settings);

const TABS = {
  LatestBlocks: 0,
  BlockTransactions: 1,
  BlockData: 2,
  TransactionData: 3,
  AddressData: 4
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      selectedTab: TABS.LatestBlocks,
      selectedTx: null,
      selectedBlock: null,
      selectedAddr: null,
      searchStr: ''
    };

    this.changeTab = this.changeTab.bind(this);
    this.goToTransaction = this.goToTransaction.bind(this);
    this.goToTransactions = this.goToTransactions.bind(this);
    this.goToBlock = this.goToBlock.bind(this);
    this.goToAddress = this.goToAddress.bind(this);
    this.setLoadState = this.setLoadState.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.search = this.search.bind(this);
  }

  setLoadState(loading) {
    this.setState({loading});
  }

  changeTab(tab) {
    this.setState({selectedTab: tab});
  }

  goToTransaction(tx) {
    this.setState({selectedTx: tx});
    this.changeTab(TABS.TransactionData);
  }

  goToTransactions(block) {
    this.setState({selectedBlock: block});
    this.changeTab(TABS.BlockTransactions);
  }

  goToBlock(block) {
    this.setState({selectedBlock: block});
    this.changeTab(TABS.BlockData);
  }

  goToAddress(addr) {
    this.setState({selectedAddr: addr});
    this.changeTab(TABS.AddressData);
  }

  handleSearchInput(event) {
      this.setState({searchStr: event.target.value});
  }

  search(e, str) {
    if (str.startsWith('0x')) {
      // Transaction
      if (str.length === 66) this.goToTransaction(str);
      // Address
      else if (str.length === 42) this.goToAddress(str);
    }
    // Block Number
    else this.goToBlock(parseInt(str) || 0);
    
    e.preventDefault();
    return false;
  }

  render() {
    let tabContent = null;
    let title = "";

    switch (this.state.selectedTab)
    {
      case TABS.LatestBlocks: 
        tabContent = <BlocksList setLoadState={this.setLoadState} goTo={this.goToBlock} goToTxs={this.goToTransactions} goToAddress={this.goToAddress}/>; 
        title = "Last 10 Blocks";
        break;
      case TABS.BlockTransactions: 
        tabContent = <TransactionsList setLoadState={this.setLoadState} block={this.state.selectedBlock} goToTx={this.goToTransaction} goToBlock={this.goToBlock} goToAddress={this.goToAddress}/>; 
        title = "Transactions of " + (this.state.selectedBlock === null ? 'first block' : this.state.selectedBlock);
        break;
      case TABS.TransactionData: 
        tabContent = <TransactionData setLoadState={this.setLoadState} transaction={this.state.selectedTx} goToBlock={this.goToBlock} goToAddress={this.goToAddress}/>; 
        title = "Data of " + (this.state.selectedTx === null ? 'invalid hash!' : this.state.selectedTx);
        break;
      case TABS.BlockData: 
        tabContent = <BlockData setLoadState={this.setLoadState} block={this.state.selectedBlock} goToBlock={this.goToBlock} goToTxs={this.goToTransactions} goToAddress={this.goToAddress}/>; 
        title = "Data of " + (this.state.selectedBlock === null ? 'first block' : this.state.selectedBlock);
        break;
        case TABS.AddressData: 
          tabContent = <AddressData setLoadState={this.setLoadState} address={this.state.selectedAddr}/>; 
          title = "Data of " + (this.state.selectedAddr === null ? 'invalid address!' : this.state.selectedAddr);
          break;
      default: tabContent = <BlocksList/>;
    }
    
    return (
      <div className="App">
        <div id="app-tabs">
          <div className={this.state.selectedTab === TABS.LatestBlocks ? "tab-btn selected-tab" : 'tab-btn'} onClick={() => this.changeTab(TABS.LatestBlocks)}>Latest Blocks</div>
          <div className={this.state.selectedTab === TABS.BlockTransactions ? "tab-btn selected-tab" : 'tab-btn'} onClick={() => this.changeTab(TABS.BlockTransactions)}>Block Transactions</div>
          <div className={this.state.selectedTab === TABS.BlockData ? "tab-btn selected-tab" : 'tab-btn'} onClick={() => this.changeTab(TABS.BlockData)}>Block Data</div>
          <div className={this.state.selectedTab === TABS.TransactionData ? "tab-btn selected-tab" : 'tab-btn'} onClick={() => this.changeTab(TABS.TransactionData)}>Transaction Data</div>
          <div className={this.state.selectedTab === TABS.AddressData ? "tab-btn selected-tab" : 'tab-btn'} onClick={() => this.changeTab(TABS.AddressData)}>Address Data</div>
        </div>
        <div id='app-content'>
          <div id='content-title'>{title}</div>
          <SearchBar value={this.state.searchStr} onSubmit={e => this.search(e, this.state.searchStr)} handleChange={this.handleSearchInput} placeholder={'Input a Block Number, Transaction Hash or Address'}/>
          {this.state.loading && <div className='loading'>LOADING...</div>}
          {tabContent}
        </div>
        <div id='footer'>Designed & Coded by Marius Ionut V. S.</div>
      </div>
    );
  }
}

export default App;
