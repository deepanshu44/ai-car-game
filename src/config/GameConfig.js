export const GameConfig = {
    physics: {
        // maxSpeed: 1.7,
        maxSpeed: 2,
        acceleration: 0.02,
        deceleration: 0.03,
        maxLateralSpeed: 0.1
    },
    
    rewind: {
        maxPower: 100,
        chargeRate: 10.5,
        duration: 15000
    },
    
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        offsetY: 5,
        offsetZ: -12
    },
    
    road: {
        laneWidth: 5,
        playerLane: 2.25,
        trafficLane: -2.25,
        segmentLength: 500
    },
    
    biome: {
        transitionDistance: 1000,
        transitionZoneLength: 100
    },

    tunnel: {
        length: 100,
        radius: 6,
        lightSpacing: 15,
        archSpacing: 10
    },
    
    rendering: {
        antialias: true,
        shadowsEnabled: true
    }
};
