/* Magic Mirror
 * Module: MMM-imhdsk
 *
 * By Adrian Matejov https://github.com/Adman
 * MIT Licensed.
 */

Module.register('MMM-imhdsk', {
    defaults: {
        maximumEntries: 10,
        refreshInterval: 30000, // in milliseconds

        // minimumTimeLeft: 0, // Display lines arriving at least in x seconds

        // blacklistedLines: [], // Lines that we do not want to process
        
        // required stopId,
        // platforms: [], // process only specified platforms
    },

    getStyles: function() {
        return ['font-awesome.css', this.file('MMM-imhdsk.css')];
    },

    start: function () {
        Log.log('Starting module: ' + this.name);

        this.data = {};

        var payload = {
            module_id: this.identifier,
            stop_id: this.config.stopId,
            refresh_interval: this.config.refreshInterval
        }

        this.loaded = false;
        this.sendSocketNotification('IMHDSK_STOP_INIT', payload);
        this.updateDom();
    },

    getDom: function() {
        var wrapper = document.createElement('div');

        if (!this.loaded) {
            wrapper.innerHTML = 'LOADING'; // TODO: translate
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        // TODO
    },

    socketNotificationReceived: function(notification, payload) {
        if (payload.module_id == this.identified) {
            this.loaded = true;
            this.data = payload.result;
            this.updateDom();
        }
    }
});
