const app = {
    state: {
        isLoggedIn: false,
        userLocation: [12.9716, 77.5946],
        truckLocation: [12.9750, 77.5980],
        isDriverOnline: false,
        isTruckMoving: false,
        routeSpeed: 1,
        isPaused: false,
        lastDistance: null,
        notificationsSent: 0,
        voiceCallsMade: 0,
        events: [],
        pushNotificationsEnabled: true,
        callMode: 'manual-selection'
    },
    map: null,
    locationMap: null,
    trackingMap: null,
    opsMap: null,
    userMarker: null,
    truckMarker: null,
    trackingTruckMarker: null,
    opsHomeMarker: null,
    opsTruckMarker: null,
    routeInterval: null,
    toastTimer: null,
    voiceCallTimer: null,
    notificationAudio: null,

    init: function () {
        this.log('System initialized. Ready to simulate.', 'info');
        this.trackEvent('simulation_dashboard_viewed', {
            page_name: 'simulation_dashboard',
            page_path: window.location.pathname,
            entry_point: 'page_load'
        });

        const pushDot = document.getElementById('push-status-dot');
        const pushText = document.getElementById('push-status-text');
        const pushBtn = document.getElementById('btn-toggle-push');
        const autoVoiceEl = document.getElementById('auto-voice-call');

        if (pushDot) pushDot.classList.toggle('online', this.state.pushNotificationsEnabled);
        if (pushText) pushText.innerText = this.state.pushNotificationsEnabled ? 'Enabled' : 'Disabled';
        if (pushBtn) {
            pushBtn.innerHTML = this.state.pushNotificationsEnabled
                ? '<i class="fa-solid fa-bell"></i> Disable Notifications'
                : '<i class="fa-solid fa-bell-slash"></i> Enable Notifications';
        }
        if (autoVoiceEl) autoVoiceEl.checked = false;

        if (localStorage.getItem('isLoggedIn') === 'true') {
            this.loginSuccess(true);
        }

        if (localStorage.getItem('theme') === 'dark') {
            this.applyTheme('dark');
        } else {
            this.applyTheme('light');
        }

        this.refreshLiveStatusUI();
    },

    assetPrefix: function () {
        return document.body.dataset.assetPrefix || '';
    },

    assetPath: function (path) {
        return `${this.assetPrefix()}${path}`;
    },

    setText: function (id, value) {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    },

    updateThemeIcons: function (isDark) {
        const iconIds = ['theme-icon', 'page-theme-icon'];
        iconIds.forEach((id) => {
            const icon = document.getElementById(id);
            if (!icon) return;
            icon.classList.toggle('fa-moon', !isDark);
            icon.classList.toggle('fa-sun', isDark);
        });
    },

    getSimulationStatus: function () {
        if (!this.state.isDriverOnline) return 'Offline';
        if (sim.isPaused) return 'Paused';
        if (Number.isFinite(this.state.lastDistance) && this.state.lastDistance < 30) return 'Arrived';
        if (this.state.isTruckMoving) return 'En Route';
        return 'Online';
    },

    formatDistance: function () {
        if (!Number.isFinite(this.state.lastDistance)) return '--';
        if (this.state.lastDistance < 30) return 'Arrived';
        if (this.state.lastDistance >= 1000) return `${(this.state.lastDistance / 1000).toFixed(1)} km`;
        return `${Math.round(this.state.lastDistance)} m`;
    },

    getCallModeLabel: function () {
        const labels = {
            'manual-selection': 'Manual',
            'voice-only': 'Voice',
            'sms-only': 'SMS',
            none: 'None'
        };
        return labels[this.state.callMode] || 'Manual';
    },

    refreshLiveStatusUI: function () {
        const status = this.getSimulationStatus();
        const distance = this.formatDistance();
        const alertsSummary = `${this.state.notificationsSent} / ${this.state.voiceCallsMade}`;
        const callMode = this.getCallModeLabel();
        const notificationsSummary = this.state.pushNotificationsEnabled ? 'Notifications on' : 'Notifications off';

        let homeMode = 'Alerts paused';
        if (this.state.pushNotificationsEnabled && callMode !== 'None') {
            homeMode = `Push + ${callMode.toLowerCase()} call`;
        } else if (this.state.pushNotificationsEnabled) {
            homeMode = 'Push only';
        } else if (callMode !== 'None') {
            homeMode = `${callMode} call only`;
        }

        let trackingCopy = 'Truck is offline until dispatch brings it online.';
        if (status === 'Online') {
            trackingCopy = 'Truck is online and ready at the route start point.';
        } else if (status === 'En Route') {
            trackingCopy = `Truck is moving toward the resident and is ${distance} away.`;
        } else if (status === 'Paused') {
            trackingCopy = `Route is paused and the truck is ${distance} away.`;
        } else if (status === 'Arrived') {
            trackingCopy = 'Truck has arrived near the saved resident location.';
        }

        const statusPill = status === 'En Route'
            ? 'Truck en route'
            : status === 'Paused'
                ? 'Route paused'
                : status === 'Arrived'
                    ? 'Truck arrived'
                    : status === 'Online'
                        ? 'Truck online'
                        : 'Truck offline';

        this.setText('sidebar-pill-status', status);
        this.setText('dashboard-status-headline', status);
        this.setText('dashboard-distance-headline', distance);
        this.setText('dashboard-alert-headline', alertsSummary);
        this.setText('home-route-pill', statusPill);
        this.setText('home-stat-status', status);
        this.setText('home-stat-distance', distance);
        this.setText('home-stat-alerts', alertsSummary);
        this.setText('home-notification-mode', homeMode);
        this.setText('home-tracking-copy', trackingCopy);
        this.setText('overview-status-badge', `Status: ${status}`);
        this.setText('overview-notification-badge', notificationsSummary);
    },

    login: function () {
        this.loginSuccess();
    },

    trackEvent: function (eventName, params = {}) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
            this.log(`GA event tracked: ${eventName}`, 'info');
        } else {
            this.log(`GA tracking unavailable for: ${eventName}`, 'warn');
        }
    },

    loginSuccess: function (isAutoLogin = false) {
        this.state.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');

        document.getElementById('screen-login').classList.remove('active');
        document.getElementById('screen-home').classList.add('active');

        window.setTimeout(() => {
            document.getElementById('disclaimer-popup').classList.add('show');
        }, 700);

        this.log(isAutoLogin ? 'Auto-login from saved session.' : 'User logged in.', 'success');
        this.trackEvent('resident_app_home_viewed', {
            method: isAutoLogin ? 'saved_session' : 'manual_login'
        });
        this.refreshLiveStatusUI();

        window.setTimeout(() => {
            this.initMap();
            this.initOpsMap();
        }, 320);
    },

    closeDisclaimer: function () {
        document.getElementById('disclaimer-popup').classList.remove('show');
        this.log('Simulation dashboard ready.', 'info');
    },

    logout: function () {
        this.state.isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        document.querySelectorAll('.app-screen').forEach((el) => el.classList.remove('active'));
        document.getElementById('screen-login').classList.add('active');
        this.log('User logged out.', 'info');
    },

    openLocationScreen: function () {
        document.getElementById('screen-home').classList.remove('active');
        document.getElementById('screen-location').classList.add('active');
        window.setTimeout(() => this.initLocationMap(), 280);
    },

    openTrackingScreen: function () {
        document.getElementById('screen-home').classList.remove('active');
        document.getElementById('screen-tracking').classList.add('active');
        window.setTimeout(() => this.initTrackingMap(), 280);

        const statusEl = document.getElementById('tracking-status');
        if (statusEl) {
            if (!this.state.isDriverOnline) statusEl.innerText = 'Rider Offline';
            else if (this.state.isTruckMoving) statusEl.innerText = 'En Route';
            else statusEl.innerText = 'Rider Online';
        }
    },

    goBack: function () {
        document.querySelectorAll('.app-screen').forEach((el) => el.classList.remove('active'));
        document.getElementById('screen-home').classList.add('active');
    },

    saveLocation: function () {
        const addressInput = document.getElementById('location-address');
        const latInput = document.getElementById('location-lat');
        const lngInput = document.getElementById('location-lng');
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            this.showToast('Invalid coordinates. Keeping previous location.');
            this.log('Invalid coordinates entered; location unchanged.', 'warn');
            return;
        }

        this.state.userLocation = [lat, lng];

        if (this.userMarker) {
            this.userMarker.setLatLng(this.state.userLocation);
        }

        if (this.map) {
            this.map.setView(this.state.userLocation, 15);
        }

        this.syncOpsMap();

        if (this.trackingMap) {
            this.trackingMap.setView(this.state.truckLocation, 15);
            sim.generateRouteToUser();
        }

        this.log(`Location updated → ${addressInput.value || 'Custom coordinates'} (${lat.toFixed(5)}, ${lng.toFixed(5)})`, 'success');
        this.showToast('Location saved');
        this.refreshLiveStatusUI();

        window.setTimeout(() => this.goBack(), 900);
    },

    centerMap: function () {
        if (this.map) {
            this.map.setView(this.state.userLocation, 15);
        }
    },

    initMap: function () {
        if (this.map) return;
        this.map = L.map('user-map', { zoomControl: false }).setView(this.state.userLocation, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.userMarker = L.marker(this.state.userLocation, { icon: this.homeIcon() }).addTo(this.map);
        this.log('Home map loaded.', 'info');
    },

    initOpsMap: function () {
        const el = document.getElementById('ops-map');
        if (!el || this.opsMap) return;

        this.opsMap = L.map('ops-map', { zoomControl: true }).setView(this.state.userLocation, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.opsMap);

        this.opsHomeMarker = L.circleMarker(this.state.userLocation, {
            radius: 7,
            color: '#ef4444',
            weight: 2,
            fillColor: '#ef4444',
            fillOpacity: 0.9
        }).addTo(this.opsMap).bindPopup('Resident');

        this.opsTruckMarker = L.circleMarker(this.state.truckLocation, {
            radius: 7,
            color: '#22c55e',
            weight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.9
        }).addTo(this.opsMap).bindPopup('BBMP Truck');

        this.syncOpsMap();
        this.log('Ops map loaded.', 'info');
    },

    syncOpsMap: function () {
        if (!this.opsMap) return;
        if (this.opsHomeMarker) this.opsHomeMarker.setLatLng(this.state.userLocation);
        if (this.opsTruckMarker) this.opsTruckMarker.setLatLng(this.state.truckLocation);
    },

    initLocationMap: function () {
        if (this.locationMap) return;
        this.locationMap = L.map('location-map', { zoomControl: false }).setView(this.state.userLocation, 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.locationMap);

        const pinIcon = L.divIcon({
            html: '<i class="fa-solid fa-location-dot" style="color:#d32f2f;font-size:30px;"></i>',
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        L.marker(this.state.userLocation, { icon: pinIcon }).addTo(this.locationMap);
    },

    initTrackingMap: function () {
        if (this.trackingMap) return;
        this.trackingMap = L.map('tracking-map', { zoomControl: false }).setView(this.state.truckLocation, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.trackingMap);

        L.marker(this.state.userLocation, { icon: this.homeIcon() }).addTo(this.trackingMap);

        const routeCoords = sim.route.map((point) => [point[0], point[1]]);
        this.routeLine = L.polyline(routeCoords, {
            color: '#4ade80',
            weight: 3,
            opacity: 0.5,
            dashArray: '6 6'
        }).addTo(this.trackingMap);

        if (this.state.isDriverOnline) {
            this.updateTruckMarker(this.state.truckLocation[0], this.state.truckLocation[1]);
        }
    },

    updateTruckMarker: function (lat, lng) {
        this.state.truckLocation = [lat, lng];

        const truckIcon = L.icon({
            iconUrl: this.assetPath('assets/images/rider_app.png'),
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -19]
        });

        if (this.map) {
            if (!this.truckMarker) this.truckMarker = L.marker([lat, lng], { icon: truckIcon }).addTo(this.map);
            else this.truckMarker.setLatLng([lat, lng]);
        }

        if (this.trackingMap) {
            if (!this.trackingTruckMarker) {
                this.trackingTruckMarker = L.marker([lat, lng], { icon: truckIcon }).addTo(this.trackingMap);
            } else {
                this.trackingTruckMarker.setLatLng([lat, lng]);
                this.trackingMap.panTo([lat, lng], { animate: true, duration: 0.8 });
            }

            const statusEl = document.getElementById('tracking-status');
            if (statusEl) statusEl.innerText = this.state.isTruckMoving ? 'En Route' : 'Rider Online';
        }

        this.updateDistanceDisplay(lat, lng);
        this.syncOpsMap();
    },

    updateDistanceDisplay: function (truckLat, truckLng) {
        const distanceEl = document.getElementById('truck-distance');
        const distMeters = this.haversine(truckLat, truckLng, this.state.userLocation[0], this.state.userLocation[1]);
        this.state.lastDistance = distMeters;

        if (distanceEl) {
            distanceEl.innerText = distMeters < 30 ? 'Arrived' : `${Math.round(distMeters)}m`;
        }

        this.refreshLiveStatusUI();
    },

    haversine: function (lat1, lng1, lat2, lng2) {
        const toRad = (value) => (value * Math.PI) / 180;
        const earthRadius = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    },

    homeIcon: function () {
        return L.divIcon({
            html: '<i class="fa-solid fa-house" style="color:#d32f2f;font-size:22px;"></i>',
            className: 'custom-div-icon',
            iconSize: [22, 22],
            iconAnchor: [11, 22]
        });
    },

    showToast: function (message) {
        const toast = document.getElementById('app-toast');
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
    },

    applyTheme: function (theme) {
        const phoneScreen = document.querySelector('.phone-screen');
        const isDark = theme === 'dark';

        if (isDark) {
            if (phoneScreen) phoneScreen.setAttribute('data-theme', 'dark');
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            if (phoneScreen) phoneScreen.removeAttribute('data-theme');
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }

        this.updateThemeIcons(isDark);
    },

    toggleTheme: function () {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        this.applyTheme(isDark ? 'light' : 'dark');
        this.log(`Switched to ${isDark ? 'light' : 'dark'} mode.`, 'info');
    },

    togglePushNotifications: function () {
        this.state.pushNotificationsEnabled = !this.state.pushNotificationsEnabled;
        const status = this.state.pushNotificationsEnabled ? 'Enabled' : 'Disabled';

        const dot = document.getElementById('push-status-dot');
        const text = document.getElementById('push-status-text');
        const btn = document.getElementById('btn-toggle-push');

        if (dot) dot.classList.toggle('online', this.state.pushNotificationsEnabled);
        if (text) text.innerText = status;
        if (btn) {
            btn.innerHTML = this.state.pushNotificationsEnabled
                ? '<i class="fa-solid fa-bell"></i> Disable Notifications'
                : '<i class="fa-solid fa-bell-slash"></i> Enable Notifications';
        }

        this.log(`Push notifications ${status.toLowerCase()}.`, 'info');
        this.showToast(this.state.pushNotificationsEnabled ? 'Notifications enabled' : 'Notifications disabled');
        this.refreshLiveStatusUI();
    },

    showCallOptions: function () {
        const choice = prompt('Choose call option (voice-only / sms-only / none / manual-selection)', this.state.callMode);
        if (choice === null) return;

        const validChoices = ['voice-only', 'sms-only', 'none', 'manual-selection'];
        if (!validChoices.includes(choice)) {
            this.showToast('Invalid call option');
            this.log('Invalid call mode chosen.', 'warn');
            return;
        }

        this.state.callMode = choice;
        this.showToast(`Call mode set to ${choice}`);
        this.log(`Call mode changed to ${choice}.`, 'info');
        this.refreshLiveStatusUI();
    },

    showNotification: function () {
        const popup = document.getElementById('notification-popup');
        if (popup) popup.classList.add('show');
        this.playSound();
        this.state.notificationsSent += 1;
        this.setText('metric-notifications', String(this.state.notificationsSent));
        this.log('Push notification triggered.', 'warn');
        this.refreshLiveStatusUI();
    },

    closeNotification: function () {
        const popup = document.getElementById('notification-popup');
        if (popup) popup.classList.remove('show');
        if (this.notificationAudio) {
            this.notificationAudio.pause();
            this.notificationAudio.currentTime = 0;
        }
    },

    showVoiceCall: function (message = 'Waste truck is approaching your location.') {
        const popup = document.getElementById('voice-call-popup');
        const msgEl = document.getElementById('voice-call-message');
        if (msgEl) msgEl.innerText = message;
        if (popup) popup.classList.add('show');

        this.speak(message);
        clearTimeout(this.voiceCallTimer);
        this.voiceCallTimer = window.setTimeout(() => this.closeVoiceCall(), 4500);
    },

    closeVoiceCall: function () {
        const popup = document.getElementById('voice-call-popup');
        if (popup) popup.classList.remove('show');
        try {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        } catch (_) {}
    },

    speak: function (text) {
        try {
            if (!('speechSynthesis' in window)) {
                this.log('Speech synthesis not supported.', 'warn');
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        } catch (_) {
            this.log('Voice call blocked or unavailable by browser.', 'warn');
        }
    },

    playSound: function () {
        try {
            if (this.notificationAudio) {
                this.notificationAudio.pause();
                this.notificationAudio.currentTime = 0;
            }
            this.notificationAudio = new Audio(this.assetPath('assets/sounds/truck_alert.mp3'));
            this.notificationAudio.play().catch(() => {
                this.log('Audio blocked. Interact with the page first.', 'warn');
            });
        } catch (error) {
            console.error('Audio error', error);
        }
    },

    log: function (message, type = 'info') {
        const time = new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        this.state.events.push({
            ts: new Date().toISOString(),
            time,
            type,
            msg: message
        });

        const cls = type === 'success'
            ? 'log-success'
            : type === 'warn'
                ? 'log-warn'
                : type === 'error'
                    ? 'log-error'
                    : 'log-info';

        const prefix = type === 'success'
            ? '✓'
            : type === 'warn'
                ? '⚠'
                : type === 'error'
                    ? '✗'
                    : '›';

        ['sim-console', 'sim-console-events'].forEach((id) => {
            const consoleDiv = document.getElementById(id);
            if (!consoleDiv) return;
            consoleDiv.innerHTML += `<div class="${cls}">[${time}] ${prefix} ${message}</div>`;
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        });
    }
};

const simUI = {
    setTab: function (tabId) {
        document.querySelectorAll('.sim-nav-item').forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-sim-tab') === tabId);
        });

        document.querySelectorAll('.sim-tab').forEach((panel) => {
            panel.classList.toggle('active', panel.getAttribute('data-sim-tab-panel') === tabId);
        });

        if (tabId === 'overview') {
            window.setTimeout(() => {
                try {
                    if (app.opsMap) app.opsMap.invalidateSize();
                } catch (_) {}
            }, 60);
        }
    },

    centerOpsMap: function () {
        if (!app.opsMap) return;
        const bounds = L.latLngBounds([app.state.userLocation, app.state.truckLocation]);
        app.opsMap.fitBounds(bounds.pad(0.25), { animate: true, duration: 0.6 });
    },

    runScenario: function (scenarioId) {
        if (scenarioId === 'full-demo') {
            if (!app.state.isDriverOnline) sim.toggleDriver();
            sim.resetRoute(true);
            window.setTimeout(() => sim.startRoute(), 420);
            return;
        }

        if (scenarioId === 'nearby-alert') {
            if (!app.state.isDriverOnline) sim.toggleDriver();
            const user = app.state.userLocation;
            const nearby = [user[0] + 0.00045, user[1] + 0.00045];
            app.updateTruckMarker(nearby[0], nearby[1]);
            sim.triggerNotification();
            return;
        }

        if (scenarioId === 'voice-only') {
            sim.triggerVoiceCall('scenario');
        }
    }
};

const sim = {
    route: [
        [12.9750, 77.5980],
        [12.9745, 77.5975],
        [12.9740, 77.5970],
        [12.9735, 77.5965],
        [12.9730, 77.5960],
        [12.9725, 77.5955],
        [12.9720, 77.5950],
        [12.9716, 77.5946]
    ],
    currentStep: 0,
    isPaused: false,

    getStepDelay: function () {
        return 1200 / Math.max(0.5, app.state.routeSpeed);
    },

    generateRouteToUser: function () {
        const start = app.state.truckLocation;
        const end = app.state.userLocation;
        const steps = 10;
        const route = [];

        for (let i = 0; i <= steps; i += 1) {
            const t = i / steps;
            route.push([
                start[0] + (end[0] - start[0]) * t,
                start[1] + (end[1] - start[1]) * t
            ]);
        }

        this.route = route;
        this.currentStep = 0;

        if (app.trackingMap && this.route.length > 1) {
            if (app.routeLine) app.trackingMap.removeLayer(app.routeLine);
            app.routeLine = L.polyline(this.route, {
                color: '#4ade80',
                weight: 3,
                opacity: 0.5,
                dashArray: '6 6'
            }).addTo(app.trackingMap);
        }
    },

    togglePause: function () {
        if (!app.state.isTruckMoving) return;
        this.isPaused = !this.isPaused;
        app.state.isTruckMoving = !this.isPaused;

        const pauseBtn = document.getElementById('btn-pause-truck');
        if (pauseBtn) {
            pauseBtn.innerHTML = this.isPaused
                ? '<i class="fa-solid fa-play"></i> Resume'
                : '<i class="fa-solid fa-pause"></i> Pause';
        }

        app.setText('metric-truck-status', this.isPaused ? 'Paused' : 'En Route');
        app.log(this.isPaused ? 'Route paused.' : 'Route resumed.', this.isPaused ? 'warn' : 'success');
        app.showToast(this.isPaused ? 'Route paused' : 'Route resumed');
        app.refreshLiveStatusUI();
    },

    updateSpeed: function (value) {
        app.state.routeSpeed = parseFloat(value);
        app.setText('speed-value', `${app.state.routeSpeed.toFixed(1)}x`);

        if (app.state.isTruckMoving && !this.isPaused) {
            clearInterval(app.routeInterval);
            app.routeInterval = setInterval(() => this.routeStep(), this.getStepDelay());
        }
    },

    routeStep: function () {
        if (this.isPaused) return;

        const totalSteps = this.route.length;
        if (this.currentStep >= totalSteps) {
            this.finishRoute();
            return;
        }

        const position = this.route[this.currentStep];
        app.updateTruckMarker(position[0], position[1]);
        app.state.truckLocation = position;

        const progress = ((this.currentStep + 1) / totalSteps) * 100;
        const progressBar = document.getElementById('truck-progress');
        if (progressBar) progressBar.style.width = `${progress}%`;

        const progressPct = Math.round(progress);
        app.setText('metric-progress', `${progressPct}%`);

        const remainingSteps = Math.max(0, totalSteps - (this.currentStep + 1));
        const etaSeconds = (remainingSteps * this.getStepDelay()) / 1000;
        if (etaSeconds <= 0) {
            app.setText('metric-eta', '0:00');
        } else {
            const mins = Math.floor(etaSeconds / 60);
            const secs = Math.floor(etaSeconds % 60).toString().padStart(2, '0');
            app.setText('metric-eta', `${mins}:${secs}`);
        }

        if (progressPct === 50) app.log('Truck is 50% through the route.', 'info');

        if (this.currentStep === totalSteps - 3) {
            app.showNotification();
            app.log('Truck is nearby, notifying resident.', 'warn');

            const autoVoiceEl = document.getElementById('auto-voice-call');
            if (autoVoiceEl && autoVoiceEl.checked) {
                this.triggerVoiceCall('auto');
            }
        }

        this.currentStep += 1;
    },

    stopRouteInterval: function () {
        clearInterval(app.routeInterval);
    },

    toggleDriver: function () {
        app.state.isDriverOnline = !app.state.isDriverOnline;

        const statusText = document.getElementById('driver-status-text');
        const statusDot = document.getElementById('driver-status-dot');
        const fabOnline = document.getElementById('fab-online');
        const toggleBtn = document.getElementById('btn-toggle-driver');

        if (app.state.isDriverOnline) {
            if (statusText) statusText.innerText = 'Online';
            if (statusDot) statusDot.classList.add('online');
            if (fabOnline) fabOnline.classList.add('active');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> Take Truck Offline';

            app.state.truckLocation = this.route[0];
            app.updateTruckMarker(this.route[0][0], this.route[0][1]);
            this.generateRouteToUser();
            app.setText('metric-truck-status', 'Online');
            app.setText('metric-eta', '--');
            app.setText('metric-progress', '0%');
            app.log('Truck is now online at the route start position.', 'success');
            app.showToast('Truck online');
        } else {
            if (statusText) statusText.innerText = 'Offline';
            if (statusDot) statusDot.classList.remove('online');
            if (fabOnline) fabOnline.classList.remove('active');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> Bring Trucks Online';

            if (app.truckMarker && app.map) {
                app.map.removeLayer(app.truckMarker);
                app.truckMarker = null;
            }

            if (app.trackingTruckMarker && app.trackingMap) {
                app.trackingMap.removeLayer(app.trackingTruckMarker);
                app.trackingTruckMarker = null;
            }

            app.state.lastDistance = null;
            app.setText('tracking-status', 'Rider Offline');
            this.resetRoute(true);
            app.setText('metric-truck-status', 'Offline');
            app.setText('metric-eta', '--');
            app.setText('metric-progress', '0%');
            app.log('Truck went offline.', 'warn');
            app.showToast('Truck offline');
        }

        app.refreshLiveStatusUI();
    },

    startRoute: function () {
        if (!app.state.isDriverOnline) {
            app.showToast('Bring truck online first');
            app.log('Start attempt failed because the truck is offline.', 'error');
            return;
        }

        if (app.state.isTruckMoving && !this.isPaused) {
            app.showToast('Truck is already moving');
            return;
        }

        app.state.isTruckMoving = true;
        this.isPaused = false;

        const fabStart = document.getElementById('fab-start');
        const startBtn = document.getElementById('btn-start-truck');
        const pauseBtn = document.getElementById('btn-pause-truck');

        if (fabStart) fabStart.classList.add('running');
        if (startBtn) {
            startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> En Route...';
            startBtn.disabled = true;
        }
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
            pauseBtn.disabled = false;
        }

        app.setText('metric-truck-status', 'En Route');
        app.setText('metric-eta', '--');
        app.setText('metric-progress', '0%');

        this.currentStep = 0;
        this.generateRouteToUser();
        app.log('Truck started the route towards the resident.', 'success');
        app.showToast('Truck started');
        app.routeInterval = setInterval(() => this.routeStep(), this.getStepDelay());
        app.refreshLiveStatusUI();
    },

    resetRoute: function (silent = false) {
        clearInterval(app.routeInterval);
        app.state.isTruckMoving = false;
        this.currentStep = 0;
        this.isPaused = false;

        const progressBar = document.getElementById('truck-progress');
        const fabStart = document.getElementById('fab-start');
        const startBtn = document.getElementById('btn-start-truck');
        const pauseBtn = document.getElementById('btn-pause-truck');

        if (progressBar) progressBar.style.width = '0%';
        if (fabStart) fabStart.classList.remove('running');
        if (startBtn) {
            startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Truck';
            startBtn.disabled = false;
        }
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
            pauseBtn.disabled = true;
        }

        app.closeNotification();
        app.closeVoiceCall();
        this.stopRouteInterval();

        app.setText('metric-truck-status', app.state.isDriverOnline ? 'Online' : 'Offline');
        app.setText('metric-eta', '--');
        app.setText('metric-progress', '0%');

        if (app.state.isDriverOnline) {
            app.updateTruckMarker(this.route[0][0], this.route[0][1]);
            app.setText('tracking-status', 'Rider Online');
        } else {
            app.state.lastDistance = null;
        }

        if (!silent) {
            app.log('Route reset to the start position.', 'info');
            app.showToast('Route reset');
        }

        app.refreshLiveStatusUI();
    },

    finishRoute: function () {
        clearInterval(app.routeInterval);
        app.state.isTruckMoving = false;
        this.isPaused = false;

        const fabStart = document.getElementById('fab-start');
        const startBtn = document.getElementById('btn-start-truck');
        const pauseBtn = document.getElementById('btn-pause-truck');
        const progressBar = document.getElementById('truck-progress');

        if (fabStart) fabStart.classList.remove('running');
        if (startBtn) {
            startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Truck';
            startBtn.disabled = false;
        }
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
            pauseBtn.disabled = true;
        }
        if (progressBar) progressBar.style.width = '100%';

        app.setText('tracking-status', '✓ Arrived');
        app.setText('metric-truck-status', 'Arrived');
        app.setText('metric-eta', '0:00');
        app.setText('metric-progress', '100%');

        app.log('Truck arrived at the resident location.', 'success');
        app.showToast('Truck arrived');
        app.refreshLiveStatusUI();
    },

    triggerNotification: function () {
        app.showNotification();
        app.log('Notification manually triggered.', 'warn');

        const autoVoiceEl = document.getElementById('auto-voice-call');
        if (autoVoiceEl && autoVoiceEl.checked) {
            this.triggerVoiceCall('auto-manual-notif');
        }
    },

    triggerVoiceCall: function (source = 'manual') {
        const message = 'Trash Buddy alert: the waste truck is getting close to your location.';
        app.state.voiceCallsMade += 1;
        app.setText('metric-voice-calls', String(app.state.voiceCallsMade));
        app.showVoiceCall(message);
        app.log(`Voice call triggered (${source}).`, 'warn');
        app.refreshLiveStatusUI();
    },

    exportEvents: function () {
        const payload = {
            generatedAt: new Date().toISOString(),
            events: app.state.events || []
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `trashbuddy-sim-events-${Date.now()}.json`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);

        app.showToast('Event log exported');
        app.log('Exported event log JSON.', 'success');
    },

    clearEvents: function () {
        app.state.events = [];
        app.state.notificationsSent = 0;
        app.state.voiceCallsMade = 0;

        const consoles = ['sim-console', 'sim-console-events'];
        consoles.forEach((id, index) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = index === 0 ? '<div>&gt; Log cleared.</div>' : '<div>&gt; Events mirror cleared.</div>';
        });

        app.setText('metric-notifications', '0');
        app.setText('metric-voice-calls', '0');
        app.closeNotification();
        app.closeVoiceCall();
        app.showToast('Events cleared');
        app.log('Events cleared by user.', 'info');
        app.refreshLiveStatusUI();
    }
};

app.init();
