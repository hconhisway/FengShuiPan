class LayeredFengShuiWheel {
    constructor() {
        this.wheelContainer = document.getElementById('wheelContainer');
        this.isDragging = false;
        this.currentLayer = null;
        this.startAngle = 0;
        this.layerRotations = {};
        this.scale = 0.6;
        // 定义7个层，layer1在最上层，每层可以调节大小
        this.layers = [
            { name: 'layer1', file: 'layers/layer1.svg', zIndex: 7, size: 200 * this.scale },
            { name: 'layer2', file: 'layers/layer2.svg', zIndex: 6, size: 375 * this.scale},
            { name: 'layer3', file: 'layers/layer3.svg', zIndex: 5, size: 535 * this.scale},
            { name: 'layer4', file: 'layers/layer4.svg', zIndex: 4, size: 715 * this.scale},
            { name: 'layer5', file: 'layers/layer5.svg', zIndex: 3, size: 895 * this.scale},
            { name: 'layer6', file: 'layers/layer6.svg', zIndex: 2, size: 1065 * this.scale},
            { name: 'layer7', file: 'layers/layer7.svg', zIndex: 1, size: 1235 * this.scale}
        ];
        
        this.initializeLayers();
    }

    initializeLayers() {
        // 清空容器
        this.wheelContainer.innerHTML = '';
        
        // 创建主容器
        const mainContainer = document.createElement('div');
        mainContainer.style.position = 'relative';
        mainContainer.style.width = '100%';
        mainContainer.style.height = '100%';
        
        // 为每个旋转值初始化
        this.layers.forEach(layer => {
            this.layerRotations[layer.name] = 0;
        });
        
        // 创建每一层
        this.createLayers(mainContainer);
        
        this.wheelContainer.appendChild(mainContainer);
    }

    createLayers(container) {
        this.layerElements = {};
        
        this.layers.forEach((layerConfig, index) => {
            // 创建层容器
            const layerContainer = document.createElement('div');
            layerContainer.className = `layer-container ${layerConfig.name}`;
            layerContainer.style.position = 'absolute';
            layerContainer.style.top = '50%';
            layerContainer.style.left = '50%';
            layerContainer.style.transform = 'translate(-50%, -50%)';
            layerContainer.style.width = `${layerConfig.size}px`;
            layerContainer.style.height = `${layerConfig.size}px`;
            layerContainer.style.zIndex = layerConfig.zIndex;
            layerContainer.style.cursor = 'grab';
            layerContainer.style.transformOrigin = 'center center';
            layerContainer.style.transition = 'filter 0.3s ease';

            // 创建SVG图像
            const img = document.createElement('img');
            img.src = layerConfig.file;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.display = 'block';
            img.style.userSelect = 'none';
            img.style.pointerEvents = 'none';
            img.alt = `Feng Shui Wheel ${layerConfig.name}`;

            // 添加加载事件
            img.onload = () => {
                console.log(`${layerConfig.name} loaded successfully`);
            };

            img.onerror = () => {
                console.error(`Failed to load ${layerConfig.name}`);
                layerContainer.innerHTML = `
                    <div style="
                        width: 100%; 
                        height: 100%; 
                        border: 2px dashed #ccc; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                        font-size: 14px;
                        color: #666;
                    ">
                        ${layerConfig.name}<br>加载失败
                    </div>
                `;
            };

            layerContainer.appendChild(img);
            
            // 添加hover效果 - 只在可见区域生效
            layerContainer.addEventListener('mouseenter', () => {
                if (!layerContainer.classList.contains('dragging')) {
                    layerContainer.style.filter = 'brightness(1.1) drop-shadow(0 0 15px rgba(76, 175, 80, 0.6))';
                }
            });

            layerContainer.addEventListener('mouseleave', () => {
                if (!layerContainer.classList.contains('dragging')) {
                    layerContainer.style.filter = 'none';
                }
            });

            // 添加事件监听器
            layerContainer.addEventListener('mousedown', (e) => this.startDrag(e, layerContainer, layerConfig.name));
            layerContainer.addEventListener('touchstart', (e) => this.startDrag(e, layerContainer, layerConfig.name), { passive: false });

            container.appendChild(layerContainer);
            this.layerElements[layerConfig.name] = layerContainer;
        });

        // 添加全局拖拽事件
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('mouseup', () => this.stopDrag());
        document.addEventListener('touchend', () => this.stopDrag());
    }

    startDrag(event, layerElement, layerName) {
        event.preventDefault();
        event.stopPropagation();
        
        this.isDragging = true;
        this.currentLayer = layerElement;
        this.currentLayerName = layerName;
        
        // 视觉反馈
        layerElement.classList.add('dragging');
        layerElement.style.cursor = 'grabbing';
        layerElement.style.filter = 'brightness(1.3) drop-shadow(0 0 20px rgba(76, 175, 80, 0.8))';
        // 不改变z-index，保持原有层级顺序
        
        // 计算起始角度
        const point = this.getEventPoint(event);
        const center = this.getWheelCenter();
        this.startAngle = Math.atan2(point.y - center.y, point.x - center.x);
    }

    drag(event) {
        if (!this.isDragging || !this.currentLayer) return;
        
        event.preventDefault();
        
        // 计算当前角度
        const point = this.getEventPoint(event);
        const center = this.getWheelCenter();
        const currentAngle = Math.atan2(point.y - center.y, point.x - center.x);
        
        // 计算角度差并转换为度数
        const deltaAngle = currentAngle - this.startAngle;
        const deltaRotation = (deltaAngle * 180) / Math.PI;
        
        // 更新该层的旋转角度
        this.layerRotations[this.currentLayerName] += deltaRotation;
        
        // 应用旋转
        this.currentLayer.style.transform = `translate(-50%, -50%) rotate(${this.layerRotations[this.currentLayerName]}deg)`;
        
        // 更新起始角度
        this.startAngle = currentAngle;
    }

    stopDrag() {
        if (this.currentLayer) {
            this.currentLayer.classList.remove('dragging');
            this.currentLayer.style.cursor = 'grab';
            this.currentLayer.style.filter = 'none';
            // z-index保持不变，不需要恢复
        }
        
        this.isDragging = false;
        this.currentLayer = null;
        this.currentLayerName = null;
    }

    getEventPoint(event) {
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        
        const rect = this.wheelContainer.getBoundingClientRect();
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    getWheelCenter() {
        const rect = this.wheelContainer.getBoundingClientRect();
        
        return {
            x: rect.width / 2,
            y: rect.height / 2
        };
    }

    // 重置所有层的旋转
    resetAllLayers() {
        this.layers.forEach(layerConfig => {
            this.layerRotations[layerConfig.name] = 0;
            const element = this.layerElements[layerConfig.name];
            if (element) {
                element.style.transform = 'translate(-50%, -50%) rotate(0deg)';
            }
        });
    }

    // 获取当前所有层的旋转角度
    getAllRotations() {
        return { ...this.layerRotations };
    }

    // 设置特定层的旋转角度
    setLayerRotation(layerName, angle) {
        if (this.layerRotations.hasOwnProperty(layerName)) {
            this.layerRotations[layerName] = angle;
            const element = this.layerElements[layerName];
            if (element) {
                element.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            }
        }
    }

    // 设置特定层的大小
    setLayerSize(layerName, size) {
        const layerConfig = this.layers.find(l => l.name === layerName);
        if (layerConfig) {
            layerConfig.size = size;
            const element = this.layerElements[layerName];
            if (element) {
                element.style.width = `${size}px`;
                element.style.height = `${size}px`;
                console.log(`${layerName} size set to ${size}px`);
            }
        }
    }

    // 获取所有层的配置
    getLayerConfigs() {
        return this.layers.map(layer => ({
            name: layer.name,
            size: layer.size,
            rotation: this.layerRotations[layer.name] || 0,
            zIndex: layer.zIndex
        }));
    }

    // 批量设置层大小
    setAllLayerSizes(sizes) {
        if (Array.isArray(sizes) && sizes.length === 7) {
            sizes.forEach((size, index) => {
                const layerName = `layer${index + 1}`;
                this.setLayerSize(layerName, size);
            });
        } else if (typeof sizes === 'object') {
            Object.keys(sizes).forEach(layerName => {
                this.setLayerSize(layerName, sizes[layerName]);
            });
        }
    }
}

// 初始化交互式风水轮盘
document.addEventListener('DOMContentLoaded', () => {
    const wheel = new LayeredFengShuiWheel();
    
    // 将wheel实例绑定到window，方便调试
    window.fengShuiWheel = wheel;
});

// 添加使用说明
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const instructions = document.createElement('div');
    instructions.className = 'instructions';
    instructions.innerHTML = `
        <strong>How to use:</strong><br>
        • Click and drag any visible part of a layer to rotate it<br>
        • 7 layers total, layer1 (smallest) is on top<br>
        • Each layer can be rotated independently<br>
        • Upper layers naturally cover lower layers<br>
        • Works on desktop and mobile devices<br>
        <br>
    `;
    container.appendChild(instructions);
}); 