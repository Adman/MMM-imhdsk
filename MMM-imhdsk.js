/* Magic Mirror
 * Module: MMM-imhdsk
 * Description: Display estimations for public transport stops in Bratislava, Slovakia
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

    // TODO: get header - if not user defined => "nearest lines from stop xy"

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

        var table = document.createElement('table');

        if (false) {
        
        } else {
            var row = document.createElement("tr");
            table.appendChild(row);

            var no_line_cell = document.createElement('td');
            no_line_cell.className = 'dimmed light small';
            no_line_cell.innerHTML = 'No lines at the moment';
            row.appendChild(no_line_cell);
        }

        return table;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'IMHDSK_UPDATE') {
            if (payload.module_id == this.identifier) {
                this.loaded = true;
                this.data = payload.result;
                this.updateDom();
            }
        }
    }
});
