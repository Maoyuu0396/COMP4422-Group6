class PoolCue {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.meshes = [];
        
        // 球杆的整体位置
        this.position = [0.058, 0.87, -0.028]; // 初始位置
        this.hasMoved = false;
        
        // 旋转动画状态
        this.isRotating = false;
        this.rotationStartTime = 0;
        this.rotationDuration = 1.5; // 旋转动画持续时间
        this.rotationProgress = 0;
        
        // 缩放动画状态
        this.isScaling = false;
        this.scaleStartTime = 0;
        this.scaleDuration = 1.0; // 缩放动画持续时间
        this.scaleProgress = 0;
        
        // 旋转相关参数
        this.originalPosition = [0.058, 0.87, -0.028]; // 保存原始位置
        this.pivotPoint = [-1.75, 0.83, +0.85]; // 旋转支点
        
        // 缩放中心点
        this.scaleCenter = [-0.5, 0, 0]; // 新的缩放中心 （上下 左右 前后）
        
        this.targetRotation = - Math.PI / 2; // 目标旋转角度（90度）
        
        this.init();
    }
    
    init() {
        console.log('🎱 开始初始化球杆...');
        this.createCueShaft();
        this.createCueTip();
        this.createCueButt();
        this.updateAllTransforms(); // 初始化所有变换
        
        console.log('🎱 球杆初始化完成，初始位置:', this.position);
        console.log('🎱 旋转支点位置:', this.pivotPoint);
        console.log('🎱 缩放中心位置:', this.scaleCenter);
    }
    
    createCueShaft = () => {
        console.log('🎱 创建球杆杆身...');
        const shaftGeometry = Geometry.createCylinder(0.02, 1.2, 8);
        const mesh = new Mesh(this.gl, shaftGeometry, Materials.WOOD_LIGHT);
        
        // 保存部件的局部变换信息
        mesh.localOffset = [0.54034, 0, -0.26058];
        mesh.localRotations = [
            { axis: [0, 0, 1], angle: Math.PI / 2 },
            { axis: [1, 0, 0], angle: 0.142856 * Math.PI }
        ];
        mesh.localScale = [1, 1, 1];
        
        this.meshes.push(mesh);
        console.log('🎱 球杆杆身创建完成');
    }
    
    createCueTip = () => {
        console.log('🎱 创建球杆皮头...');
        const tipGeometry = Geometry.createSphere(8, 8);
        const mesh = new Mesh(this.gl, tipGeometry, Materials.RUBBER);
        
        mesh.localOffset = [0, 0, 0];
        mesh.localRotations = [];
        mesh.localScale = [0.03, 0.03, 0.03];
        
        this.meshes.push(mesh);
        console.log('🎱 球杆皮头创建完成');
    }
    
    createCueButt = () => {
        console.log('🎱 创建球杆尾部...');
        const buttGeometry = Geometry.createCylinder(0.025, 0.3, 8);
        const mesh = new Mesh(this.gl, buttGeometry, Materials.WOOD_DARK);
        
        mesh.localOffset = [1.21574 - 0.0058, 0, -0.58691 + 0.0028];
        mesh.localRotations = [
            { axis: [0, 0, 1], angle: Math.PI / 2 },
            { axis: [1, 0, 0], angle: 0.142856 * Math.PI }
        ];
        mesh.localScale = [1, 1, 1];
        
        this.meshes.push(mesh);
        console.log('🎱 球杆尾部创建完成');
    }
    
    // 更新所有mesh的变换矩阵
    updateAllTransforms() {
        console.log('🎱 更新球杆变换矩阵...');
        this.meshes.forEach(mesh => {
            if (!mesh.transform) {
                mesh.transform = mat4.create();
            }
            mat4.identity(mesh.transform);
            
            // 1. 应用球杆的整体位置
            mat4.translate(mesh.transform, mesh.transform, this.position);
            
            // 2. 应用部件的局部偏移
            mat4.translate(mesh.transform, mesh.transform, mesh.localOffset);
            
            // 3. 应用部件的旋转
            if (mesh.localRotations && mesh.localRotations.length > 0) {
                mesh.localRotations.forEach(rotation => {
                    mat4.rotate(mesh.transform, mesh.transform, rotation.angle, rotation.axis);
                });
            }
            
            // 4. 应用部件的缩放
            if (mesh.localScale) {
                mat4.scale(mesh.transform, mesh.transform, mesh.localScale);
            }
        });
        console.log('🎱 球杆变换矩阵更新完成');
    }
    
    // 更新旋转动画的变换矩阵
    updateRotationTransforms() {
        console.log('🔄 更新旋转变换，进度:', this.rotationProgress.toFixed(3));
        
        this.meshes.forEach(mesh => {
            if (!mesh.transform) {
                mesh.transform = mat4.create();
            }
            mat4.identity(mesh.transform);
            
            // 1. 应用球杆的整体位置
            mat4.translate(mesh.transform, mesh.transform, this.position);
            
            // 2. 绕支点旋转
            mat4.translate(mesh.transform, mesh.transform, [
                -this.pivotPoint[0], 
                -this.pivotPoint[1], 
                -this.pivotPoint[2]
            ]);
            
            const currentRotation = this.targetRotation * this.rotationProgress;
            mat4.rotate(mesh.transform, mesh.transform, currentRotation, [0, 0, 1]);
            
            mat4.translate(mesh.transform, mesh.transform, this.pivotPoint);
            
            // 3. 应用部件的局部偏移
            mat4.translate(mesh.transform, mesh.transform, mesh.localOffset);
            
            // 4. 应用部件的原有旋转
            if (mesh.localRotations && mesh.localRotations.length > 0) {
                mesh.localRotations.forEach(rotation => {
                    mat4.rotate(mesh.transform, mesh.transform, rotation.angle, rotation.axis);
                });
            }
            
            // 5. 应用部件的缩放
            if (mesh.localScale) {
                mat4.scale(mesh.transform, mesh.transform, mesh.localScale);
            }
        });
    }
    
    // 更新缩放动画的变换矩阵 - 以新中心点进行缩放
    updateScaleTransforms() {
        console.log('📏 更新缩放变换，进度:', this.scaleProgress.toFixed(3), '缩放因子:', (1 - this.scaleProgress).toFixed(3));
        console.log('📏 缩放中心:', this.scaleCenter);
        
        const scaleFactor = 1 - this.scaleProgress;
        
        this.meshes.forEach((mesh, index) => {
            if (!mesh.transform) {
                mesh.transform = mat4.create();
            }
            mat4.identity(mesh.transform);
            
            // 1. 应用球杆的整体位置
            mat4.translate(mesh.transform, mesh.transform, this.position);
            
            // 2. 绕支点旋转（保持旋转后的完整状态）
            mat4.translate(mesh.transform, mesh.transform, [
                -this.pivotPoint[0], 
                -this.pivotPoint[1], 
                -this.pivotPoint[2]
            ]);
            
            const currentRotation = this.targetRotation; // 使用完整的旋转角度
            mat4.rotate(mesh.transform, mesh.transform, currentRotation, [0, 0, 1]);
            
            mat4.translate(mesh.transform, mesh.transform, this.pivotPoint);
            
            // 3. 以新中心点进行缩放
            mat4.translate(mesh.transform, mesh.transform, [
                -this.scaleCenter[0], 
                -this.scaleCenter[1], 
                -this.scaleCenter[2]
            ]);
            
            // 应用统一缩放
            console.log(`📏 统一缩放因子: ${scaleFactor.toFixed(3)}`);
            mat4.scale(mesh.transform, mesh.transform, [scaleFactor, scaleFactor, scaleFactor]);
            
            // 平移回缩放中心位置
            mat4.translate(mesh.transform, mesh.transform, this.scaleCenter);
            
            // 4. 应用部件的局部偏移
            mat4.translate(mesh.transform, mesh.transform, mesh.localOffset);
            
            // 5. 应用部件的原有旋转
            if (mesh.localRotations && mesh.localRotations.length > 0) {
                mesh.localRotations.forEach(rotation => {
                    mat4.rotate(mesh.transform, mesh.transform, rotation.angle, rotation.axis);
                });
            }
            
            // 6. 应用部件的原始缩放
            if (mesh.localScale) {
                mat4.scale(mesh.transform, mesh.transform, mesh.localScale);
            }
        });
    }
    
    // 平移方法
    translate(dx, dy, dz) {
        this.position[0] += dx;
        this.position[1] += dy;
        this.position[2] += dz;
        
        this.updateAllTransforms();
        
        console.log('🎱 球杆移动到位置:', this.position);
    }
    
    // 向黑球方向移动方法
    moveTowardBlackBall() {
        if (this.hasMoved) {
            console.log('🎱 球杆已经移动过，不再重复移动');
            return;
        }
        
        const blackBallPos = [-0.58, 0.77 + 0.03, 0.28];
        const directionX = blackBallPos[0] - this.position[0];
        const directionZ = blackBallPos[2] - this.position[2];
        const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
        
        if (length > 0) {
            const moveDistance = 0.25;
            const actualMoveDistance = Math.min(moveDistance, length - 0.1);
            const newX = this.position[0] + (directionX / length) * actualMoveDistance;
            const newZ = this.position[2] + (directionZ / length) * actualMoveDistance;
            
            this.setPosition(newX, this.position[1], newZ);
            this.hasMoved = true;
            
            console.log(`🎱 球杆移动了 ${actualMoveDistance.toFixed(2)} 单位，新位置:`, this.position);
        } else {
            console.log('🎱 球杆已经在目标位置附近');
        }
    }
    
    // 设置绝对位置的方法
    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        
        this.updateAllTransforms();
    }
    
    // 开始旋转动画
    startRotationAnimation() {
        if (this.isRotating) {
            console.log('🔄 球杆已经在旋转中');
            return;
        }
        
        this.isRotating = true;
        this.rotationStartTime = Date.now();
        this.rotationProgress = 0;
        
        console.log('🔄 开始球杆旋转动画');
        console.log('🔄 目标旋转角度:', (this.targetRotation * 180 / Math.PI).toFixed(1) + '度');
        console.log('🔄 动画持续时间:', this.rotationDuration + '秒');
    }
    
    // 更新旋转动画
    updateRotationAnimation() {
        if (!this.isRotating) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.rotationStartTime) / 1000;
        this.rotationProgress = Math.min(elapsed / this.rotationDuration, 1.0);
        
        console.log('🔄 旋转动画进度:', (this.rotationProgress * 100).toFixed(1) + '%');
        
        this.updateRotationTransforms();
        
        if (this.rotationProgress >= 1.0) {
            this.isRotating = false;
            console.log('✅ 球杆旋转动画完成');
            console.log('✅ 球杆现在与Y轴平行');
            
            // 旋转完成后开始缩放动画
            console.log('📏 旋转完成，开始缩放消失动画');
            this.startScaleAnimation();
        }
    }
    
    // 开始缩放动画
    startScaleAnimation() {
        if (this.isScaling) {
            console.log('📏 球杆已经在缩放中');
            return;
        }
        
        this.isScaling = true;
        this.scaleStartTime = Date.now();
        this.scaleProgress = 0;
        
        console.log('📏 开始球杆缩放消失动画');
        console.log('📏 缩放中心:', this.scaleCenter);
        console.log('📏 动画持续时间:', this.scaleDuration + '秒');
        console.log('📏 目标：以(', this.scaleCenter.join(', '), ')为中心缩小至完全消失');
    }
    
    // 更新缩放动画
    updateScaleAnimation() {
        if (!this.isScaling) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.scaleStartTime) / 1000;
        this.scaleProgress = Math.min(elapsed / this.scaleDuration, 1.0);
        
        console.log('📏 缩放动画进度:', (this.scaleProgress * 100).toFixed(1) + '%');
        
        // 使用修复后的缩放变换更新
        this.updateScaleTransforms();
        
        if (this.scaleProgress >= 1.0) {
            this.isScaling = false;
            console.log('✅ 球杆缩放动画完成');
            console.log('✅ 球杆已完全消失');
            console.log('✅ 缩放中心:', this.scaleCenter);
            
            this.onScaleAnimationComplete();
        }
    }
    
    // 缩放动画完成回调
    onScaleAnimationComplete() {
        console.log('🎉 所有球杆动画序列完成！');
        console.log('🎉 最终缩放中心:', this.scaleCenter);
    }
    
    render(viewMatrix, projectionMatrix, cameraPosition, pointLightsData = null) {
        // 更新旋转动画
        if (this.isRotating) {
            this.updateRotationAnimation();
        }
        
        // 更新缩放动画
        if (this.isScaling) {
            this.updateScaleAnimation();
        }
        
        // 只在未完全消失时渲染
        if (!this.isScaling || this.scaleProgress < 1.0) {
            this.meshes.forEach(mesh => {
                mesh.render(this.shaderProgram, viewMatrix, projectionMatrix, cameraPosition, pointLightsData);
            });
        } else {
            console.log('👻 球杆已完全消失，停止渲染');
            console.log('👻 消失位置中心:', this.scaleCenter);
        }
    }
}