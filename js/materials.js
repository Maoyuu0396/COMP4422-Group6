class Materials {
    static get WOOD_DARK() {
        return {
            ambient: [0.3, 0.2, 0.1],
            diffuse: [0.6, 0.4, 0.2],
            specular: [0.3, 0.3, 0.3],
            shininess: 32.0,
            opacity: 1.0

        };
    }

    static get WOOD_LIGHT() {
        return {
            ambient: [0.2, 0.15, 0.1],
            diffuse: [0.4, 0.3, 0.2],
            specular: [0.1, 0.1, 0.1],
            shininess: 32.0,
            opacity: 1.0
        };
    }

    static get FELT_GREEN() {
        return {
            ambient: [0.0, 0.1, 0.0],
            diffuse: [0.0, 0.2, 0.0],
            specular: [0.05, 0.05, 0.05],
            shininess: 4.0
        };
    }

    static get RUBBER() {
        return {
            ambient: [0.1, 0.1, 0.1],
            diffuse: [0.3, 0.3, 0.3],
            specular: [0.05, 0.05, 0.05],
            shininess: 4.0,
            opacity: 1.0

        };
    }

    static get METAL() {
        return {
            ambient: [0.2, 0.2, 0.2],
            diffuse: [0.6, 0.6, 0.6],
            specular: [0.8, 0.8, 0.8],
            shininess: 128.0
        };
    }

    static get WHITE() {
        return {
            ambient: [0.8, 0.8, 0.8],
            diffuse: [1.0, 1.0, 1.0],
            specular: [0.5, 0.5, 0.5],
            shininess: 32.0
        };
    }

    static get BLACK() {
        return {
            ambient: [0.1, 0.1, 0.1],
            diffuse: [0.0, 0.0, 0.0],
            specular: [0.1, 0.1, 0.1],
            shininess: 32.0
        };
    }

    static get BALL_COLORS() {
        return [
            { ambient: [0.8, 0.0, 0.0], diffuse: [1.0, 0.0, 0.0], specular: [0.8, 0.8, 0.8], shininess: 128.0 }, // Red
            { ambient: [1.0, 0.5, 0.0], diffuse: [1.0, 0.6, 0.0], specular: [0.8, 0.8, 0.8], shininess: 128.0 }, // Orange
            { ambient: [0.0, 0.0, 0.8], diffuse: [0.0, 0.0, 1.0], specular: [0.8, 0.8, 0.8], shininess: 128.0 }, // Blue
            { ambient: [0.4, 0.2, 0.0], diffuse: [0.5, 0.25, 0.0], specular: [0.8, 0.8, 0.8], shininess: 128.0 },  // 棕色
            { ambient: [0.8, 0.8, 0.0], diffuse: [1.0, 1.0, 0.0], specular: [0.8, 0.8, 0.8], shininess: 128.0 }, // Yellow
        ];
    }
    
    static get GROUND() {
        return {
            ambient: [0.3, 0.3, 0.3],
            diffuse: [0.6, 0.6, 0.6],
            specular: [0.1, 0.1, 0.1],
            shininess: 16.0,
            opacity: 1.0
        };
    }

    static get SKYBOX() {
        return {
            ambient: [0.2, 0.2, 0.3],  // 淡蓝色环境光
            diffuse: [0.1, 0.1, 0.2],  // 暗蓝色漫反射
            specular: [0.0, 0.0, 0.0], // 无高光
            shininess: 1.0,
            opacity: 1.0
        };
    }

  
}