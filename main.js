async function initWebGPU() {
    const canvas = document.getElementById('gpuCanvas');
    const context = canvas.getContext('webgpu');

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: canvasFormat,
    });

    const vertexShaderCode = `
    @vertex
    fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
        var positions = array<vec2<f32>, 3>(
            vec2<f32>(0.0, 0.5),
            vec2<f32>(-0.5, -0.5),
            vec2<f32>(0.5, -0.5)
        );
        let position = positions[vertexIndex];
        return vec4<f32>(position, 0.0, 1.0);
    }
    `;

    const fragmentShaderCode = `
    @fragment
    fn main() -> @location(0) vec4<f32> {
        return vec4<f32>(1.0, 0.0, 0.0, 1.0);  // Red
    }
    `;

    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: vertexShaderCode,
            }),
            entryPoint: 'main',
        },
        fragment: {
            module: device.createShaderModule({
                code: fragmentShaderCode,
            }),
            entryPoint: 'main',
            targets: [{ format: canvasFormat }],
        },
        primitive: {
            topology: 'triangle-list',
        },
        layout: 'auto'  // Automatically generates layout
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            clearValue: {r: 0.3, g: 0.3, b: 0.3, a: 1.0},  // Gray background
            loadOp: 'clear',
            storeOp: 'store',
        }],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);  // Draw 3 vertices
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
}

initWebGPU();
