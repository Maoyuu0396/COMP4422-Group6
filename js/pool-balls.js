class PoolBalls {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.balls = [];
        this.ballRadius = 0.1;
        this.hasAnimationTriggered = false;

        // 新增：球杆引用
        this.poolCue = null;

        
        
        // 袋口位置
        this.pocketPositions = [
            [-1.75, 0.83, -0.85],  // 左下
            [1.75, 0.83, -0.85],   // 右下
            [-1.75, 0.83, 0.85],   // 左上
            [1.75, 0.83, 0.85]     // 右上
        ];
        
        // 白球动画状态
        this.isWhiteBallMoving = false;
        this.whiteBallStartTime = 0;
        this.whiteBallAnimationDuration = 0.2; // 白球0.2秒
        
        // 黑球动画状态
        this.isBlackBallMoving = false;
        this.blackBallStartTime = 0;
        this.blackBallAnimationDuration = 1.0; // 黑球1秒
        this.blackBallTargetPocket = null; // 目标袋口
        this.targetPocketIndex = -1; // 目标袋口索引
        
        // 点光源状态
        this.pointLights = [];
        this.pointLightStartTime = 0;
        this.isLightAnimating = false;
        this.lightAnimationDuration = 0.5; // 光源渐亮0.5秒
        
        this.whiteBallIndex = -1;
        this.blackBallIndex = -1;
        
        // 初始位置
        this.whiteBallStartPos = [0, 0.77 + this.ballRadius, 0];
        this.whiteBallTargetPos = [-0.58, 0.77 + this.ballRadius, 0.28]; // 黑球位置
        this.blackBallStartPos = [-0.58, 0.77 + this.ballRadius, 0.28];
        
        this.init();
    }
    

    init() {
        const ballGeometry = Geometry.createSphere(16, 16);
        
        // 创建三角形排列的台球
        const ballPositions = this.createTriangleLayout();
        
        ballPositions.forEach((pos, index) => {
            const material = Materials.BALL_COLORS[index % Materials.BALL_COLORS.length];
            const mesh = new Mesh(this.gl, ballGeometry, material);
            mesh.transform = mat4.create();
            mat4.translate(mesh.transform, mesh.transform, [pos[0], 0.77 + this.ballRadius, pos[1]]);
            mat4.scale(mesh.transform, mesh.transform, [this.ballRadius, this.ballRadius, this.ballRadius]);
            this.balls.push(mesh);
        });
        
        // 白球（主球）
        const cueBallMesh = new Mesh(this.gl, ballGeometry, Materials.WHITE);
        cueBallMesh.transform = mat4.create();
        mat4.translate(cueBallMesh.transform, cueBallMesh.transform, this.whiteBallStartPos);
        mat4.scale(cueBallMesh.transform, cueBallMesh.transform, [this.ballRadius, this.ballRadius, this.ballRadius]);
        this.balls.push(cueBallMesh);
        this.whiteBallIndex = this.balls.length - 1;

        // 黑球
        const blackBall = new Mesh(this.gl, ballGeometry, Materials.BLACK);
        blackBall.transform = mat4.create();
        mat4.translate(blackBall.transform, blackBall.transform, this.blackBallStartPos);
        mat4.scale(blackBall.transform, blackBall.transform, [this.ballRadius, this.ballRadius, this.ballRadius]);
        this.balls.push(blackBall);
        this.blackBallIndex = this.balls.length - 1;
        
        console.log('PoolBalls初始化完成');
        console.log('白球索引:', this.whiteBallIndex, '黑球索引:', this.blackBallIndex);
    }
    
    // 新增：设置球杆引用的方法
    setPoolCue(poolCue) {
        this.poolCue = poolCue;
        console.log('🔗 PoolBalls: 已设置球杆引用', this.poolCue ? '成功' : '失败');
    }
    createTriangleLayout() {
        const positions = [];
        const ballSpacing = 0.16;
        const startX = -0.4;
        const startZ = 0;
        
        positions.push([startX, startZ]);
        positions.push([startX - ballSpacing * 0.5, startZ - ballSpacing * 0.866]);
        positions.push([startX + ballSpacing * 0.5, startZ - ballSpacing * 0.866]);
        positions.push([startX - ballSpacing, startZ - ballSpacing * 1.732]);
        positions.push([startX, startZ - ballSpacing * 1.732]);
        positions.push([startX + ballSpacing, startZ - ballSpacing * 1.732]);
        
        return positions;
    }
    
    // 找到离黑球最近的袋口
    findNearestPocket() {
        let nearestPocket = null;
        let nearestIndex = -1;
        let minDistance = Infinity;
        
        for (let i = 0; i < this.pocketPositions.length; i++) {
            const pocket = this.pocketPositions[i];
            const distance = Math.sqrt(
                Math.pow(pocket[0] - this.blackBallStartPos[0], 2) +
                Math.pow(pocket[1] - this.blackBallStartPos[1], 2) +
                Math.pow(pocket[2] - this.blackBallStartPos[2], 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestPocket = pocket;
                nearestIndex = i;
            }
        }
        
        console.log('最近袋口:', nearestPocket, '索引:', nearestIndex, '距离:', minDistance);
        this.targetPocketIndex = nearestIndex;
        return nearestPocket;
    }
    
    // 修改开始白球动画方法
    startWhiteBallAnimation() {
        // 检查是否已经触发过
        if (this.hasAnimationTriggered) {
            console.log('动画已经触发过，不再重复');
            return;
        }
        
        if (this.whiteBallIndex === -1) {
            console.error('白球索引未找到');
            return;
        }
        
        if (this.isWhiteBallMoving) {
            console.log('白球已经在移动中');
            return;
        }
        
        this.isWhiteBallMoving = true;
        this.hasAnimationTriggered = true; // 标记为已触发
        this.whiteBallStartTime = Date.now();
        console.log('开始白球动画');
        
        // 0.15秒后开始黑球动画
        setTimeout(() => {
            this.startBlackBallAnimation();
        }, 150);
    }
    
    // 开始黑球动画
    startBlackBallAnimation() {
        if (this.blackBallIndex === -1) {
            console.error('黑球索引未找到');
            return;
        }
        
        if (this.isBlackBallMoving) {
            console.log('黑球已经在移动中');
            return;
        }
        
        // 找到最近袋口
        this.blackBallTargetPocket = this.findNearestPocket();
        if (!this.blackBallTargetPocket) {
            console.error('未找到袋口');
            return;
        }
        
        this.isBlackBallMoving = true;
        this.blackBallStartTime = Date.now();
        console.log('开始黑球进洞动画，目标袋口:', this.blackBallTargetPocket);
    }
    

// 在 startPointLightAnimation 方法中详细调试
startPointLightAnimation() {
    if (this.targetPocketIndex === -1) {
        console.log('目标袋口索引无效');
        return;
    }
    
    const pocketPosition = this.pocketPositions[this.targetPocketIndex];
    console.log('袋口位置:', pocketPosition);
    
    // 逐步创建点光源，确保每一步都正确
    const lightPosition = [pocketPosition[0], pocketPosition[1] + 0.1, pocketPosition[2]];
    const lightColor = [0.8, 0.8, 0.5];
    const lightIntensity = 1.0;
    
    console.log('光源位置:', lightPosition);
    console.log('光源颜色:', lightColor);
    console.log('光源强度:', lightIntensity);
    
    // 创建点光源对象
    const pointLight = {
        position: lightPosition,
        color: lightColor,
        intensity: lightIntensity
    };
    
    console.log('创建的点光源对象:', pointLight);
    console.log('对象属性检查:', 
        'position:', pointLight.position,
        'color:', pointLight.color, 
        'intensity:', pointLight.intensity
    );
    
    // 赋值给数组
    this.pointLights = [pointLight];
    
    console.log('赋值后的数组:', this.pointLights);
    console.log('数组第一个元素:', this.pointLights[0]);
}

// 在 PoolBalls.js 的 updateBlackBallAnimation 方法中添加：
updateBlackBallAnimation() {
    if (!this.isBlackBallMoving || this.blackBallIndex === -1 || !this.blackBallTargetPocket) return;
    
    const blackBall = this.balls[this.blackBallIndex];
    if (!blackBall) return;
    
    const currentTime = Date.now();
    const elapsed = (currentTime - this.blackBallStartTime) / 1000;
    const progress = Math.min(elapsed / this.blackBallAnimationDuration, 1.0);
    
    if (progress < 1.0) {
        // 动画进行中：只在XZ平面移动
        const newX = this.blackBallStartPos[0] + (this.blackBallTargetPocket[0] - this.blackBallStartPos[0]) * progress;
        const newZ = this.blackBallStartPos[2] + (this.blackBallTargetPocket[2] - this.blackBallStartPos[2]) * progress;
        
        // 更新位置（Y坐标保持不变）
        blackBall.transform[12] = newX;
        blackBall.transform[13] = this.blackBallStartPos[1];
        blackBall.transform[14] = newZ;

        // 在动画进行到95%时触发光源（黑球接近袋口时）
        if (progress > 0.95 && !this.isLightAnimating && this.pointLights.length === 0) {
            console.log('💡 黑球接近袋口，触发光源');
            this.startPointLightAnimation();
        }
    } else {
        // 动画完成：立即隐藏
        this.isBlackBallMoving = false;
        console.log('⚫ 黑球进洞完成，黑球已隐藏');
        blackBall.isInPocket = true;
        // 确保光源已创建
        if (this.pointLights.length === 0) {
            console.log('💡 动画完成，创建光源');
            this.startPointLightAnimation();
        }

        // 修改：使用类内引用触发球杆旋转
        console.log('🔄 黑球进洞完成，准备触发球杆旋转');
        if (this.poolCue) {
            console.log('🔄 找到球杆实例，开始旋转动画');
            this.poolCue.startRotationAnimation();
        } else {
            console.log('❌ PoolBalls: 未找到球杆实例，无法开始旋转动画');
            console.log('❌ 请检查setPoolCue方法是否被调用');
        }
    }
}
    
    // 更新点光源动画
    updatePointLightAnimation() {
        if (!this.isLightAnimating || this.pointLights.length === 0) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.pointLightStartTime) / 1000;
        const progress = Math.min(elapsed / this.lightAnimationDuration, 1.0);
        
        // 渐亮效果
        this.pointLights[0].intensity = progress;
        
        if (progress >= 1.0) {
            this.isLightAnimating = false;
            console.log('点光源动画完成，强度:', this.pointLights[0].intensity);
        }
    }
    
// 获取点光源数据（供主程序使用）
getPointLights() {
    // 简化版本，直接返回第一个光源的数据
    if (this.pointLights.length === 0) {
        // console.log('🔴 没有点光源');
        return { count: 0, positions: [], colors: [], intensities: [] };
    }
    
    const light = this.pointLights[0];
    
    // 强制显示具体内容
    // console.log('🔴 返回点光源数据 - 位置:', light.position, '颜色:', light.color, '强度:', light.intensity);
    
    return {
        positions: [light.position],
        colors: [light.color],
        intensities: [light.intensity],
        count: 1
    };
}
    
    // 更新白球动画
    updateWhiteBallAnimation() {
        if (!this.isWhiteBallMoving || this.whiteBallIndex === -1) return;
        
        const whiteBall = this.balls[this.whiteBallIndex];
        if (!whiteBall) return;
        
        const currentTime = Date.now();
        const elapsed = (currentTime - this.whiteBallStartTime) / 1000;
        const progress = Math.min(elapsed / this.whiteBallAnimationDuration, 1.0);
        
        // 计算新位置
        const newX = this.whiteBallStartPos[0] + (this.whiteBallTargetPos[0] - this.whiteBallStartPos[0]) * progress;
        const newZ = this.whiteBallStartPos[2] + (this.whiteBallTargetPos[2] - this.whiteBallStartPos[2]) * progress;
        
        // 更新平移
        whiteBall.transform[12] = newX;
        whiteBall.transform[13] = this.whiteBallStartPos[1];
        whiteBall.transform[14] = newZ;
        
        if (progress >= 1.0) {
            this.isWhiteBallMoving = false;
            console.log('白球动画完成');
        }
    }
    


    // 新增：重置方法（如果需要重新开始）
    resetAnimation() {
        this.hasAnimationTriggered = false;
        this.isWhiteBallMoving = false;
        this.isBlackBallMoving = false;
        this.isLightAnimating = false;
        this.pointLights = [];
        
        // 重置白球位置
        if (this.whiteBallIndex !== -1) {
            const whiteBall = this.balls[this.whiteBallIndex];
            whiteBall.transform[12] = this.whiteBallStartPos[0];
            whiteBall.transform[13] = this.whiteBallStartPos[1];
            whiteBall.transform[14] = this.whiteBallStartPos[2];
            whiteBall.isInPocket = false;
        }
        
        // 重置黑球位置和显示
        if (this.blackBallIndex !== -1) {
            const blackBall = this.balls[this.blackBallIndex];
            blackBall.transform[12] = this.blackBallStartPos[0];
            blackBall.transform[13] = this.blackBallStartPos[1];
            blackBall.transform[14] = this.blackBallStartPos[2];
            blackBall.isInPocket = false;
        }
        
        console.log('动画已重置');
    }
    render(viewMatrix, projectionMatrix, cameraPosition, pointLightsData = null) {
    // 更新白球动画
    if (this.isWhiteBallMoving) {
        this.updateWhiteBallAnimation();
    }
    
    // 更新黑球动画
    if (this.isBlackBallMoving) {
        this.updateBlackBallAnimation();
    }
    
    // 更新点光源动画
    if (this.isLightAnimating) {
        this.updatePointLightAnimation();
    }
    
    // 渲染所有球（跳过已进洞的球）
    this.balls.forEach(ball => {
        if (!ball.isInPocket) { // 只渲染未进洞的球
            ball.render(this.shaderProgram, viewMatrix, projectionMatrix, cameraPosition, pointLightsData);
        }
    });
    }
}