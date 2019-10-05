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
        dimAfterEntries: 6,
        refreshInterval: 30000, // in milliseconds

        displaySymbol: true,
        displayLineNumber: true,
        displayDestination: true,

        fadePoint: 0.25, // start on the 1/4th of the list
        fade: true,
        blinkingUnder: 60, // start blinking, when arrive in less than x secs

        minimumTimeLeft: 0, // Display lines arriving at least in x seconds

        blacklistLines: [], // Lines that we do not want to show (strings)

        onlyPlatforms: [], // process only specified platforms (ints)
    },

    getStyles: function() {
        return ['font-awesome.css', this.file('MMM-imhdsk.css')];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            sk: "translations/sk.json",
        }
    },

    // TODO: get header - if not user defined => "nearest lines from stop xy"

    start: function () {
        Log.log('Starting module: ' + this.name);

        this.livetable = {};

        var payload = {
            module_id: this.identifier,
            stop_id: this.config.stopId,
            refresh_interval: this.config.refreshInterval
        }

        this.imhdsk_loaded = false;

        this.scheduleUpdate();
        this.updateDom();
    },

    getDom: function() {
        var wrapper = document.createElement('div');

        if (!(this.imhdsk_loaded)) {
            wrapper.innerHTML = this.translate('LOADING');
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        /* process data */
        var all_lines = [];

        var self = this;
        Object.keys(self.livetable).forEach(function(key) {
            var info = self.livetable[key];
            if (self.config.onlyPlatforms.indexOf(info.platform) == -1)
                return;

            info.lines.forEach(function(line) {
                if (line.leaving_in_secs < self.config.minimumTimeLeft)
                    return;

                if (self.config.blacklistLines.indexOf(line.line) > -1)
                    return;

                all_lines.push(line);
            });
        });

        all_lines.sort(function(a, b) {
            if (a.leaving_in_secs < b.leaving_in_secs) return -1;
            if (a.leaving_in_secs > b.leaving_in_secs) return 1;
            return 0;
        });

        all_lines = all_lines.slice(0, this.config.maximumEntries);

        if (this.config.fade && this.config.fadePoint < 1) {
            if (this.config.fadePoint < 0) {
                this.config.fadePoint = 0;
            }
            var start_fade = all_lines.length * this.config.fadePoint;
            var fade_steps = all_lines.length - start_fade;
        }

        var table = document.createElement('table');
        table.className = 'small';

        if (all_lines.length > 0) {
            for (var i = 0; i < all_lines.length; i++) {
                var line = all_lines[i];

                var row = document.createElement('tr');

                /* row fading */
                if (i+1 >= start_fade) {
                    var curr_fade_step = i - start_fade;
                    row.style.opacity = 1 - (1 / fade_steps * curr_fade_step);
                }

                /* display symbol */
                if (this.config.displaySymbol) {
                    var w_symbol_td = document.createElement('td');
                    var w_symbol = document.createElement('span');
                    w_symbol.className = 'fa fa-fw fa-' +
                                         this.getSymbolForLine(line.line);
                    w_symbol_td.appendChild(w_symbol);
                    row.appendChild(w_symbol_td);
                }

                /* display line number */
                if (this.config.displayLineNumber) {
                    var w_line_num_td = document.createElement('td');
                    w_line_num_td.className = 'imhdsk-padding-left align-right';
                    w_line_num_td.innerHTML = line.line;
                    row.appendChild(w_line_num_td);
                }

                /* display destination */
                if (this.config.displayDestination) {
                    var w_dest_td = document.createElement('td');
                    w_dest_td.className = 'imhdsk-padding-left align-left';
                    w_dest_td.innerHTML = line.destination_name;
                    row.appendChild(w_dest_td);
                }

                /* display time left */
                var w_time_td = document.createElement('td');
                w_time_td.className = 'align-right';
                w_time_td.innerHTML =  this.getDepartureTime(line);
                row.appendChild(w_time_td);

                if (line.leaving_in_secs < this.config.blinkingUnder)
                    row.className = 'blinking';

                table.appendChild(row);
            }
        } else {
            var row = document.createElement('tr');
            table.appendChild(row);

            var no_line_cell = document.createElement('td');
            no_line_cell.className = 'dimmed light small';
            no_line_cell.innerHTML = this.translate('NO_LINES');
            row.appendChild(no_line_cell);
        }

        wrapper.appendChild(table);
        return wrapper;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'IMHDSK_UPDATE') {
            if (payload.module_id == this.identifier) {
                this.imhdsk_loaded = true;
                this.livetable = payload.result;
                this.updateDom();
            }
        }
    },

    scheduleUpdate: function() {
        this.sendSocketNotification('IMHDSK_STOP_INFO', {
            module_id: this.identifier,
            stop_id: this.config.stopId,
        });

        var self = this;
        setTimeout(function() {
            self.scheduleUpdate();
        }, this.config.refreshInterval);
    },

    getSymbolForLine: function(line_id) {
        var special_trams = ['X6'];
        var int_line = parseInt(line_id, 10);
        var symbol = 'bus';
        if (isNaN(int_line)) {
            if (special_trams.indexOf(line_id) > -1)
                symbol = 'train';
        } else if (int_line < 15) {
            symbol = 'train';
        }
        return symbol;
    },

    getDepartureTime: function(line) {
        if (line.leaving_in_secs < 60)
            return '<1 min';
        else if (line.leaving_in_secs < 1200)
            return Math.round(line.leaving_in_secs / 60) + ' min';
       var d = new Date(line.time);
       return this.padZero(d.getHours()) + ':' + this.padZero(d.getMinutes());
    },

    padZero: function(n) {
        return n < 10 ? '0' + n : n;
    }
});
