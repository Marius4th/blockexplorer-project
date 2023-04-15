import React from 'react';

function SearchBar(props) {
    return (
        <form id='bsearch-bar' className='search-bar' onSubmit={e => props.onSubmit(e)}>
            <input type='text' name='block-id' placeholder={props.placeholder} value={props.value} onChange={props.handleChange}/>
            <input className='btn' type='submit' value={'Search'}/>
        </form>
    );
}

export default SearchBar;