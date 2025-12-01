class Geometry {
    static createCube() {
        const positions = [
            // Front face
            -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
            // Back face
            -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
            // Top face
            -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5, -0.5,
            // Bottom face
            -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5,
            // Right face
             0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,
            // Left face
            -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5,
        ];
        
        const normals = [
            // Front
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            // Back
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            // Top
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            // Bottom
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            // Right
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            // Left
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        ];
        
        const texCoords = [
            // Front
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Back
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            // Top
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            // Bottom
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            // Right
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Left
            1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        ];
        
        const indices = [
            0, 1, 2, 0, 2, 3,       // Front
            4, 5, 6, 4, 6, 7,       // Back
            8, 9, 10, 8, 10, 11,    // Top
            12, 13, 14, 12, 14, 15, // Bottom
            16, 17, 18, 16, 18, 19, // Right
            20, 21, 22, 20, 22, 23  // Left
        ];
        
        return { positions, normals, texCoords, indices };
    }
    
    static createSphere(latitudeBands = 16, longitudeBands = 16) {
        const positions = [];
        const normals = [];
        const texCoords = [];
        const indices = [];
        
        for (let lat = 0; lat <= latitudeBands; lat++) {
            const theta = lat * Math.PI / latitudeBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon <= longitudeBands; lon++) {
                const phi = lon * 2 * Math.PI / longitudeBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                const u = 1 - (lon / longitudeBands);
                const v = 1 - (lat / latitudeBands);
                
                positions.push(x * 0.5, y * 0.5, z * 0.5);
                normals.push(x, y, z);
                texCoords.push(u, v);
            }
        }
        
        for (let lat = 0; lat < latitudeBands; lat++) {
            for (let lon = 0; lon < longitudeBands; lon++) {
                const first = (lat * (longitudeBands + 1)) + lon;
                const second = first + longitudeBands + 1;
                
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        
        return { positions, normals, texCoords, indices };
    }
    
    static createCylinder(radius = 0.5, height = 2.0, segments = 16) {
        const positions = [];
        const normals = [];
        const texCoords = [];
        const indices = [];
        
        // Side vertices
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Bottom vertex
            positions.push(x, -height/2, z);
            normals.push(x, 0, z);
            texCoords.push(i / segments, 0);
            
            // Top vertex
            positions.push(x, height/2, z);
            normals.push(x, 0, z);
            texCoords.push(i / segments, 1);
        }
        
        // Side indices
        for (let i = 0; i < segments; i++) {
            const bottomLeft = i * 2;
            const bottomRight = (i + 1) * 2;
            const topLeft = i * 2 + 1;
            const topRight = (i + 1) * 2 + 1;
            
            indices.push(bottomLeft, bottomRight, topLeft);
            indices.push(topLeft, bottomRight, topRight);
        }
        
        return { positions, normals, texCoords, indices };
    }
    
    static createPlane(width = 1, depth = 1) {
        const positions = [
            -width/2, 0, -depth/2,  width/2, 0, -depth/2,
             width/2, 0,  depth/2, -width/2, 0,  depth/2
        ];
        
        const normals = [
            0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
        ];
        
        const texCoords = [
            0, 0, 1, 0, 1, 1, 0, 1
        ];
        
        const indices = [0, 1, 2, 0, 2, 3];
        
        return { positions, normals, texCoords, indices };
    }
    
    static createPlane(width = 1, depth = 1) {
        const positions = [
            -width/2, 0, -depth/2,  
             width/2, 0, -depth/2,
             width/2, 0,  depth/2, 
            -width/2, 0,  depth/2
        ];
        
        const normals = [
            0, 1, 0, 
            0, 1, 0, 
            0, 1, 0, 
            0, 1, 0
        ];
        
        const texCoords = [
            0, 0, 
            1, 0, 
            1, 1, 
            0, 1
        ];
        
        const indices = [0, 1, 2, 0, 2, 3];
        
        return { positions, normals, texCoords, indices };
    }
    
    static createSkybox(size = 10) {
        const halfSize = size / 2;
        
        const positions = [
            // Front face
            -halfSize, -halfSize,  halfSize,   halfSize, -halfSize,  halfSize,
             halfSize,  halfSize,  halfSize,  -halfSize,  halfSize,  halfSize,
            // Back face
            -halfSize, -halfSize, -halfSize,  -halfSize,  halfSize, -halfSize,
             halfSize,  halfSize, -halfSize,   halfSize, -halfSize, -halfSize,
            // Top face
            -halfSize,  halfSize, -halfSize,  -halfSize,  halfSize,  halfSize,
             halfSize,  halfSize,  halfSize,   halfSize,  halfSize, -halfSize,
            // Bottom face
            -halfSize, -halfSize, -halfSize,   halfSize, -halfSize, -halfSize,
             halfSize, -halfSize,  halfSize,  -halfSize, -halfSize,  halfSize,
            // Right face
             halfSize, -halfSize, -halfSize,   halfSize,  halfSize, -halfSize,
             halfSize,  halfSize,  halfSize,   halfSize, -halfSize,  halfSize,
            // Left face
            -halfSize, -halfSize, -halfSize,  -halfSize, -halfSize,  halfSize,
            -halfSize,  halfSize,  halfSize,  -halfSize,  halfSize, -halfSize,
        ];
        
        // 天空盒的法线指向内部（因为是从内部观看）
    const normals = [
        // Front - 指向外部
         0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,
        // Back - 指向外部
         0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,
        // Top - 指向外部
         0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,
        // Bottom - 指向外部
         0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,
        // Right - 指向外部
         -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,
        // Left - 指向外部
        1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0,
    ];
    
        
        const texCoords = [
            // Front
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Back
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            // Top
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            // Bottom
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            // Right
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Left
            1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        ];
        
        const indices = [
            0, 1, 2, 0, 2, 3,       // Front
            4, 5, 6, 4, 6, 7,       // Back
            8, 9, 10, 8, 10, 11,    // Top
            12, 13, 14, 12, 14, 15, // Bottom
            16, 17, 18, 16, 18, 19, // Right
            20, 21, 22, 20, 22, 23  // Left
        ];
        
        return { positions, normals, texCoords, indices };
    }
    
static createLargePlane(width = 10, depth = 10) {
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    
    // 重新排列顶点顺序，确保从上面能看到
    const positions = [
        -halfWidth, 0, -halfDepth,  // 左下 - 0
         halfWidth, 0, -halfDepth,  // 右下 - 1
         halfWidth, 0,  halfDepth,  // 右上 - 2
        -halfWidth, 0,  halfDepth,  // 左上 - 3
    ];
    
    // 法线朝上（从上面能看到）
    const normals = [
        0, 1, 0,  // 法线朝上
        0, 1, 0,
        0, 1, 0, 
        0, 1, 0
    ];
    
    // 纹理坐标
    const texCoords = [
        0, 0,  // 左下
        1, 0,  // 右下
        1, 1,  // 右上
        0, 1   // 左上
    ];
    
    // 三角形索引（确保正确的缠绕顺序）
    const indices = [
        0, 1, 2,  // 第一个三角形
        0, 2, 3   // 第二个三角形
    ];
    
    console.log('🔄 创建地面平面：法线朝上，正确的顶点顺序');
    
    return { positions, normals, texCoords, indices };
}
}
