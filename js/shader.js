const vertexShaderSource = `#version 300 es
in vec4 aPosition;
in vec3 aNormal;
in vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vNormal;
out vec3 vPosition;
out vec2 vTexCoord;

void main() {
    vec4 worldPosition = uModelMatrix * aPosition;
    vPosition = worldPosition.xyz;
    vNormal = uNormalMatrix * aNormal;
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPosition;
in vec2 vTexCoord;

uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform sampler2D uTexture;
uniform bool uUseTexture;

// 主光源
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uViewPosition;

// 点光源
uniform vec3 uPointLightPositions[4];
uniform vec3 uPointLightColors[4];
uniform float uPointLightIntensities[4];
uniform int uPointLightCount;

// 聚光灯
uniform vec3 uSpotLightPosition;
uniform vec3 uSpotLightDirection;
uniform vec3 uSpotLightColor;
uniform float uSpotLightIntensity;
uniform float uSpotLightCutoff;
uniform float uSpotLightExponent;

out vec4 fragColor;

// 简单的圆形光圈测试
vec3 calculateSpotLightSimple(vec3 lightPos, vec3 fragPos) {
    // 计算在XZ平面上的距离（忽略Y轴）
    vec2 lightPosXZ = vec2(lightPos.x, lightPos.z);
    vec2 fragPosXZ = vec2(fragPos.x, fragPos.z);
    float distanceXZ = length(fragPosXZ - lightPosXZ);
    
    // 添加高度限制：只影响Y坐标在0.5到1.5之间的物体（台球桌高度）
    float tableHeight = fragPos.y;
    if (distanceXZ < 0.88 && tableHeight > 0.5 && tableHeight < 1.5) {
        return uSpotLightColor * uSpotLightIntensity;
    }
    
    return vec3(0.0);
}


void main() {
    // 基础光照
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(uLightPosition - vPosition);
    float diff = max(dot(norm, lightDir), 0.0);
    
    vec3 diffuse = uDiffuseColor * diff * uLightColor * 2.0;
    vec3 ambient = uAmbientColor * uLightColor * 1.5;
    
    vec3 viewDir = normalize(uViewPosition - vPosition);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
    vec3 specular = uSpecularColor * spec * uLightColor * 1.5;
    
    vec3 baseLight = ambient + diffuse + specular;
    
    vec4 textureColor = vec4(1.0);
    if (uUseTexture) {
        textureColor = texture(uTexture, vTexCoord);
    }
    
    vec3 baseColor = baseLight * textureColor.rgb;
    
    vec3 pocketLight = vec3(0.0);
    
    for (int i = 0; i < 4; i++) {
        if (i >= uPointLightCount) break;
        
        float dist = length(uPointLightPositions[i] - vPosition);
        if (dist < 0.2) {
            float intensity = (0.2 - dist) * 20.0; // 线性衰减
            pocketLight += uPointLightColors[i] * intensity * 0.2;
        }
    }
    
    vec3 spotLight = calculateSpotLightSimple(uSpotLightPosition, vPosition);
    
    // 直接叠加所有效果
    vec3 finalColor = baseColor + pocketLight + spotLight;
    
    fragColor = vec4(finalColor, textureColor.a);
}
`;

class ShaderProgram {
    constructor(gl) {
        this.gl = gl;
        this.program = this.createProgram();
        this.setupAttributes();
        this.setupUniforms();
    }
    
    createProgram() {
        const vertexShader = WebGLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = WebGLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        return WebGLUtils.createProgram(this.gl, vertexShader, fragmentShader);
    }
    
    setupAttributes() {
        const gl = this.gl;
        this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
        this.aNormal = gl.getAttribLocation(this.program, 'aNormal');
        this.aTexCoord = gl.getAttribLocation(this.program, 'aTexCoord');
    }
    
    setupUniforms() {
        const gl = this.gl;
        this.uModelMatrix = gl.getUniformLocation(this.program, 'uModelMatrix');
        this.uViewMatrix = gl.getUniformLocation(this.program, 'uViewMatrix');
        this.uProjectionMatrix = gl.getUniformLocation(this.program, 'uProjectionMatrix');
        this.uNormalMatrix = gl.getUniformLocation(this.program, 'uNormalMatrix');
        
        this.uAmbientColor = gl.getUniformLocation(this.program, 'uAmbientColor');
        this.uDiffuseColor = gl.getUniformLocation(this.program, 'uDiffuseColor');
        this.uSpecularColor = gl.getUniformLocation(this.program, 'uSpecularColor');
        this.uShininess = gl.getUniformLocation(this.program, 'uShininess');
        
        this.uLightPosition = gl.getUniformLocation(this.program, 'uLightPosition');
        this.uLightColor = gl.getUniformLocation(this.program, 'uLightColor');
        this.uViewPosition = gl.getUniformLocation(this.program, 'uViewPosition');
        
        this.uTexture = gl.getUniformLocation(this.program, 'uTexture');
        this.uUseTexture = gl.getUniformLocation(this.program, 'uUseTexture');
        
        // 点光源uniform
        this.uPointLightPositions = gl.getUniformLocation(this.program, 'uPointLightPositions');
        this.uPointLightColors = gl.getUniformLocation(this.program, 'uPointLightColors');
        this.uPointLightIntensities = gl.getUniformLocation(this.program, 'uPointLightIntensities');
        this.uPointLightCount = gl.getUniformLocation(this.program, 'uPointLightCount');
        
        // 聚光灯uniform（新增）
        this.uSpotLightPosition = gl.getUniformLocation(this.program, 'uSpotLightPosition');
        this.uSpotLightDirection = gl.getUniformLocation(this.program, 'uSpotLightDirection');
        this.uSpotLightColor = gl.getUniformLocation(this.program, 'uSpotLightColor');
        this.uSpotLightIntensity = gl.getUniformLocation(this.program, 'uSpotLightIntensity');
        this.uSpotLightCutoff = gl.getUniformLocation(this.program, 'uSpotLightCutoff');
        this.uSpotLightExponent = gl.getUniformLocation(this.program, 'uSpotLightExponent');
    }
    
    use() {
        this.gl.useProgram(this.program);
    }
}