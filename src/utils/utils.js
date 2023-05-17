/* eslint-env mocha */
/* global */

const utils = {
    getEventFromTx: (txReceipt, eventName) => {
        return txReceipt.events.filter((log) => {
            return log.event === eventName
        })[0]
    },
}

module.exports = utils
