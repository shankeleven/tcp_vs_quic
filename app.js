// TCP vs QUIC Interactive Protocol Comparison
class ProtocolComparison {
    constructor() {
        this.currentDemo = 'handshake';
        this.animationSpeed = 1;
        this.networkLatency = 100;
        this.packetLoss = 1;
        this.bandwidth = 50;
        this.isPlaying = false;
        this.timelinePosition = 0;
        this.dragState = null;
        
        // Demo-specific state
        this.handshakeState = {
            tcp: { step: 0, rtt: 0, packets: [] },
            quic: { step: 0, rtt: 0, packets: [] }
        };
        
        this.streamingState = {
            tcp: { throughput: 0, streams: [] },
            quic: { throughput: 0, streams: [] }
        };
        
        this.migrationState = {
            currentNetwork: 'wifi',
            tcp: { connected: true, status: 'Normal' },
            quic: { connected: true, status: 'Normal', connectionId: 'ABC123XYZ' }
        };
        
        this.performanceState = {
            running: false,
            metrics: {
                tcp: { connectionTime: 0, throughput: 0, recoveryTime: 0 },
                quic: { connectionTime: 0, throughput: 0, recoveryTime: 0 }
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEventListeners();
        this.setupTooltips();
        this.setupDragAndDrop();
        this.initializeDefaults();
        this.setupPerformanceChart();
    }
    
    bindEventListeners() {
        // Demo switching
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchDemo(e.target.dataset.demo);
            });
        });
        
        // Global controls
        const latencySlider = document.getElementById('latency-slider');
        const speedSlider = document.getElementById('speed-slider');
        const presetSelector = document.getElementById('preset-selector');
        
        latencySlider.addEventListener('input', (e) => {
            this.networkLatency = parseInt(e.target.value);
            document.getElementById('latency-value').textContent = `${this.networkLatency}ms`;
            this.updateNetworkConditions();
        });
        
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = `${this.animationSpeed}x`;
            this.updateAnimationSpeed();
        });
        
        presetSelector.addEventListener('change', (e) => {
            this.applyNetworkPreset(e.target.value);
        });
        
        // Reset and save controls
        document.getElementById('reset-demo').addEventListener('click', () => {
            this.resetCurrentDemo();
        });
        
        document.getElementById('save-config').addEventListener('click', () => {
            this.saveConfiguration();
        });
        
        // Handshake demo controls
        this.bindHandshakeControls();
        
        // Streaming demo controls
        this.bindStreamingControls();
        
        // Migration demo controls
        this.bindMigrationControls();
        
        // Performance demo controls
        this.bindPerformanceControls();
        
        // Timeline controls
        this.bindTimelineControls();
        
        // Modal controls
        this.bindModalControls();
    }
    
    bindHandshakeControls() {
        // TCP handshake controls
        document.getElementById('tcp-start').addEventListener('click', () => {
            this.startTCPHandshake();
        });
        
        document.getElementById('tcp-step').addEventListener('click', () => {
            this.stepTCPHandshake();
        });
        
        // QUIC handshake controls
        document.getElementById('quic-start').addEventListener('click', () => {
            this.startQUICHandshake();
        });
        
        document.getElementById('quic-step').addEventListener('click', () => {
            this.stepQUICHandshake();
        });
        
        // Make endpoints clickable for state inspection
        document.querySelectorAll('.endpoint').forEach(endpoint => {
            endpoint.addEventListener('click', (e) => {
                this.showEndpointState(e.currentTarget);
            });
        });
    }
    
    bindStreamingControls() {
        const lossSlider = document.getElementById('loss-rate-slider');
        const bandwidthSlider = document.getElementById('bandwidth-slider');
        
        lossSlider?.addEventListener('input', (e) => {
            this.packetLoss = parseFloat(e.target.value);
            document.getElementById('loss-rate-value').textContent = `${this.packetLoss}%`;
            this.updateStreamingConditions();
        });
        
        bandwidthSlider?.addEventListener('input', (e) => {
            this.bandwidth = parseInt(e.target.value);
            document.getElementById('bandwidth-value').textContent = `${this.bandwidth} Mbps`;
            this.updateStreamingConditions();
        });
        
        document.getElementById('add-stream')?.addEventListener('click', () => {
            this.addStream();
        });
        
        document.getElementById('send-burst')?.addEventListener('click', () => {
            this.sendPacketBurst();
        });
    }
    
    bindMigrationControls() {
        // Network zone click handlers for easier interaction
        document.querySelectorAll('.network-zone').forEach(zone => {
            zone.addEventListener('click', () => {
                const networkType = zone.id.replace('-zone', '');
                this.handleNetworkChange(networkType);
            });
        });
    }
    
    bindPerformanceControls() {
        const durationSlider = document.getElementById('test-duration');
        const connectionsSlider = document.getElementById('connections-slider');
        
        durationSlider?.addEventListener('input', (e) => {
            document.getElementById('test-duration-value').textContent = `${e.target.value}s`;
        });
        
        connectionsSlider?.addEventListener('input', (e) => {
            document.getElementById('connections-value').textContent = e.target.value;
        });
        
        document.getElementById('start-benchmark')?.addEventListener('click', () => {
            this.startBenchmark();
        });
        
        document.getElementById('stop-benchmark')?.addEventListener('click', () => {
            this.stopBenchmark();
        });
    }
    
    bindTimelineControls() {
        const scrubber = document.getElementById('timeline-scrubber');
        
        scrubber?.addEventListener('input', (e) => {
            this.timelinePosition = parseFloat(e.target.value);
            this.seekToPosition(this.timelinePosition);
        });
        
        document.getElementById('timeline-play')?.addEventListener('click', () => {
            this.playTimeline();
        });
        
        document.getElementById('timeline-pause')?.addEventListener('click', () => {
            this.pauseTimeline();
        });
        
        document.getElementById('timeline-reset')?.addEventListener('click', () => {
            this.resetTimeline();
        });
    }
    
    bindModalControls() {
        document.getElementById('modal-close')?.addEventListener('click', () => {
            this.hideModal();
        });
        
        document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });
    }
    
    setupTooltips() {
        const tooltip = document.getElementById('interactive-tooltip');
        
        // Add tooltips to interactive elements
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target.dataset.tooltip, e);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
        
        // Add tooltips to packets
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('packet')) {
                this.showPacketTooltip(e.target, e);
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('packet')) {
                this.hideTooltip();
            }
        }, true);
    }
    
    setupDragAndDrop() {
        // Enhanced drag and drop for mobile device
        const device = document.getElementById('mobile-device');
        if (device) {
            // Use both mouse and touch events for better compatibility
            device.addEventListener('mousedown', (e) => {
                this.startDeviceDrag(e);
                e.preventDefault();
            });
            
            device.addEventListener('touchstart', (e) => {
                this.startDeviceDrag(e.touches[0]);
                e.preventDefault();
            });
            
            // Make device visually draggable
            device.style.cursor = 'grab';
            device.draggable = false; // Disable native drag to use custom implementation
        }
        
        // Global mouse/touch handlers
        document.addEventListener('mousemove', (e) => {
            this.handleDrag(e);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (this.dragState) {
                this.handleDrag(e.touches[0]);
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            this.stopDrag(e);
        });
        
        document.addEventListener('touchend', (e) => {
            this.stopDrag(e.changedTouches[0] || e);
        });
        
        // Make packets draggable
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('packet') && !e.target.closest('#mobile-device')) {
                this.startPacketDrag(e);
            }
        });
    }
    
    initializeDefaults() {
        // Initialize first demo
        this.showDemo('handshake');
        
        // Set up initial QUIC streams for streaming demo
        this.createInitialStreams();
        
        // Position mobile device initially in WiFi zone
        this.positionDeviceInZone('wifi');
    }
    
    positionDeviceInZone(zoneType) {
        const device = document.getElementById('mobile-device');
        const zone = document.getElementById(`${zoneType}-zone`);
        
        if (device && zone) {
            const container = document.querySelector('.network-environment');
            const containerRect = container.getBoundingClientRect();
            const zoneRect = zone.getBoundingClientRect();
            
            // Position device in the center of the zone
            const deviceX = zoneRect.left - containerRect.left + (zoneRect.width / 2) - 40;
            const deviceY = zoneRect.top - containerRect.top + (zoneRect.height / 2) - 25;
            
            device.style.position = 'absolute';
            device.style.left = `${deviceX}px`;
            device.style.top = `${deviceY}px`;
        }
    }
    
    setupPerformanceChart() {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        this.chartContext = canvas.getContext('2d');
        this.performanceData = {
            tcp: [],
            quic: []
        };
        
        this.drawPerformanceChart();
    }
    
    // Demo Management
    switchDemo(demoName) {
        // Update button states
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.classList.contains('btn--primary')) {
                btn.classList.remove('btn--primary');
                btn.classList.add('btn--secondary');
            }
        });
        
        const activeBtn = document.querySelector(`[data-demo="${demoName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'btn--primary');
            activeBtn.classList.remove('btn--secondary');
        }
        
        this.currentDemo = demoName;
        this.showDemo(demoName);
    }
    
    showDemo(demoName) {
        // Hide all demos
        document.querySelectorAll('.demo-container').forEach(demo => {
            demo.classList.add('hidden');
        });
        
        // Show selected demo
        const targetDemo = document.getElementById(`${demoName}-demo`);
        if (targetDemo) {
            targetDemo.classList.remove('hidden');
        }
        
        // Initialize demo-specific functionality
        switch (demoName) {
            case 'handshake':
                this.initHandshakeDemo();
                break;
            case 'streaming':
                this.initStreamingDemo();
                break;
            case 'migration':
                this.initMigrationDemo();
                break;
            case 'performance':
                this.initPerformanceDemo();
                break;
        }
    }
    
    resetCurrentDemo() {
        switch (this.currentDemo) {
            case 'handshake':
                this.resetHandshakeDemo();
                break;
            case 'streaming':
                this.resetStreamingDemo();
                break;
            case 'migration':
                this.resetMigrationDemo();
                break;
            case 'performance':
                this.resetPerformanceDemo();
                break;
        }
        
        this.showMessage('Demo reset', 'info');
    }
    
    // Handshake Demo
    initHandshakeDemo() {
        this.resetHandshakeDemo();
    }
    
    resetHandshakeDemo() {
        this.handshakeState.tcp = { step: 0, rtt: 0, packets: [] };
        this.handshakeState.quic = { step: 0, rtt: 0, packets: [] };
        
        // Clear packet lanes
        const tcpLane = document.getElementById('tcp-lane');
        const quicLane = document.getElementById('quic-lane');
        if (tcpLane) tcpLane.innerHTML = '';
        if (quicLane) quicLane.innerHTML = '';
        
        // Reset step indicators
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Reset state indicators
        const tcpClientState = document.getElementById('tcp-client-state');
        const tcpServerState = document.getElementById('tcp-server-state');
        const quicClientState = document.getElementById('quic-client-state');
        const quicServerState = document.getElementById('quic-server-state');
        
        if (tcpClientState) tcpClientState.textContent = 'Idle';
        if (tcpServerState) tcpServerState.textContent = 'Idle';
        if (quicClientState) quicClientState.textContent = 'Idle';
        if (quicServerState) quicServerState.textContent = 'Idle';
        
        // Reset RTT displays
        const tcpRtt = document.getElementById('tcp-rtt');
        const quicRtt = document.getElementById('quic-rtt');
        if (tcpRtt) tcpRtt.textContent = '0ms';
        if (quicRtt) quicRtt.textContent = '0ms';
    }
    
    startTCPHandshake() {
        this.resetHandshakeDemo();
        this.animateTCPHandshake();
    }
    
    startQUICHandshake() {
        this.resetHandshakeDemo();
        this.animateQUICHandshake();
    }
    
    stepTCPHandshake() {
        this.handshakeState.tcp.step++;
        this.executeTCPStep(this.handshakeState.tcp.step);
    }
    
    stepQUICHandshake() {
        this.handshakeState.quic.step++;
        this.executeQUICStep(this.handshakeState.quic.step);
    }
    
    animateTCPHandshake() {
        const steps = [
            { name: 'SYN', duration: this.networkLatency },
            { name: 'SYN-ACK', duration: this.networkLatency },
            { name: 'ACK', duration: this.networkLatency },
            { name: 'ClientHello', duration: this.networkLatency },
            { name: 'ServerHello', duration: this.networkLatency },
            { name: 'Finished', duration: this.networkLatency }
        ];
        
        let totalTime = 0;
        steps.forEach((step, index) => {
            setTimeout(() => {
                this.executeTCPStep(index + 1);
            }, totalTime / this.animationSpeed);
            totalTime += step.duration;
        });
        
        this.handshakeState.tcp.rtt = totalTime;
        setTimeout(() => {
            const tcpRtt = document.getElementById('tcp-rtt');
            if (tcpRtt) tcpRtt.textContent = `${totalTime}ms`;
        }, totalTime / this.animationSpeed);
    }
    
    animateQUICHandshake() {
        const steps = [
            { name: 'Initial+TLS', duration: this.networkLatency },
            { name: 'Handshake', duration: this.networkLatency },
            { name: '1-RTT Data', duration: this.networkLatency / 2 }
        ];
        
        let totalTime = 0;
        steps.forEach((step, index) => {
            setTimeout(() => {
                this.executeQUICStep(index + 1);
            }, totalTime / this.animationSpeed);
            totalTime += step.duration;
        });
        
        this.handshakeState.quic.rtt = totalTime;
        setTimeout(() => {
            const quicRtt = document.getElementById('quic-rtt');
            if (quicRtt) quicRtt.textContent = `${totalTime}ms`;
        }, totalTime / this.animationSpeed);
    }
    
    executeTCPStep(stepNumber) {
        const stepElement = document.getElementById(`tcp-step-${stepNumber}`);
        if (stepElement) {
            stepElement.classList.add('active');
            
            setTimeout(() => {
                stepElement.classList.remove('active');
                stepElement.classList.add('completed');
            }, 500);
        }
        
        // Create and animate packet
        this.createPacket('tcp-lane', stepNumber, 'tcp');
        
        // Update client/server states
        this.updateTCPStates(stepNumber);
    }
    
    executeQUICStep(stepNumber) {
        const stepElement = document.getElementById(`quic-step-${stepNumber}`);
        if (stepElement) {
            stepElement.classList.add('active');
            
            setTimeout(() => {
                stepElement.classList.remove('active');
                stepElement.classList.add('completed');
            }, 500);
        }
        
        // Create and animate packet
        this.createPacket('quic-lane', stepNumber, 'quic');
        
        // Update client/server states
        this.updateQUICStates(stepNumber);
    }
    
    createPacket(laneId, stepNumber, protocol) {
        const lane = document.getElementById(laneId);
        if (!lane) return;
        
        const packet = document.createElement('div');
        packet.className = 'packet';
        packet.textContent = stepNumber;
        packet.style.left = '0px';
        packet.style.top = '25px';
        
        // Add packet type classes
        if (protocol === 'tcp') {
            switch (stepNumber) {
                case 1: packet.classList.add('syn'); break;
                case 2: packet.classList.add('ack'); break;
                case 3: packet.classList.add('ack'); break;
                case 4: packet.classList.add('tls'); break;
                case 5: packet.classList.add('tls'); break;
                case 6: packet.classList.add('tls'); break;
            }
        } else {
            switch (stepNumber) {
                case 1: packet.classList.add('tls'); break;
                case 2: packet.classList.add('tls'); break;
                case 3: packet.classList.add('data'); break;
            }
        }
        
        // Make packet clickable
        packet.addEventListener('click', (e) => {
            this.showPacketDetails(e.target, protocol, stepNumber);
        });
        
        lane.appendChild(packet);
        
        // Animate packet movement
        setTimeout(() => {
            packet.classList.add('moving');
            packet.style.setProperty('--packet-duration', `${this.networkLatency / this.animationSpeed}ms`);
        }, 10);
        
        // Remove packet after animation
        setTimeout(() => {
            if (packet.parentNode) {
                packet.parentNode.removeChild(packet);
            }
        }, (this.networkLatency / this.animationSpeed) + 100);
    }
    
    updateTCPStates(stepNumber) {
        const clientState = document.getElementById('tcp-client-state');
        const serverState = document.getElementById('tcp-server-state');
        
        switch (stepNumber) {
            case 1:
                if (clientState) clientState.textContent = 'SYN-SENT';
                break;
            case 2:
                if (serverState) serverState.textContent = 'SYN-RECV';
                break;
            case 3:
                if (clientState) clientState.textContent = 'ESTABLISHED';
                if (serverState) serverState.textContent = 'ESTABLISHED';
                break;
            case 4:
                if (clientState) clientState.textContent = 'TLS-HELLO';
                break;
            case 5:
                if (serverState) serverState.textContent = 'TLS-HELLO';
                break;
            case 6:
                if (clientState) clientState.textContent = 'READY';
                if (serverState) serverState.textContent = 'READY';
                break;
        }
    }
    
    updateQUICStates(stepNumber) {
        const clientState = document.getElementById('quic-client-state');
        const serverState = document.getElementById('quic-server-state');
        
        switch (stepNumber) {
            case 1:
                if (clientState) clientState.textContent = 'INITIAL';
                if (serverState) serverState.textContent = 'INITIAL';
                break;
            case 2:
                if (clientState) clientState.textContent = 'HANDSHAKE';
                if (serverState) serverState.textContent = 'HANDSHAKE';
                break;
            case 3:
                if (clientState) clientState.textContent = 'READY';
                if (serverState) serverState.textContent = 'READY';
                break;
        }
    }
    
    // Streaming Demo
    initStreamingDemo() {
        this.createInitialStreams();
        this.startStreamingSimulation();
    }
    
    resetStreamingDemo() {
        this.streamingState.tcp = { throughput: 0, streams: [] };
        this.streamingState.quic = { throughput: 0, streams: [] };
        
        // Clear existing streams
        const tcpQueue = document.getElementById('tcp-packet-queue');
        const quicContainer = document.getElementById('quic-streams-container');
        
        if (tcpQueue) tcpQueue.innerHTML = '';
        if (quicContainer) quicContainer.innerHTML = '';
        
        this.createInitialStreams();
    }
    
    createInitialStreams() {
        // Create QUIC streams
        const container = document.getElementById('quic-streams-container');
        if (!container) return;
        
        container.innerHTML = ''; // Clear existing streams
        
        for (let i = 1; i <= 4; i++) {
            this.createStream(i);
        }
    }
    
    createStream(streamId) {
        const container = document.getElementById('quic-streams-container');
        if (!container) return;
        
        const streamLane = document.createElement('div');
        streamLane.className = 'stream-lane';
        streamLane.innerHTML = `
            <div class="stream-header">
                <span>Stream ${streamId}</span>
                <span class="stream-status" id="quic-stream-${streamId}-status">Active</span>
            </div>
            <div class="packet-queue" id="quic-stream-${streamId}-queue">
                <!-- Packets will be added here -->
            </div>
        `;
        
        container.appendChild(streamLane);
        
        // Update state
        if (!this.streamingState.quic.streams) {
            this.streamingState.quic.streams = [];
        }
        
        this.streamingState.quic.streams.push({
            id: streamId,
            status: 'active',
            packets: []
        });
    }
    
    addStream() {
        const nextId = this.streamingState.quic.streams.length + 1;
        if (nextId <= 10) {
            this.createStream(nextId);
            this.showMessage(`Stream ${nextId} added`, 'success');
        } else {
            this.showMessage('Maximum streams reached', 'warning');
        }
    }
    
    sendPacketBurst() {
        // Send packets to TCP queue
        this.addPacketsToTCP(5);
        
        // Send packets to QUIC streams
        this.streamingState.quic.streams.forEach(stream => {
            this.addPacketsToQUICStream(stream.id, Math.floor(Math.random() * 3) + 1);
        });
        
        this.updateThroughputMeters();
    }
    
    addPacketsToTCP(count) {
        const queue = document.getElementById('tcp-packet-queue');
        if (!queue) return;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const packet = this.createPacketElement('data', i + 1);
                queue.appendChild(packet);
                
                // Simulate head-of-line blocking
                if (Math.random() < this.packetLoss / 100) {
                    setTimeout(() => {
                        packet.classList.add('lost');
                        const status = document.getElementById('tcp-stream-status');
                        if (status) {
                            status.textContent = 'Blocked';
                            status.classList.add('blocked');
                        }
                    }, 500);
                }
            }, i * 100);
        }
    }
    
    addPacketsToQUICStream(streamId, count) {
        const queue = document.getElementById(`quic-stream-${streamId}-queue`);
        if (!queue) return;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const packet = this.createPacketElement('data', i + 1);
                queue.appendChild(packet);
                
                // QUIC handles packet loss per stream
                if (Math.random() < this.packetLoss / 100) {
                    setTimeout(() => {
                        packet.classList.add('lost');
                        const status = document.getElementById(`quic-stream-${streamId}-status`);
                        if (status) {
                            status.textContent = 'Retransmit';
                            status.classList.add('waiting');
                            
                            // Other streams continue
                            setTimeout(() => {
                                status.textContent = 'Active';
                                status.classList.remove('waiting');
                            }, 1000);
                        }
                    }, 500);
                }
            }, i * 50);
        }
    }
    
    createPacketElement(type, id) {
        const packet = document.createElement('div');
        packet.className = `packet ${type}`;
        packet.textContent = id;
        packet.addEventListener('click', () => {
            if (!packet.classList.contains('lost')) {
                packet.classList.add('lost');
                this.showMessage('Packet manually dropped', 'warning');
            }
        });
        return packet;
    }
    
    updateThroughputMeters() {
        const tcpThroughput = this.calculateTCPThroughput();
        const quicThroughput = this.calculateQUICThroughput();
        
        const tcpThroughputEl = document.getElementById('tcp-throughput');
        const quicThroughputEl = document.getElementById('quic-throughput');
        
        if (tcpThroughputEl) tcpThroughputEl.textContent = `${tcpThroughput.toFixed(1)} Mbps`;
        if (quicThroughputEl) quicThroughputEl.textContent = `${quicThroughput.toFixed(1)} Mbps`;
        
        const tcpBar = document.getElementById('tcp-throughput-bar');
        const quicBar = document.getElementById('quic-throughput-bar');
        
        if (tcpBar) tcpBar.style.width = `${(tcpThroughput / this.bandwidth) * 100}%`;
        if (quicBar) quicBar.style.width = `${(quicThroughput / this.bandwidth) * 100}%`;
    }
    
    calculateTCPThroughput() {
        // Simulate TCP throughput with head-of-line blocking
        const baseThroughput = this.bandwidth * 0.8; // 80% efficiency
        const lossImpact = this.packetLoss * 0.1;
        return Math.max(0, baseThroughput - (baseThroughput * lossImpact));
    }
    
    calculateQUICThroughput() {
        // QUIC is more resilient to packet loss
        const baseThroughput = this.bandwidth * 0.95; // 95% efficiency
        const lossImpact = this.packetLoss * 0.05;
        return Math.max(0, baseThroughput - (baseThroughput * lossImpact));
    }
    
    startStreamingSimulation() {
        setInterval(() => {
            if (this.currentDemo === 'streaming') {
                this.updateThroughputMeters();
            }
        }, 1000);
    }
    
    // Migration Demo
    initMigrationDemo() {
        this.setupNetworkZones();
        this.migrationState.currentNetwork = 'wifi';
        this.positionDeviceInZone('wifi');
        this.updateMigrationStatus();
    }
    
    resetMigrationDemo() {
        // Reset device position
        this.positionDeviceInZone('wifi');
        
        this.migrationState = {
            currentNetwork: 'wifi',
            tcp: { connected: true, status: 'Normal' },
            quic: { connected: true, status: 'Normal', connectionId: 'ABC123XYZ' }
        };
        
        this.updateMigrationStatus();
    }
    
    setupNetworkZones() {
        const zones = document.querySelectorAll('.network-zone');
        zones.forEach(zone => {
            // Remove existing listeners
            zone.replaceWith(zone.cloneNode(true));
        });
        
        // Re-add listeners to cloned elements
        document.querySelectorAll('.network-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('active');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('active');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('active');
                this.handleNetworkChange(zone.id.replace('-zone', ''));
            });
            
            // Add click handler for easier interaction
            zone.addEventListener('click', () => {
                const networkType = zone.id.replace('-zone', '');
                this.handleNetworkChange(networkType);
            });
        });
    }
    
    handleNetworkChange(newNetwork) {
        if (this.migrationState.currentNetwork === newNetwork) return;
        
        const oldNetwork = this.migrationState.currentNetwork;
        this.migrationState.currentNetwork = newNetwork;
        
        // Position device in new network
        this.positionDeviceInZone(newNetwork);
        
        // TCP connection drops
        this.migrationState.tcp.connected = false;
        this.migrationState.tcp.status = 'Connection Lost';
        
        // QUIC migrates seamlessly
        this.migrationState.quic.status = 'Migrating';
        
        this.updateMigrationStatus();
        
        // Simulate reconnection
        setTimeout(() => {
            // TCP needs new connection
            this.migrationState.tcp.connected = true;
            this.migrationState.tcp.status = 'Reconnected';
            
            // QUIC completes migration
            this.migrationState.quic.status = 'Normal';
            
            this.updateMigrationStatus();
        }, 2000);
        
        this.showMessage(`Network changed from ${oldNetwork} to ${newNetwork}`, 'info');
    }
    
    updateMigrationStatus() {
        // Update TCP status
        const tcpStatus = document.getElementById('tcp-connection-status');
        const tcpNetwork = document.getElementById('tcp-current-network');
        const tcpMigration = document.getElementById('tcp-migration-status');
        
        if (tcpStatus) {
            tcpStatus.textContent = this.migrationState.tcp.connected ? 'Connected' : 'Disconnected';
            tcpStatus.className = `status-indicator ${this.migrationState.tcp.connected ? 'connected' : ''}`;
        }
        if (tcpNetwork) tcpNetwork.textContent = this.migrationState.currentNetwork;
        if (tcpMigration) tcpMigration.textContent = this.migrationState.tcp.status;
        
        // Update QUIC status
        const quicStatus = document.getElementById('quic-connection-status');
        const quicNetwork = document.getElementById('quic-current-network');
        const quicMigration = document.getElementById('quic-migration-status');
        
        if (quicStatus) {
            quicStatus.textContent = 'Connected';
            quicStatus.className = `status-indicator connected ${this.migrationState.quic.status === 'Migrating' ? 'migrating' : ''}`;
        }
        if (quicNetwork) quicNetwork.textContent = this.migrationState.currentNetwork;
        if (quicMigration) quicMigration.textContent = this.migrationState.quic.status;
    }
    
    // Performance Demo
    initPerformanceDemo() {
        this.drawPerformanceChart();
    }
    
    resetPerformanceDemo() {
        this.performanceState.running = false;
        this.performanceState.metrics = {
            tcp: { connectionTime: 0, throughput: 0, recoveryTime: 0 },
            quic: { connectionTime: 0, throughput: 0, recoveryTime: 0 }
        };
        
        this.updatePerformanceDisplay();
        this.drawPerformanceChart();
    }
    
    startBenchmark() {
        if (this.performanceState.running) return;
        
        this.performanceState.running = true;
        const duration = parseInt(document.getElementById('test-duration')?.value || 10) * 1000;
        const connections = parseInt(document.getElementById('connections-slider')?.value || 5);
        
        this.showMessage('Benchmark started', 'info');
        
        // Simulate benchmark data
        this.runBenchmarkSimulation(duration, connections);
        
        setTimeout(() => {
            this.performanceState.running = false;
            this.showMessage('Benchmark completed', 'success');
        }, duration);
    }
    
    stopBenchmark() {
        this.performanceState.running = false;
        this.showMessage('Benchmark stopped', 'warning');
    }
    
    runBenchmarkSimulation(duration, connections) {
        const interval = 100; // Update every 100ms
        const updates = duration / interval;
        let currentUpdate = 0;
        
        const benchmarkInterval = setInterval(() => {
            if (!this.performanceState.running || currentUpdate >= updates) {
                clearInterval(benchmarkInterval);
                return;
            }
            
            // Simulate performance metrics
            const tcpConnectionTime = this.networkLatency * 3 + Math.random() * 20;
            const quicConnectionTime = this.networkLatency + Math.random() * 10;
            
            const tcpThroughput = this.calculateTCPThroughput() * connections;
            const quicThroughput = this.calculateQUICThroughput() * connections;
            
            const tcpRecoveryTime = this.packetLoss * 50 + Math.random() * 30;
            const quicRecoveryTime = this.packetLoss * 20 + Math.random() * 15;
            
            this.performanceState.metrics.tcp = {
                connectionTime: tcpConnectionTime,
                throughput: tcpThroughput,
                recoveryTime: tcpRecoveryTime
            };
            
            this.performanceState.metrics.quic = {
                connectionTime: quicConnectionTime,
                throughput: quicThroughput,
                recoveryTime: quicRecoveryTime
            };
            
            this.updatePerformanceDisplay();
            this.updatePerformanceChart();
            
            currentUpdate++;
        }, interval);
    }
    
    updatePerformanceDisplay() {
        const { tcp, quic } = this.performanceState.metrics;
        
        const tcpConnectionTime = document.getElementById('tcp-connection-time');
        const quicConnectionTime = document.getElementById('quic-connection-time');
        const tcpThroughputMetric = document.getElementById('tcp-throughput-metric');
        const quicThroughputMetric = document.getElementById('quic-throughput-metric');
        const tcpRecoveryTime = document.getElementById('tcp-recovery-time');
        const quicRecoveryTime = document.getElementById('quic-recovery-time');
        
        if (tcpConnectionTime) tcpConnectionTime.textContent = `${tcp.connectionTime.toFixed(1)}ms`;
        if (quicConnectionTime) quicConnectionTime.textContent = `${quic.connectionTime.toFixed(1)}ms`;
        if (tcpThroughputMetric) tcpThroughputMetric.textContent = `${tcp.throughput.toFixed(1)} Mbps`;
        if (quicThroughputMetric) quicThroughputMetric.textContent = `${quic.throughput.toFixed(1)} Mbps`;
        if (tcpRecoveryTime) tcpRecoveryTime.textContent = `${tcp.recoveryTime.toFixed(1)}ms`;
        if (quicRecoveryTime) quicRecoveryTime.textContent = `${quic.recoveryTime.toFixed(1)}ms`;
    }
    
    drawPerformanceChart() {
        if (!this.chartContext) return;
        
        const canvas = this.chartContext.canvas;
        const ctx = this.chartContext;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw chart background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw sample data
        this.drawChartData(ctx, canvas);
    }
    
    drawChartData(ctx, canvas) {
        const { tcp, quic } = this.performanceState.metrics;
        
        // Chart dimensions
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        // Draw axes
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border');
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw performance bars
        const barWidth = chartWidth / 6;
        const barSpacing = barWidth / 2;
        
        // TCP bars
        ctx.fillStyle = '#B4413C';
        ctx.fillRect(padding + barSpacing, canvas.height - padding - (tcp.throughput * 2), barWidth, tcp.throughput * 2);
        
        // QUIC bars
        ctx.fillStyle = '#1FB8CD';
        ctx.fillRect(padding + barSpacing * 3 + barWidth, canvas.height - padding - (quic.throughput * 2), barWidth, quic.throughput * 2);
        
        // Add labels
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        ctx.fillText('TCP', padding + barSpacing + barWidth / 2, canvas.height - 10);
        ctx.fillText('QUIC', padding + barSpacing * 3 + barWidth * 1.5, canvas.height - 10);
    }
    
    updatePerformanceChart() {
        if (!this.performanceData.tcp) this.performanceData.tcp = [];
        if (!this.performanceData.quic) this.performanceData.quic = [];
        
        this.performanceData.tcp.push(this.performanceState.metrics.tcp.throughput);
        this.performanceData.quic.push(this.performanceState.metrics.quic.throughput);
        
        // Limit data points
        if (this.performanceData.tcp.length > 50) {
            this.performanceData.tcp.shift();
            this.performanceData.quic.shift();
        }
        
        this.drawPerformanceChart();
    }
    
    // Enhanced Drag and Drop Handlers
    startPacketDrag(e) {
        this.dragState = {
            type: 'packet',
            element: e.target,
            startX: e.clientX,
            startY: e.clientY,
            elementStartX: e.target.offsetLeft,
            elementStartY: e.target.offsetTop
        };
        
        e.target.classList.add('dragging');
        e.preventDefault();
    }
    
    startDeviceDrag(e) {
        const rect = e.target.getBoundingClientRect();
        const container = document.querySelector('.network-environment');
        const containerRect = container.getBoundingClientRect();
        
        this.dragState = {
            type: 'device',
            element: e.target,
            startX: e.clientX,
            startY: e.clientY,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            container: container,
            containerRect: containerRect
        };
        
        e.target.style.cursor = 'grabbing';
        e.target.style.zIndex = '1000';
        e.preventDefault();
    }
    
    handleDrag(e) {
        if (!this.dragState) return;
        
        if (this.dragState.type === 'device') {
            const container = this.dragState.container;
            const containerRect = this.dragState.containerRect;
            
            // Calculate new position relative to container
            const newX = e.clientX - containerRect.left - this.dragState.offsetX;
            const newY = e.clientY - containerRect.top - this.dragState.offsetY;
            
            // Constrain to container bounds
            const maxX = container.clientWidth - this.dragState.element.offsetWidth;
            const maxY = container.clientHeight - this.dragState.element.offsetHeight;
            
            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const constrainedY = Math.max(0, Math.min(newY, maxY));
            
            this.dragState.element.style.left = `${constrainedX}px`;
            this.dragState.element.style.top = `${constrainedY}px`;
            
            // Highlight network zones
            const zones = document.querySelectorAll('.network-zone');
            zones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    zone.classList.add('active');
                } else {
                    zone.classList.remove('active');
                }
            });
        } else if (this.dragState.type === 'packet') {
            const deltaX = e.clientX - this.dragState.startX;
            const deltaY = e.clientY - this.dragState.startY;
            
            const newX = this.dragState.elementStartX + deltaX;
            const newY = this.dragState.elementStartY + deltaY;
            
            this.dragState.element.style.left = `${newX}px`;
            this.dragState.element.style.top = `${newY}px`;
        }
    }
    
    stopDrag(e) {
        if (!this.dragState) return;
        
        if (this.dragState.type === 'packet') {
            this.dragState.element.classList.remove('dragging');
        } else if (this.dragState.type === 'device') {
            this.dragState.element.style.cursor = 'grab';
            this.dragState.element.style.zIndex = '';
            
            // Check if dropped on a network zone
            const zones = document.querySelectorAll('.network-zone');
            let droppedZone = null;
            
            zones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    droppedZone = zone.id.replace('-zone', '');
                }
                zone.classList.remove('active');
            });
            
            if (droppedZone) {
                this.handleNetworkChange(droppedZone);
            } else {
                // Snap back to current network if not dropped on a zone
                this.positionDeviceInZone(this.migrationState.currentNetwork);
            }
        }
        
        this.dragState = null;
    }
    
    // Timeline Controls
    playTimeline() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.timelineAnimation = setInterval(() => {
            this.timelinePosition += 2;
            if (this.timelinePosition >= 100) {
                this.timelinePosition = 100;
                this.pauseTimeline();
            }
            
            const scrubber = document.getElementById('timeline-scrubber');
            if (scrubber) scrubber.value = this.timelinePosition;
            this.seekToPosition(this.timelinePosition);
        }, 100 / this.animationSpeed);
    }
    
    pauseTimeline() {
        this.isPlaying = false;
        if (this.timelineAnimation) {
            clearInterval(this.timelineAnimation);
            this.timelineAnimation = null;
        }
    }
    
    resetTimeline() {
        this.pauseTimeline();
        this.timelinePosition = 0;
        const scrubber = document.getElementById('timeline-scrubber');
        if (scrubber) scrubber.value = 0;
        this.seekToPosition(0);
    }
    
    seekToPosition(position) {
        // Update demo state based on timeline position
        if (this.currentDemo === 'handshake') {
            const tcpSteps = Math.floor((position / 100) * 6);
            const quicSteps = Math.floor((position / 100) * 3);
            
            // Reset and execute steps up to current position
            this.resetHandshakeDemo();
            
            for (let i = 1; i <= tcpSteps; i++) {
                this.executeTCPStep(i);
            }
            
            for (let i = 1; i <= quicSteps; i++) {
                this.executeQUICStep(i);
            }
        }
    }
    
    // Utility Functions
    applyNetworkPreset(presetName) {
        const presets = {
            excellent: { latency: 10, loss: 0, bandwidth: 1000 },
            good: { latency: 50, loss: 0.1, bandwidth: 100 },
            average: { latency: 100, loss: 1, bandwidth: 50 },
            poor: { latency: 200, loss: 3, bandwidth: 10 },
            terrible: { latency: 500, loss: 10, bandwidth: 1 }
        };
        
        const preset = presets[presetName];
        if (!preset) return;
        
        this.networkLatency = preset.latency;
        this.packetLoss = preset.loss;
        this.bandwidth = preset.bandwidth;
        
        // Update UI
        const latencySlider = document.getElementById('latency-slider');
        const lossSlider = document.getElementById('loss-rate-slider');
        const bandwidthSlider = document.getElementById('bandwidth-slider');
        
        if (latencySlider) {
            latencySlider.value = preset.latency;
            document.getElementById('latency-value').textContent = `${preset.latency}ms`;
        }
        if (lossSlider) {
            lossSlider.value = preset.loss;
            document.getElementById('loss-rate-value').textContent = `${preset.loss}%`;
        }
        if (bandwidthSlider) {
            bandwidthSlider.value = preset.bandwidth;
            document.getElementById('bandwidth-value').textContent = `${preset.bandwidth} Mbps`;
        }
        
        this.updateNetworkConditions();
        this.showMessage(`Applied ${presetName} network preset`, 'info');
    }
    
    updateNetworkConditions() {
        // Update demo-specific conditions
        this.updateStreamingConditions();
    }
    
    updateStreamingConditions() {
        this.updateThroughputMeters();
    }
    
    updateAnimationSpeed() {
        // Update CSS animation durations
        document.documentElement.style.setProperty('--animation-speed', this.animationSpeed);
    }
    
    saveConfiguration() {
        const config = {
            latency: this.networkLatency,
            speed: this.animationSpeed,
            packetLoss: this.packetLoss,
            bandwidth: this.bandwidth,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('protocol-comparison-config', JSON.stringify(config));
            this.showMessage('Configuration saved successfully', 'success');
        } catch (error) {
            this.showMessage('Configuration saved to current session', 'info');
        }
    }
    
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `status status--${type}`;
        messageEl.textContent = message;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '20px';
        messageEl.style.right = '20px';
        messageEl.style.zIndex = '3000';
        messageEl.style.maxWidth = '300px';
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
    
    showTooltip(content, event) {
        const tooltip = document.getElementById('interactive-tooltip');
        if (!tooltip) return;
        
        tooltip.querySelector('.tooltip-content').textContent = content;
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
        tooltip.classList.add('visible');
    }
    
    showPacketTooltip(packet, event) {
        const type = packet.classList.contains('syn') ? 'SYN' :
                    packet.classList.contains('ack') ? 'ACK' :
                    packet.classList.contains('tls') ? 'TLS' :
                    packet.classList.contains('data') ? 'DATA' : 'Packet';
        
        const content = `${type} Packet - Click for details`;
        this.showTooltip(content, event);
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('interactive-tooltip');
        if (tooltip) tooltip.classList.remove('visible');
    }
    
    showEndpointState(endpoint) {
        const isClient = endpoint.querySelector('.endpoint-icon')?.textContent === 'Client';
        const protocol = endpoint.closest('.protocol-section')?.querySelector('h3')?.textContent || 'Unknown';
        
        const title = `${protocol} ${isClient ? 'Client' : 'Server'} State`;
        const stateText = endpoint.querySelector('.state-indicator')?.textContent || 'Unknown';
        
        const content = `
            <p><strong>Current State:</strong> ${stateText}</p>
            <p><strong>Protocol:</strong> ${protocol}</p>
            <p><strong>Role:</strong> ${isClient ? 'Client' : 'Server'}</p>
            <p>Click packets in the connection area to see detailed information about each step in the handshake process.</p>
        `;
        
        this.showModal(title, content);
    }
    
    showPacketDetails(packet, protocol, stepNumber) {
        const packetTypes = {
            tcp: {
                1: 'TCP SYN - Synchronization packet to initiate connection',
                2: 'TCP SYN-ACK - Server acknowledges and requests connection',
                3: 'TCP ACK - Client acknowledges connection established',
                4: 'TLS ClientHello - Begin TLS handshake',
                5: 'TLS ServerHello - Server responds with certificate',
                6: 'TLS Finished - Handshake complete, ready for data'
            },
            quic: {
                1: 'QUIC Initial + TLS ClientHello - Combined transport and crypto handshake',
                2: 'QUIC Handshake + TLS ServerHello - Server response with certificate',
                3: '1-RTT Application Data - Ready for data transmission'
            }
        };
        
        const title = `${protocol.toUpperCase()} Packet Details`;
        const description = packetTypes[protocol]?.[stepNumber] || 'Unknown packet type';
        
        const content = `
            <p><strong>Packet Type:</strong> Step ${stepNumber}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Protocol:</strong> ${protocol.toUpperCase()}</p>
            <p><strong>Network Latency:</strong> ${this.networkLatency}ms</p>
            <p><strong>Animation Speed:</strong> ${this.animationSpeed}x</p>
        `;
        
        this.showModal(title, content);
    }
    
    showModal(title, content) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.classList.add('visible');
        }
    }
    
    hideModal() {
        const modal = document.getElementById('modal-overlay');
        if (modal) modal.classList.remove('visible');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.protocolComparison = new ProtocolComparison();
});