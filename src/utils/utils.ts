import { ethers } from 'ethers';

/* eslint-env mocha */
/* global */

export function getEventFromTx(txReceipt: any, eventName: string) {
    return txReceipt.events.filter((log: any) => {
        return log.event === eventName
    })[0]
}

export function stringToBytes32(data: string): string {
    const hexData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data));
    return ethers.utils.hexZeroPad(hexData, 32);
}

