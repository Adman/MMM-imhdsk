/* Magic Mirror
 * Module: MMM-imhdsk
 * Description: Display estimations for public transport stops in Bratislava, Slovakia
 *
 * By Adrian Matejov https://github.com/Adman
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const imhdsk = require('node-imhdsk');

module.exports = NodeHelper.create({
    start: function() {
        console.log('Starting node helper for: ' + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'IMHDSK_STOP_INFO') {
            this.getDataForStop(payload.module_id,
                                payload.stop_id);
        }
    },

    getDataForStop: function(module_id, stop_id) {
        var self = this;
        imhdsk.get_livetable(stop_id).then(function(res) {
            self.sendSocketNotification('IMHDSK_UPDATE', {
                module_id: module_id,
                result: res
            });
        });
    }
});
