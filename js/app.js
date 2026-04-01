const app = {
    state: {
        isLoggedIn: false,
        userLocation: [12.9716, 77.5946], // Bangalore coordinates
        truckLocation: [12.9750, 77.5980],
        isDriverOnline: false,
        isTruckMoving: false,
        routeSpeed: 1,
        isPaused: false,
        lastDistance: null
    },
    map: null,
    locationMap: null,
    trackingMap: null,
    userMarker: null,
    truckMarker: null,
    trackingTruckMarker: null,
    routeInterval: null,
    toastTimer: null,
    notificationAudio: null,

    init: function () {
        this.log('System initialized. Ready to simulate.', 'info');

        if (localStorage.getItem('isLoggedIn') === 'true') {
            this.loginSuccess(true);
        }
        if (localStorage.getItem('theme') === 'dark') {
            this.applyTheme('dark');
        }
    },

    // ─── AUTH ─────────────────────────────────────────────────
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

        setTimeout(() => {
            document.getElementById('disclaimer-popup').classList.add('show');
        }, 800);

        this.log(isAutoLogin ? 'Auto-login from saved session.' : 'User logged in.', 'success');

        this.trackEvent('home_page_viewed', { method: 'simulation' });

        setTimeout(() => { this.initMap(); }, 400);
    },

    closeDisclaimer: function () {
        document.getElementById('disclaimer-popup').classList.remove('show');
        this.log('Simulation dashboard ready.', 'info');
    },

    logout: function () {
        this.state.isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        document.querySelectorAll('.app-screen').forEach(el => el.classList.remove('active'));
        document.getElementById('screen-login').classList.add('active');
        this.log('User logged out.', 'info');
    },

    // ─── NAVIGATION ───────────────────────────────────────────
    openLocationScreen: function () {
        document.getElementById('screen-home').classList.remove('active');
        document.getElementById('screen-location').classList.add('active');
        setTimeout(() => { this.initLocationMap(); }, 300);
    },

    openTrackingScreen: function () {
        document.getElementById('screen-home').classList.remove('active');
        document.getElementById('screen-tracking').classList.add('active');
        setTimeout(() => { this.initTrackingMap(); }, 300);

        // Reflect live truck status after navigation
        const statusEl = document.getElementById('tracking-status');
        if (statusEl) {
            if (!this.state.isDriverOnline) {
                statusEl.innerText = 'Rider Offline';
            } else if (this.state.isTruckMoving) {
                statusEl.innerText = 'En Route';
            } else {
                statusEl.innerText = 'Rider Online';
            }
        }
    },

    goBack: function () {
        document.querySelectorAll('.app-screen').forEach(el => el.classList.remove('active'));
        document.getElementById('screen-home').classList.add('active');
    },

    saveLocation: function () {
        const addressInput = document.getElementById('location-address');
        const latInput = document.getElementById('location-lat');
        const lngInput = document.getElementById('location-lng');

        let lat = parseFloat(latInput.value);
        let lng = parseFloat(lngInput.value);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            this.showToast('⚠️ Invalid coordinates. Keeping previous location.');
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

        if (this.trackingMap) {
            this.trackingMap.setView(this.state.truckLocation, 15);
            sim.generateRouteToUser();
        }

        this.log(`Location updated → ${addressInput.value || 'Custom coordinates'} (${lat.toFixed(5)}, ${lng.toFixed(5)})`, 'success');
        this.showToast('📍 Location Saved!');
        setTimeout(() => { this.goBack(); }, 1000);
    },

    // ─── MAPS ─────────────────────────────────────────────────
    centerMap: function () {
        if (this.map && this.state.userLocation) {
            this.map.setView(this.state.userLocation, 15);
        }
    },

    initMap: function () {
        if (this.map) return;
        this.map = L.map('user-map', { zoomControl: false }).setView(this.state.userLocation, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.userMarker = L.marker(this.state.userLocation, { icon: this._homeIcon() }).addTo(this.map);
        this.log('Home map loaded.', 'info');
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

        // Draw home marker on tracking map too
        L.marker(this.state.userLocation, { icon: this._homeIcon() }).addTo(this.trackingMap);

        // Draw route path (polyline preview)
        const routeCoords = sim.route.map(p => [p[0], p[1]]);
        this._routeLine = L.polyline(routeCoords, {
            color: '#4ade80',
            weight: 3,
            opacity: 0.5,
            dashArray: '6 6'
        }).addTo(this.trackingMap);

        // If truck already visible, draw marker
        if (this.state.isDriverOnline) {
            this.updateTruckMarker(this.state.truckLocation[0], this.state.truckLocation[1]);
        }
    },

    updateTruckMarker: function (lat, lng) {
        const truckIcon = L.icon({
            iconUrl: 'assets/images/rider_app.png',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
            popupAnchor: [0, -19]
        });

        // Home map
        if (this.map) {
            if (!this.truckMarker) {
                this.truckMarker = L.marker([lat, lng], { icon: truckIcon }).addTo(this.map);
            } else {
                this.truckMarker.setLatLng([lat, lng]);
            }
        }

        // Tracking map
        if (this.trackingMap) {
            if (!this.trackingTruckMarker) {
                this.trackingTruckMarker = L.marker([lat, lng], { icon: truckIcon }).addTo(this.trackingMap);
            } else {
                this.trackingTruckMarker.setLatLng([lat, lng]);
                this.trackingMap.panTo([lat, lng], { animate: true, duration: 0.8 });
            }

            const statusEl = document.getElementById('tracking-status');
            if (statusEl) {
                statusEl.innerText = this.state.isTruckMoving ? 'En Route' : 'Rider Online';
            }
        }

        this.updateDistanceDisplay(lat, lng);
    },

    updateDistanceDisplay: function (truckLat, truckLng) {
        const distanceEl = document.getElementById('truck-distance');
        if (!distanceEl) return;
        const distMeters = this._haversine(truckLat, truckLng, this.state.userLocation[0], this.state.userLocation[1]);
        this.state.lastDistance = distMeters;
        if (distMeters < 30) {
            distanceEl.innerText = 'Arrived';
        } else {
            distanceEl.innerText = `${Math.round(distMeters)}m`;
        }
    },

    _haversine: function (lat1, lng1, lat2, lng2) {
        const toRad = x => (x * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    // ─── PRIVATE: Icon factories ──────────────────────────────
    _homeIcon: function () {
        return L.divIcon({
            html: '<i class="fa-solid fa-house" style="color:#d32f2f;font-size:22px;"></i>',
            className: 'custom-div-icon',
            iconSize: [22, 22],
            iconAnchor: [11, 22]
        });
    },

    // ─── UI UTILS ─────────────────────────────────────────────
    showToast: function (msg) {
        const toast = document.getElementById('app-toast');
        if (!toast) return;

        toast.innerText = msg;
        toast.classList.add('show');

        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },

    applyTheme: function (theme) {
        const phoneScreen = document.querySelector('.phone-screen');
        const icon = document.getElementById('theme-icon');

        if (theme === 'dark') {
            phoneScreen.setAttribute('data-theme', 'dark');
            if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
            localStorage.setItem('theme', 'dark');
        } else {
            phoneScreen.removeAttribute('data-theme');
            if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
            localStorage.setItem('theme', 'light');
        }
    },

    toggleTheme: function () {
        const phoneScreen = document.querySelector('.phone-screen');
        const isDark = phoneScreen.getAttribute('data-theme') === 'dark';
        this.applyTheme(isDark ? 'light' : 'dark');
        this.log(`Switched to ${isDark ? 'light' : 'dark'} mode.`, 'info');
    },

    showNotification: function () {
        const popup = document.getElementById('notification-popup');
        popup.classList.add('show');
        this._playSound();
        this.log('🔔 Push notification triggered!', 'warn');
    },

    closeNotification: function () {
        document.getElementById('notification-popup').classList.remove('show');
        if (this.notificationAudio) {
            this.notificationAudio.pause();
            this.notificationAudio.currentTime = 0;
        }
    },

    _playSound: function () {
        try {
            if (this.notificationAudio) {
                this.notificationAudio.pause();
                this.notificationAudio.currentTime = 0;
            }
            this.notificationAudio = new Audio('assets/sounds/truck_alert.mp3');
            this.notificationAudio.play().catch(() => {
                this.log('⚠️ Audio blocked — interact with page first.', 'warn');
            });
        } catch (e) {
            console.error('Audio error', e);
        }
    },

    log: function (msg, type = 'info') {
        const consoleDiv = document.getElementById('sim-console');
        if (!consoleDiv) return;
        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const cls = type === 'success' ? 'log-success'
                  : type === 'warn'    ? 'log-warn'
                  : type === 'error'   ? 'log-error'
                  : 'log-info';
        const prefix = type === 'success' ? '✓' : type === 'warn' ? '⚠' : type === 'error' ? '✗' : '›';
        consoleDiv.innerHTML += `<div class="${cls}">[${time}] ${prefix} ${msg}</div>`;
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
};

// ─── SIMULATION CONTROLLER ────────────────────────────────────
const sim = {
    route: [
        [12.9750, 77.5980],
        [12.9745, 77.5975],
        [12.9740, 77.5970],
        [12.9735, 77.5965],
        [12.9730, 77.5960],
        [12.9725, 77.5955],
        [12.9720, 77.5950],
        [12.9716, 77.5946]  // User's home
    ],
    currentStep: 0,
    isPaused: false,

    getStepDelay: function () {
        return 1200 / Math.max(0.5, app.state.routeSpeed);
    },

    generateRouteToUser: function () {
        // Generate dynamic route path when user location changes, ensuring simulation always heads to current destination.
        const start = app.state.truckLocation;
        const end = app.state.userLocation;
        const steps = 10;
        const newRoute = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            newRoute.push([
                start[0] + (end[0] - start[0]) * t,
                start[1] + (end[1] - start[1]) * t
            ]);
        }
        this.route = newRoute;
        this.currentStep = 0;
        if (app.trackingMap && this.route.length > 1) {
            if (app._routeLine) app.trackingMap.removeLayer(app._routeLine);
            app._routeLine = L.polyline(this.route, {
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

        if (this.isPaused) {
            pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
            app.log('🚦 Route paused.', 'warn');
            app.showToast('⏸️ Paused');
        } else {
            pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
            app.log('▶️ Route resumed.', 'success');
            app.showToast('▶️ Resumed');
        }
    },

    updateSpeed: function (value) {
        app.state.routeSpeed = parseFloat(value);
        const speedLabel = document.getElementById('speed-value');
        if (speedLabel) speedLabel.innerText = `${app.state.routeSpeed.toFixed(1)}x`;

        if (app.state.isTruckMoving && !this.isPaused) {
            clearInterval(app.routeInterval);
            app.routeInterval = setInterval(() => this._routeStep(), this.getStepDelay());
        }
    },

    _routeStep: function () {
        if (this.isPaused) return;

        const totalSteps = this.route.length;
        if (this.currentStep >= totalSteps) {
            this.finishRoute();
            return;
        }

        const pos = this.route[this.currentStep];
        app.updateTruckMarker(pos[0], pos[1]);
        app.state.truckLocation = pos;

        const progressBar = document.getElementById('truck-progress');
        if (progressBar) {
            const progress = ((this.currentStep + 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
        }

        const pct = Math.round(((this.currentStep + 1) / totalSteps) * 100);
        if (pct === 50) app.log('Truck is 50% on the route.', 'info');

        if (this.currentStep === totalSteps - 3) {
            app.showNotification();
            app.log('Truck is nearby, notifying user.', 'warn');
        }

        this.currentStep++;
    },

    stopRouteInterval: function () {
        clearInterval(app.routeInterval);
    },

    toggleDriver: function () {
        app.state.isDriverOnline = !app.state.isDriverOnline;
        const statusText = document.getElementById('driver-status-text');
        const statusDot  = document.getElementById('driver-status-dot');
        const fabOnline  = document.getElementById('fab-online');
        const toggleBtn  = document.getElementById('btn-toggle-driver');

        if (app.state.isDriverOnline) {
            if (statusText) statusText.innerText = 'Online';
            if (statusDot)  statusDot.classList.add('online');
            if (fabOnline)  fabOnline.classList.add('active');
            if (toggleBtn)  { toggleBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> Take Truck Offline'; }

            // Place truck at route start and calculate route to current user location
            app.state.truckLocation = this.route[0];
            app.updateTruckMarker(this.route[0][0], this.route[0][1]);
            this.generateRouteToUser();
            app.log('Truck is now ONLINE at start position.', 'success');
            app.showToast('🚛 Truck Online');
        } else {
            if (statusText) statusText.innerText = 'Offline';
            if (statusDot)  statusDot.classList.remove('online');
            if (fabOnline)  fabOnline.classList.remove('active');
            if (toggleBtn)  { toggleBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> Bring Trucks Online'; }

            // Remove truck markers
            if (app.truckMarker && app.map) {
                app.map.removeLayer(app.truckMarker);
                app.truckMarker = null;
            }
            if (app.trackingTruckMarker && app.trackingMap) {
                app.trackingMap.removeLayer(app.trackingTruckMarker);
                app.trackingTruckMarker = null;
            }

            const trackStatus = document.getElementById('tracking-status');
            if (trackStatus) trackStatus.innerText = 'Rider Offline';

            this.resetRoute(true);
            app.log('Truck went OFFLINE.', 'warn');
            app.showToast('🔴 Truck Offline');
        }
    },

    startRoute: function () {
        if (!app.state.isDriverOnline) {
            app.showToast('⚠️ Bring truck online first!');
            app.log('Start attempt failed — truck is offline.', 'error');
            return;
        }
        if (app.state.isTruckMoving && !this.isPaused) {
            app.showToast('Truck is already moving.');
            return;
        }

        app.state.isTruckMoving = true;
        this.isPaused = false;

        const fabStart = document.getElementById('fab-start');
        const startBtn = document.getElementById('btn-start-truck');
        const pauseBtn = document.getElementById('btn-pause-truck');

        if (fabStart) fabStart.classList.add('running');
        if (startBtn) { startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> En Route...'; startBtn.disabled = true; }
        if (pauseBtn) { pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause'; pauseBtn.disabled = false; }

        this.currentStep = 0;
        this.generateRouteToUser();

        app.log('🚛 Truck started route towards user.', 'success');
        app.showToast('🚛 Truck Started');

        app.routeInterval = setInterval(() => this._routeStep(), this.getStepDelay());
    },

    resetRoute: function (silent = false) {
        clearInterval(app.routeInterval);
        app.state.isTruckMoving = false;
        this.currentStep = 0;

        const progressBar = document.getElementById('truck-progress');
        const fabStart    = document.getElementById('fab-start');
        const startBtn    = document.getElementById('btn-start-truck');

        if (progressBar) progressBar.style.width = '0%';
        if (fabStart)    fabStart.classList.remove('running');
        if (startBtn)    { startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Truck'; startBtn.disabled = false; }

        const pauseBtn = document.getElementById('btn-pause-truck');
        if (pauseBtn)    { pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause'; pauseBtn.disabled = true; }

        this.isPaused = false;
        app.state.isTruckMoving = false;

        app.closeNotification();
        this.stopRouteInterval();

        // Reset truck to start position if online
        if (app.state.isDriverOnline) {
            app.updateTruckMarker(this.route[0][0], this.route[0][1]);
            const trackStatus = document.getElementById('tracking-status');
            if (trackStatus) trackStatus.innerText = 'Rider Online';
        }

        if (!silent) {
            app.log('Route reset to start position.', 'info');
            app.showToast('↺ Route Reset');
        }
    },

    finishRoute: function () {
        clearInterval(app.routeInterval);
        app.state.isTruckMoving = false;

        const fabStart   = document.getElementById('fab-start');
        const startBtn   = document.getElementById('btn-start-truck');
        const pauseBtn   = document.getElementById('btn-pause-truck');
        const trackStatus = document.getElementById('tracking-status');

        if (fabStart)    fabStart.classList.remove('running');
        if (startBtn)    { startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Truck'; startBtn.disabled = false; }
        if (pauseBtn)    { pauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause'; pauseBtn.disabled = true; }
        if (trackStatus) trackStatus.innerText = '✓ Arrived';

        const progressBar = document.getElementById('truck-progress');
        if (progressBar) progressBar.style.width = '100%';

        app.state.isTruckMoving = false;
        this.isPaused = false;
        this.stopRouteInterval();

        app.log('✓ Truck arrived at resident location!', 'success');
        app.showToast('✅ Truck Arrived!');
    },

    triggerNotification: function () {
        app.showNotification();
        app.log('Notification manually triggered.', 'warn');
    }
};

// Init
app.init();
