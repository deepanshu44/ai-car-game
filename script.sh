#!/bin/bash

# Create complete directory structure
echo "Creating directory structure..."
mkdir -p src/{core,entities,environment/{objects,structures,biomes},systems,utils,config}

# Create all files
echo "Creating all component files..."

# Config
touch src/config/GameConfig.js

# Utils
touch src/utils/{Constants.js,Helpers.js,MeshFactory.js}

# Core
touch src/core/{Game.js,SceneManager.js,Renderer.js}

# Systems
touch src/systems/{InputHandler.js,CollisionDetector.js,CameraController.js,UIManager.js}

# Entities
touch src/entities/{PlayerCar.js,TrafficCar.js,PoliceCar.js,CrossingTraffic.js,TrafficManager.js}

# Environment
touch src/environment/{Road.js,Scenery.js,BiomeManager.js,Weather.js}
touch src/environment/objects/{Tree.js,Bush.js,House.js,Cloud.js,Pothole.js}
touch src/environment/structures/{Bridge.js,Intersection.js,StreetLamp.js}
touch src/environment/biomes/{CityBiome.js,FarmlandBiome.js}

# Main entry
touch src/index.js

# Backup original file
echo "Backing up original game.js..."
# cp game.js game.js.backup

echo "✅ Directory structure and files created successfully!"
echo ""
echo "Next steps:"
echo "1. Copy the code for each file from the refactored versions above"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo ""
echo "File structure:"
tree src/

# # Create directory structure
# mkdir -p src/{core,entities,environment,systems,utils,config}
# mkdir -p src/environment/{structures,objects,biomes}

# # Create component files
# touch src/core/{Game.js,SceneManager.js,Renderer.js}
# touch src/entities/{PlayerCar.js,TrafficCar.js,PoliceCar.js,CrossingTraffic.js}
# touch src/environment/{Road.js,Scenery.js,BiomeManager.js,Weather.js,Lighting.js}
# touch src/environment/structures/{Bridge.js,Intersection.js,StreetLamp.js}
# touch src/environment/objects/{Tree.js,Bush.js,House.js,Cloud.js,Pothole.js}
# touch src/environment/biomes/{CityBiome.js,FarmlandBiome.js}
# touch src/systems/{InputHandler.js,CollisionDetector.js,CameraController.js,UIManager.js}
# touch src/utils/{Constants.js,Helpers.js,MeshFactory.js}
# touch src/config/GameConfig.js

# # Create main entry point
# touch src/index.js

# # Move original file for reference
# mv game.js game.js.backup
