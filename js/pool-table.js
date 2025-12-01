class PoolTable {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.meshes = [];
        this.init();
    }
    
    init() {
        this.createTableBase();
        this.createTableSurface();
        this.createPockets();
        this.createRails();
    }
    
    createTableBase() {
        // 桌子主体
        const baseGeometry = Geometry.createCube();
        const mesh = new Mesh(this.gl, baseGeometry, Materials.WOOD_DARK);
        mesh.transform = mat4.create();
        mat4.scale(mesh.transform, mesh.transform, [3.8, 1.54, 1.9]);
       
        this.meshes.push(mesh);
    }
    
    createTableSurface() {
        // 使用薄立方体代替平面
        const surfaceGeometry = Geometry.createCube();
        
        // 创建带纹理的绿色呢绒材质
        const texturedFeltMaterial = {
            ambient: [0.1, 0.3, 0.1],
            diffuse: [0.2, 0.5, 0.2],
            specular: [0.1, 0.1, 0.1],
            shininess: 10,
            diffuseMap: '../texture/snooker-deepgreen-texture.jpg'
        };
        
        const mesh = new Mesh(this.gl, surfaceGeometry, texturedFeltMaterial);
        mesh.transform = mat4.create();
        mat4.translate(mesh.transform, mesh.transform, [0, 0.81, 0]);
        mat4.scale(mesh.transform, mesh.transform, [3.6, 0.02, 1.8]); // 很薄的高度
        this.meshes.push(mesh);
    }

    createPockets() {
        const pocketGeometry = Geometry.createSphere(16, 16);
        
        // 六个袋口位置
        const pocketPositions = [
            [-1.75, 0.83, -0.85],  // 左下
            [0, 0.83, -0.9],      // 中下
            [1.75, 0.83, -0.85],   // 右下
            [-1.75, 0.83, 0.85],   // 左上
            [0, 0.83, 0.9],       // 中上
            [1.75, 0.83, 0.85]     // 右上
        ];
        
        pocketPositions.forEach(pos => {
            const mesh = new Mesh(this.gl, pocketGeometry, Materials.RUBBER);
            mesh.transform = mat4.create();
            mat4.translate(mesh.transform, mesh.transform, pos);
            mat4.scale(mesh.transform, mesh.transform, [0.15, 0.01, 0.15]);
            this.meshes.push(mesh);
        });
    }
    
    createRails() {
        const railGeometry = Geometry.createCube(); 
        
        // 创建带纹理的木材材质
        const texturedWoodMaterial = {
            ambient: [0.4, 0.3, 0.2],
            diffuse: [0.8, 0.6, 0.4],
            specular: [0.4, 0.4, 0.4],
            shininess: 64.0,
            diffuseMap: '../texture/brownwood_texture.jpg'
        };
        
        // 四条边轨
        const railTransforms = [
            { position: [0, 0.8, -0.95], scale: [3.82, 0.18, 0.1] },  // 下边
            { position: [0, 0.8, 0.95], scale: [3.82, 0.18, 0.1] },   // 上边
            { position: [-1.85, 0.8, 0], scale: [0.12, 0.18, 1.8] },  // 左边
            { position: [1.85, 0.8, 0], scale: [0.12, 0.18, 1.8] }    // 右边
        ];
        
        railTransforms.forEach(transform => {
            const mesh = new Mesh(this.gl, railGeometry, texturedWoodMaterial);
            mesh.transform = mat4.create();
            mat4.translate(mesh.transform, mesh.transform, transform.position);
            mat4.scale(mesh.transform, mesh.transform, transform.scale);
            this.meshes.push(mesh);
        });
    }
    
    render(viewMatrix, projectionMatrix, cameraPosition, pointLightsData = null) {
    this.meshes.forEach(mesh => {
        mesh.render(this.shaderProgram, viewMatrix, projectionMatrix, cameraPosition, pointLightsData);
    });
 }

}