class Mesh {
    constructor(gl, geometry, material) {
        this.gl = gl;
        this.geometry = geometry;
        this.material = material;
        this.transform = mat4.create();
        this.texture = null;
        this.initBuffers();
        
        // 如果有纹理贴图，加载纹理
        if (material.diffuseMap) {
            this.loadTexture(material.diffuseMap);
        }

        this.camera = new Camera();
        
        // 测试：检查方法是否存在
        console.log('updateAnimation 方法是否存在:', typeof this.camera.updateAnimation);
        console.log('animateToTopView 方法是否存在:', typeof this.camera.animateToTopView);
    }
    
    initBuffers() {
        this.positionBuffer = WebGLUtils.createBuffer(this.gl, this.geometry.positions);
        this.normalBuffer = WebGLUtils.createBuffer(this.gl, this.geometry.normals);
        this.texCoordBuffer = WebGLUtils.createBuffer(this.gl, this.geometry.texCoords);
        this.indexBuffer = WebGLUtils.createIndexBuffer(this.gl, this.geometry.indices);
        this.indexCount = this.geometry.indices.length;
    }
    
    loadTexture(url) {
        const gl = this.gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        
        // 设置临时纹理（白色）
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
        
        // 加载实际纹理
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            
            // 生成mipmap
            gl.generateMipmap(gl.TEXTURE_2D);
            
            // 设置纹理参数
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
        image.src = url;
    }
    
    render(shaderProgram, viewMatrix, projectionMatrix, cameraPosition) {
        const gl = this.gl;
        
        // 设置顶点属性
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.aPosition);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(shaderProgram.aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.aNormal);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.aTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.aTexCoord);
        
        // 设置uniform
        gl.uniformMatrix4fv(shaderProgram.uModelMatrix, false, this.transform);
        gl.uniformMatrix4fv(shaderProgram.uViewMatrix, false, viewMatrix);
        gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projectionMatrix);
        
        // 计算法线矩阵
        const normalMatrix = mat3.create();
        mat3.normalFromMat4(normalMatrix, this.transform);
        gl.uniformMatrix3fv(shaderProgram.uNormalMatrix, false, normalMatrix);
        
        // 设置材质属性
        gl.uniform3fv(shaderProgram.uAmbientColor, this.material.ambient);
        gl.uniform3fv(shaderProgram.uDiffuseColor, this.material.diffuse);
        gl.uniform3fv(shaderProgram.uSpecularColor, this.material.specular);
        gl.uniform1f(shaderProgram.uShininess, this.material.shininess);
        
        // 设置光照
        gl.uniform3fv(shaderProgram.uLightPosition, [2, 5, 3]);
        gl.uniform3fv(shaderProgram.uLightColor, [1.0, 1.0, 1.0]);
        gl.uniform3fv(shaderProgram.uViewPosition, cameraPosition);

        gl.uniform3fv(shaderProgram.uSpotLightPosition, [0, 1.0, 0]); // 台球桌正上方
        gl.uniform3fv(shaderProgram.uSpotLightDirection, [0, -1, 0]); // 垂直向下
        gl.uniform3fv(shaderProgram.uSpotLightColor, [1.0, 1.0, 1.0]); // 白色光
        gl.uniform1f(shaderProgram.uSpotLightIntensity, 0.3); // 强度
        gl.uniform1f(shaderProgram.uSpotLightCutoff, 0.9); //  cutoff
        gl.uniform1f(shaderProgram.uSpotLightExponent, 1.0); //  exponent
    
        
        // 设置纹理（关键修改！）
        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(shaderProgram.uTexture, 0);
            gl.uniform1i(shaderProgram.uUseTexture, true);
        } else {
            gl.uniform1i(shaderProgram.uUseTexture, false);
        }
        
        // 绘制
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}

// 辅助函数（需要在全局作用域定义）
function radians(degrees) {
    return degrees * Math.PI / 180.0;
}

function cos(rad) {
    return Math.cos(rad);
}

class Scene {
    constructor(gl, shaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        console.log('🚀 开始创建场景对象...');

        this.poolTable = new PoolTable(gl, shaderProgram);
        this.poolBalls = new PoolBalls(gl, shaderProgram);
        this.poolCue = new PoolCue(gl, shaderProgram);

        // 先定义天空盒尺寸，然后根据它创建地面
        this.skyboxSize = 8;
        this.createSkybox();
        this.createGround();

        console.log('✅ 场景创建完成 - 地面与天空盒底部大小匹配');
        
        // 新增：建立对象间连接
        console.log('🔗 建立PoolBalls和PoolCue的连接');
        this.poolBalls.setPoolCue(this.poolCue);
    }
    
    createGround() {
        try {
            // 根据天空盒尺寸创建地面，确保大小匹配
            // 天空盒是立方体，底面是正方形，所以地面也应该是正方形
            const groundSize = this.skyboxSize; // 使用与天空盒相同的尺寸
            const groundGeometry = Geometry.createLargePlane(groundSize, groundSize); 
            
            const groundMaterial = {
                ambient: [0.8, 0.8, 0.8],  // 调整为中性色，让纹理更明显
                diffuse: [0.9, 0.9, 0.9],  // 调整为中性色
                specular: [0.3, 0.3, 0.3],
                shininess: 32.0,
                diffuseMap: '../texture/floor.jpg'  // 添加地面纹理
            };
            
            this.ground = new Mesh(this.gl, groundGeometry, groundMaterial);
            
            // 地面位置 - 在台球桌下方，与天空盒底部对齐
            // 天空盒中心在 [0, 3.23, 0]，高度为 skyboxSize，所以底部在 3.23 - skyboxSize/2
            const skyboxBottomY = 3.23 - this.skyboxSize / 2;
            this.ground.transform = mat4.create();
            mat4.translate(this.ground.transform, this.ground.transform, [0, skyboxBottomY, 0]);
            
            console.log(`✅ 地面创建完成 - 尺寸: ${groundSize}x${groundSize}, 位置: [0, ${skyboxBottomY.toFixed(2)}, 0]，纹理: floor.jpg`);
        } catch (error) {
            console.error('❌ 地面创建失败:', error);
        }
    }
    
    createSkybox() {
        try {
            const skyboxGeometry = Geometry.createSkybox(this.skyboxSize); 
            
            const skyboxMaterial = {
                ambient: [0.1, 0.1, 0.1],  // 调整为白色，让纹理更明显
                diffuse: [0.5, 0.5, 0.5],  // 调整为白色
                specular: [0.1, 0.1, 0.1],
                shininess: 1.0,
                diffuseMap: '../texture/wallpaper.jpg'  // 添加天空纹理
            };
            
            this.skybox = new Mesh(this.gl, skyboxGeometry, skyboxMaterial);
            this.skybox.transform = mat4.create();
            mat4.translate(this.skybox.transform, this.skybox.transform, [0, 3.23, 0]); 
            
            console.log(`✅ 天空盒创建完成 - 尺寸: ${this.skyboxSize}，纹理: wallpaper.jpg`);
        } catch (error) {
            console.error('❌ 天空盒创建失败:', error);
        }
    }

    // 原有的render方法保持不变
    render(viewMatrix, projectionMatrix, cameraPosition) {
        const pointLightsData = this.poolBalls.getPointLights();
        
        console.log('🎨 开始渲染场景...');
        
        // 1. 先渲染天空盒
        if (this.skybox) {
            console.log('🟦 渲染带纹理的天空盒');
            this.gl.depthMask(false);
            this.skybox.render(this.shaderProgram, viewMatrix, projectionMatrix, cameraPosition);
            this.gl.depthMask(true);
        }
        
        // 2. 渲染地面
        if (this.ground) {
            console.log('⬜ 渲染带纹理的地面');
            this.ground.render(this.shaderProgram, viewMatrix, projectionMatrix, cameraPosition);
        }
        
        // 3. 渲染其他物体
        if (this.poolTable) {
            this.poolTable.render(viewMatrix, projectionMatrix, cameraPosition);
        }
        if (this.poolBalls) {
            this.poolBalls.render(viewMatrix, projectionMatrix, cameraPosition, pointLightsData);
        }
        if (this.poolCue) {
            this.poolCue.render(viewMatrix, projectionMatrix, cameraPosition, pointLightsData);
        }
    }
}

// 主程序入口
class Main {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = WebGLUtils.initWebGL(this.canvas);
        if (!this.gl) return;
        
        this.gl.enable(this.gl.DEPTH_TEST);

        // 临时禁用背面剔除来测试地面
        this.gl.disable(this.gl.CULL_FACE);
        console.log('🔓 临时禁用背面剔除 - 测试地面');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.shaderProgram = new ShaderProgram(this.gl);
        this.camera = new Camera();
        this.addCameraAnimationMethods();
        this.camera.setupMouseControls(this.canvas);
        
        this.scene = new Scene(this.gl, this.shaderProgram);
        
        // 添加键盘监听
        this.setupKeyboardControls();
        
        // 启动动画循环
        this.animate();
    }

    addCameraAnimationMethods() {
        // 添加动画相关属性
        this.camera.isAnimating = false;
        this.camera.animationStartTime = 0;
        this.camera.startEye = [0, 0, 0];
        this.camera.startCenter = [0, 0, 0];
        this.camera.startUp = [0, 1, 0];
        this.camera.targetEye = [0, 0, 0];
        this.camera.targetCenter = [0, 0, 0];
        this.camera.targetUp = [0, 1, 0];
        this.camera.originalView = {
            eye: [0, 3, 8],
            center: [0, 0, 0],
            up: [0, 1, 0]
        };
        
        // 修复：添加 lerpVector 方法到 camera
        this.camera.lerpVector = (start, end, progress) => {
            return [
                start[0] + (end[0] - start[0]) * progress,
                start[1] + (end[1] - start[1]) * progress,
                start[2] + (end[2] - start[2]) * progress
            ];
        };
        
        // 添加动画方法
        this.camera.animateToTopView = () => {
            this.camera.startAnimation({
                eye: [0, 10, 0],
                center: [0, 0, 0],
                up: [0, 0, -1]
            });
        };
        
        this.camera.animateToOriginalView = () => {
            this.camera.startAnimation(this.camera.originalView);
        };
        
        this.camera.startAnimation = (targetView) => {
            this.camera.isAnimating = true;
            this.camera.animationStartTime = Date.now();
            this.camera.startEye = [...this.camera.eye];
            this.camera.startCenter = [...this.camera.center];
            this.camera.startUp = [...this.camera.up];
            this.camera.targetEye = targetView.eye;
            this.camera.targetCenter = targetView.center;
            this.camera.targetUp = targetView.up;
            console.log('🎥 开始相机动画');
        };
        
        this.camera.updateAnimation = () => {
            if (!this.camera.isAnimating) return;
            
            const currentTime = Date.now();
            const elapsed = currentTime - this.camera.animationStartTime;
            const progress = Math.min(elapsed / 1000, 1);
            
            // 修复：使用 this.camera.lerpVector
            this.camera.eye = this.camera.lerpVector(this.camera.startEye, this.camera.targetEye, progress);
            this.camera.center = this.camera.lerpVector(this.camera.startCenter, this.camera.targetCenter, progress);
            this.camera.up = this.camera.lerpVector(this.camera.startUp, this.camera.targetUp, progress);
            
            if (progress >= 1) {
                this.camera.isAnimating = false;
                console.log('✅ 相机动画完成');
            }
        };
        
        console.log('✅ 相机动画方法添加完成');
        console.log('lerpVector 方法是否存在:', typeof this.camera.lerpVector);
        console.log('updateAnimation 方法是否存在:', typeof this.camera.updateAnimation);
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            console.log('按键按下:', event.code); // 添加调试
            
            // 现有空格键功能
            if (event.code === 'Space') {
                event.preventDefault();
                console.log('空格键按下，移动球杆和白球');
                if (this.scene && this.scene.poolCue) {
                    this.scene.poolCue.moveTowardBlackBall();
                    if (this.scene.poolBalls && this.scene.poolBalls.startWhiteBallAnimation) {
                        this.scene.poolBalls.startWhiteBallAnimation();
                    }
                }
            }
            
            // 新增：T键切换到俯视视角
            if (event.code === 'KeyT') {
                event.preventDefault();
                console.log('🎥 T键按下 - 切换到俯视视角');
                if (this.camera && this.camera.animateToTopView) {
                    this.camera.animateToTopView();
                } else {
                    console.log('❌ camera.animateToTopView 不存在');
                }
            }
            
            // 新增：A键返回原始视角
            if (event.code === 'KeyA') {
                event.preventDefault();
                console.log('🎥 A键按下 - 返回原始视角');
                if (this.camera && this.camera.animateToOriginalView) {
                    this.camera.animateToOriginalView();
                } else {
                    console.log('❌ camera.animateToOriginalView 不存在');
                }
            }
            
            // 现有R键功能
            if (event.code === 'KeyR') {
                this.resetAnimation();
            }
        });
    }
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            // 现有空格键功能
            if (event.code === 'Space') {
                event.preventDefault();
                console.log('空格键按下，移动球杆和白球');
                if (this.scene && this.scene.poolCue) {
                    this.scene.poolCue.moveTowardBlackBall();
                    if (this.scene.poolBalls && this.scene.poolBalls.startWhiteBallAnimation) {
                        this.scene.poolBalls.startWhiteBallAnimation();
                    }
                }
            }
            
            // 新增：T键切换到俯视视角
            if (event.code === 'KeyT') {
                event.preventDefault();
                console.log('🎥 T键按下 - 切换到俯视视角');
                this.camera.animateToTopView();
            }
            
            // 新增：A键返回原始视角
            if (event.code === 'KeyA') {
                event.preventDefault();
                console.log('🎥 A键按下 - 返回原始视角');
                this.camera.animateToOriginalView();
            }
            
            // 现有R键功能
            if (event.code === 'KeyR') {
                this.resetAnimation();
            }
        });
    }
    
    resetAnimation() {
        if (this.scene.poolCue) {
            this.scene.poolCue.resetCuePosition();
        }
        if (this.scene.poolBalls) {
            this.scene.poolBalls.resetAnimation();
        }
        console.log('所有动画和位置已重置，可以重新按空格触发');
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        if (this.camera) {
            this.camera.updateAspectRatio(this.canvas.width / this.canvas.height);
        }
    }
    
    animate() {
        // 新增：更新相机动画
        this.camera.updateAnimation();
        
        this.render();
        requestAnimationFrame(() => this.animate());
    }
    
    render() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.shaderProgram.use();
        
        const viewMatrix = this.camera.getViewMatrix();
        const projectionMatrix = this.camera.getProjectionMatrix();
        const cameraPosition = this.camera.eye;
        
        // 获取点光源数据
        let pointLightsData = { count: 0, positions: [], colors: [], intensities: [] };
        if (this.scene && this.scene.poolBalls) {
            if (typeof this.scene.poolBalls.getPointLights === 'function') {
                pointLightsData = this.scene.poolBalls.getPointLights();
            }
        }
        
        // 设置点光源uniform
        if (pointLightsData.count > 0) {
            const positions = [...pointLightsData.positions.flat(), 0, 0, 0, 0, 0, 0, 0, 0, 0].slice(0, 12);
            const colors = [...pointLightsData.colors.flat(), 0, 0, 0, 0, 0, 0, 0, 0, 0].slice(0, 12);
            const intensities = [...pointLightsData.intensities, 0, 0, 0, 0].slice(0, 4);
            
            gl.uniform3fv(this.shaderProgram.uPointLightPositions, positions);
            gl.uniform3fv(this.shaderProgram.uPointLightColors, colors);
            gl.uniform1fv(this.shaderProgram.uPointLightIntensities, intensities);
            gl.uniform1i(this.shaderProgram.uPointLightCount, pointLightsData.count);
        } else {
            gl.uniform1i(this.shaderProgram.uPointLightCount, 0);
        }
        
        // 渲染场景
        this.scene.render(viewMatrix, projectionMatrix, cameraPosition, pointLightsData);
    }
}

// 启动应用
window.addEventListener('load', () => {
    new Main();
});