const app = {
    state: {
        isLoggedIn: false,
        userLocation: [12.9716, 77.5946], // Bangalore coordinates
        truckLocation: [12.9750, 77.5980], // Slightly away
        isDriverOnline: false,
        isTruckMoving: false
    },
    map: null,
    locationMap: null,
    trackingMap: null,
    userMarker: null,
    truckMarker: null,
    trackingTruckMarker: null, // Marker for the full-screen tracking map
    routeInterval: null,

    init: function() {
        this.log("System initialized.");
        
        // Check for persistent login
        if (localStorage.getItem('isLoggedIn') === 'true') {
            this.loginSuccess(true); // Pass true to skip animation/delay if needed
        }
    },

    // --- AUTH ---
    sendOtp: function() {
        const phone = document.getElementById('login-phone').value;
        if(phone.length < 10) {
            alert("Please enter a valid phone number");
            return;
        }
        document.getElementById('otp-section').style.display = 'block';
        this.log(`OTP sent to ${phone}`);
    },

    verifyOtp: function() {
        const otp = document.getElementById('login-otp').value;
        if(otp === '1122') {
            this.loginSuccess();
        } else {
            alert("Invalid OTP (Try 1122)");
        }
    },

    loginSuccess: function(isAutoLogin = false) {
        this.state.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        
        document.getElementById('screen-login').classList.remove('active');
        document.getElementById('screen-home').classList.add('active');
        
        if(isAutoLogin) {
            this.log("User auto-logged in from session.");
        } else {
            this.log("User logged in successfully.");
        }
        
        // Initialize map after screen is visible
        setTimeout(() => {
            this.initMap();
        }, 500);
    },

    logout: function() {
        this.state.isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        
        document.querySelectorAll('.app-screen').forEach(el => el.classList.remove('active'));
        document.getElementById('screen-login').classList.add('active');
        document.getElementById('otp-section').style.display = 'none';
        document.getElementById('login-otp').value = '';
        this.log("User logged out.");
    },

    // --- NAVIGATION ---
    openLocationScreen: function() {
        document.getElementById('screen-home').classList.remove('active');
        document.getElementById('screen-location').classList.add('active');
        
        setTimeout(() => {
            this.initLocationMap();
        }, 300);
    },

    openTrackingScreen: function() {
        document.getElementById('screen-home').classList.remove('active');
        document.getElementById('screen-tracking').classList.add('active');
        
        setTimeout(() => {
            this.initTrackingMap();
        }, 300);
    },

    goBack: function() {
        document.querySelectorAll('.app-screen').forEach(el => el.classList.remove('active'));
        document.getElementById('screen-home').classList.add('active');
    },

    saveLocation: function() {
        this.log("Location updated to: 123, Green Street");
        this.showToast("Location Saved Successfully!");
        setTimeout(() => {
            this.goBack();
        }, 1000);
    },

    // --- MAPS ---
    initMap: function() {
        if(this.map) return; // Already initialized

        this.map = L.map('user-map').setView(this.state.userLocation, 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // User Marker (Home)
        const homeIcon = L.divIcon({
            html: '<i class="fa-solid fa-house" style="color: #d32f2f; font-size: 24px;"></i>',
            className: 'custom-div-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
        });

        this.userMarker = L.marker(this.state.userLocation, {icon: homeIcon}).addTo(this.map);
        
        this.log("Home Map loaded.");
    },

    initLocationMap: function() {
        if(this.locationMap) return;

        this.locationMap = L.map('location-map').setView(this.state.userLocation, 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.locationMap);
        
        const pinIcon = L.divIcon({
            html: '<i class="fa-solid fa-location-dot" style="color: #d32f2f; font-size: 32px;"></i>',
            className: 'custom-div-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
        L.marker(this.state.userLocation, {icon: pinIcon}).addTo(this.locationMap);
    },

    initTrackingMap: function() {
        if(this.trackingMap) return;

        this.trackingMap = L.map('tracking-map').setView(this.state.truckLocation, 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.trackingMap);

        // Add user home to tracking map too
        const homeIcon = L.divIcon({
            html: '<i class="fa-solid fa-house" style="color: #d32f2f; font-size: 24px;"></i>',
            className: 'custom-div-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
        });
        L.marker(this.state.userLocation, {icon: homeIcon}).addTo(this.trackingMap);
    },

    updateTruckMarker: function(lat, lng) {
        const truckIcon = L.divIcon({
            html: '<i class="fa-solid fa-truck" style="color: #2e7d32; font-size: 24px;"></i>',
            className: 'custom-div-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        // Update Home Map
        if(this.map) {
            if(!this.truckMarker) {
                this.truckMarker = L.marker([lat, lng], {icon: truckIcon}).addTo(this.map);
            } else {
                this.truckMarker.setLatLng([lat, lng]);
            }
        }

        // Update Tracking Map
        if(this.trackingMap) {
            if(!this.trackingTruckMarker) {
                this.trackingTruckMarker = L.marker([lat, lng], {icon: truckIcon}).addTo(this.trackingMap);
            } else {
                this.trackingTruckMarker.setLatLng([lat, lng]);
                this.trackingMap.panTo([lat, lng]); // Follow truck
            }
            
            // Update status text
            const statusEl = document.getElementById('tracking-status');
            if(statusEl) {
                statusEl.innerText = this.state.isTruckMoving ? "Arriving in 2 mins" : "Driver Online";
            }
        }
    },

    // --- UI UTILS ---
    showToast: function(msg) {
        alert(msg); // Simple alert for now
    },

    toggleTheme: function() {
        const phoneScreen = document.querySelector('.phone-screen');
        const icon = document.getElementById('theme-icon');
        
        if (phoneScreen.getAttribute('data-theme') === 'dark') {
            phoneScreen.removeAttribute('data-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            this.log("Switched to Light Mode");
        } else {
            phoneScreen.setAttribute('data-theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            this.log("Switched to Dark Mode");
        }
    },

    showNotification: function() {
        const popup = document.getElementById('notification-popup');
        popup.classList.add('show');
        
        // Play sound
        try {
            const audio = new Audio('assets/sounds/truck_alert.mp3');
            audio.play().catch(e => {
                this.log("⚠️ Audio blocked by browser. Interact with page first.");
            });
        } catch (e) {
            console.error("Audio error", e);
        }
        
        this.log("🔔 Notification triggered!");
    },

    closeNotification: function() {
        document.getElementById('notification-popup').classList.remove('show');
    },

    log: function(msg) {
        const consoleDiv = document.getElementById('sim-console');
        const time = new Date().toLocaleTimeString();
        consoleDiv.innerHTML += `<div>[${time}] ${msg}</div>`;
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
};

// --- SIMULATION CONTROLLER ---
const sim = {
    route: [
        [12.9750, 77.5980],
        [12.9745, 77.5975],
        [12.9740, 77.5970],
        [12.9735, 77.5965],
        [12.9730, 77.5960],
        [12.9725, 77.5955],
        [12.9720, 77.5950],
        [12.9716, 77.5946] // Destination (User)
    ],
    currentStep: 0,

    toggleDriver: function() {
        app.state.isDriverOnline = !app.state.isDriverOnline;
        const statusText = document.getElementById('driver-status-text');
        const statusDot = document.getElementById('driver-status-dot');
        
        if(app.state.isDriverOnline) {
            statusText.innerText = "Online";
            statusDot.classList.add('online');
            app.log("Driver is now ONLINE.");
            
            // Show truck on map at start position
            app.state.truckLocation = this.route[0];
            app.updateTruckMarker(this.route[0][0], this.route[0][1]);
        } else {
            statusText.innerText = "Offline";
            statusDot.classList.remove('online');
            app.log("Driver went OFFLINE.");
            
            // Remove markers
            if(app.truckMarker && app.map) {
                app.map.removeLayer(app.truckMarker);
                app.truckMarker = null;
            }
            if(app.trackingTruckMarker && app.trackingMap) {
                app.trackingMap.removeLayer(app.trackingTruckMarker);
                app.trackingTruckMarker = null;
            }
            
            // Update tracking status text
            const trackStatus = document.getElementById('tracking-status');
            if(trackStatus) trackStatus.innerText = "Driver Offline";

            this.resetRoute();
        }
    },

    startRoute: function() {
        if(!app.state.isDriverOnline) {
            alert("Please switch Driver to ONLINE first.");
            return;
        }
        if(app.state.isTruckMoving) return;

        app.state.isTruckMoving = true;
        app.log("🚚 Truck started route...");
        
        this.currentStep = 0;
        const totalSteps = this.route.length;
        const progressBar = document.getElementById('truck-progress');

        app.routeInterval = setInterval(() => {
            if(this.currentStep >= totalSteps) {
                this.finishRoute();
                return;
            }

            const pos = this.route[this.currentStep];
            app.updateTruckMarker(pos[0], pos[1]);
            app.state.truckLocation = pos;

            // Update progress bar
            const progress = ((this.currentStep + 1) / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;

            // Check for notification trigger (e.g., 2 steps away)
            if(this.currentStep === totalSteps - 3) {
                app.showNotification();
            }

            this.currentStep++;
        }, 1000); // Move every 1 second
    },

    resetRoute: function() {
        clearInterval(app.routeInterval);
        app.state.isTruckMoving = false;
        this.currentStep = 0;
        document.getElementById('truck-progress').style.width = '0%';
        app.closeNotification();
        
        if(app.state.isDriverOnline) {
            app.updateTruckMarker(this.route[0][0], this.route[0][1]);
        }
        app.log("Route reset.");
    },

    finishRoute: function() {
        clearInterval(app.routeInterval);
        app.state.isTruckMoving = false;
        app.log("Truck arrived at location.");
        const trackStatus = document.getElementById('tracking-status');
        if(trackStatus) trackStatus.innerText = "Arrived";
    },

    triggerNotification: function() {
        app.showNotification();
    }
};

// Init
app.init();
