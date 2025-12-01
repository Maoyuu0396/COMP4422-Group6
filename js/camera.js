class Camera {
    constructor() {
        this.eye = [0, 3, 8];
        this.center = [0, 0, 0];
        this.up = [0, 1, 0];
        this.fov = 45 * Math.PI / 180;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 100;
        
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.distance = 8;
    }
    
    getViewMatrix() {
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, this.eye, this.center, this.up);
        return viewMatrix;
    }
    
    getProjectionMatrix() {
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.fov, this.aspect, this.near, this.far);
        return projectionMatrix;
    }
    
    setupMouseControls(canvas) {
        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;
            
            this.rotationY += deltaX * 0.01;
            this.rotationX += deltaY * 0.01;
            
            this.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotationX));
            
            this.eye[0] = this.distance * Math.sin(this.rotationY) * Math.cos(this.rotationX);
            this.eye[1] = this.distance * Math.sin(this.rotationX);
            this.eye[2] = this.distance * Math.cos(this.rotationY) * Math.cos(this.rotationX);
            
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.distance += e.deltaY * 0.01;
            this.distance = Math.max(3, Math.min(20, this.distance));
            
            this.eye[0] = this.distance * Math.sin(this.rotationY) * Math.cos(this.rotationX);
            this.eye[1] = this.distance * Math.sin(this.rotationX);
            this.eye[2] = this.distance * Math.cos(this.rotationY) * Math.cos(this.rotationX);
        });
    }
    
    updateAspectRatio(aspect) {
        this.aspect = aspect;
    }
}