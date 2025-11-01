export const GameConfig = {
    // Game settings
    maxSpeed: 2,
    acceleration: 0.02,
    deceleration: 0.03,
    maxLateralSpeed: 0.1,
    
    // Rewind settings
    rewindChargeRate: 1.5,
    rewindDuration: 15000,
    maxRewindPower: 100,
    rewindThreshold: 50,
    
    // World settings
    laneWidth: 4.5,
    roadWidth: 18,
    sceneryLoopDistance: 350,
    roadLoopDistance: 1500,
    
    // Biome settings
    biomeTransitionDistance: 1000,
    transitionZoneLength: 200,
    
    // Performance settings
    shadowsEnabled: false,
    fogNear: 30,
    fogFar: 120,
    
    // Lane positions
    lanes: {
        playerLeft: 6.75,
        playerRight: 2.25,
        trafficLeft: -2.25,
        trafficRight: -6.75
    }
};
