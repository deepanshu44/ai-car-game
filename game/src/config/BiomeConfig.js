export const BiomeConfig = {
    city: {
        skyColor: 0x0a0a1a,
        fogColor: 0x0a0a1a,
        ambientLightIntensity: 0.4,
        sceneryTypes: ['tree', 'bush', 'house', 'policeCar'],
        spawnDensity: {
            trees: 12,
            bushes: 15,
            houses: 5
        }
    },
    
    farmland: {
        skyColor: 0x87a96b,
        fogColor: 0x87a96b,
        ambientLightIntensity: 0.6,
        sceneryTypes: ['barn', 'silo', 'windmill', 'crops', 'fence', 'hay'],
        spawnDensity: {
            farms: 2,
            silos: 2,
            windmills: 2,
            cropFields: 7
        }
    }
};
