export class PollutionTracker {
    constructor() {
        this.co2PerKm = 120; // grams CO2 per km
        this.baseConsumption = 7; // liters per 100km
        this.co2PerLiter = 2310; // grams CO2 per liter
        this.totalCO2 = 0; // grams
        this.totalFuel = 0; // liters
    }

    update(distanceTraveled, currentSpeed, acceleration) {
	if (currentSpeed>0) {
	    
            const kmTraveled = distanceTraveled / 1000;
            const fuelUsed = (this.baseConsumption / 100) * kmTraveled;
            const co2Produced = fuelUsed * this.co2PerLiter;

            this.totalCO2 = co2Produced;
            this.totalFuel = fuelUsed;
	    this.updateUI(currentSpeed)
	}
    }
    
    getCO2() {
        if (this.totalCO2 < 1000) {
            return Math.round(this.totalCO2) + 'g';
        } else {
            return (this.totalCO2 / 1000).toFixed(2) + 'kg';
        }
    }

    getFuel() {
        return this.totalFuel.toFixed(2);
    }

    getCurrentRate(speed) {
        let consumption = this.baseConsumption;
        if (speed > 100) consumption *= 1.5;
        // if (acceleration) consumption *= 1.3;
        const co2Rate = (consumption / 100) * this.co2PerLiter;
        return Math.round(co2Rate) + 'g/km';
    }

    getTreeEquivalent() {
        const treesNeeded = (this.totalCO2 / 1000) / 21;
        return treesNeeded.toFixed(3);
    }

    getEVComparison() {
        return this.totalCO2 * 0.3; // EVs ~70% cleaner
    }

    getBusComparison() {
        return this.totalCO2 * 0.4; // Bus per person ~60% cleaner
    }
    updateUI(carSpeed) {
        // Calculate current speed in km/h
        const currentSpeedKmh = carSpeed * 50; // Scale to reasonable km/h

        // Update CO2
        const co2Text = this.getCO2();
        const co2Element = document.getElementById('co2Value');
        co2Element.textContent = co2Text;

        // Add warning if pollution is high
        if (this.totalCO2 > 1000) {
            co2Element.classList.add('pollution-warning');
        } else {
            co2Element.classList.remove('pollution-warning');
        }

        // Update rate
        document.getElementById('co2Rate').textContent = 
            this.getCurrentRate(currentSpeedKmh);

        // Update trees
        document.getElementById('treeValue').textContent = 
            this.getTreeEquivalent();

        // Update fuel
        document.getElementById('fuelValue').textContent = 
            this.getFuel() + 'L';

    }

    formatCO2(grams) {
        if (grams < 1000) {
            return Math.round(grams) + 'g';
        }
        return (grams / 1000).toFixed(2) + 'kg';
    }

}
