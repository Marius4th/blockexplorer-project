import { Utils } from 'alchemy-sdk';
/* global BigInt */

const WEI_ETH_VALUE = BigInt(1000000000000000000);

// Converts from timestamp to how long ago it happend
function parseTimestamp(tstamp) {
    const span = Date.now() / 1000 - tstamp;
    if (span < 60) return Math.round(span).toString() + ' secs';
    else if (span / 60 < 60) return Math.round(span / 60).toString() + ' mins';
    else if (span / 60 / 60 < 60) return (Math.round(span / 60 / 60 * 10) / 10).toString() + ' hrs';
    else if (span / 60 / 60 / 24 < 60) return (Math.round(span / 60 / 60 / 24 * 10) / 10).toString() + ' days';
    else if (span / 60 / 60 / 24 / 365 < 60) return (Math.round(span / 60 / 60 / 24 / 365 * 10) / 10).toString() + ' years';
    return tstamp;
}

// Converts from wei to more readable values like Gwei and Eth
function parseWei(wei) {
    if (wei == 0) return '0.'.padEnd(8, '0') + ' Wei';
    if (parseInt(Utils.formatUnits(wei, 'gwei')) < 1000000) return (Math.round(Utils.formatUnits(wei, 'gwei') * 1000000) / 1000000).toString().padEnd(8, '0') + ' Gwei';
    return (Math.round(Utils.formatEther(wei) * 1000000) / 1000000).toString().padEnd(8, '0') + ' Eth';
}

export { parseTimestamp, parseWei, WEI_ETH_VALUE };