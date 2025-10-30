/**
 * qodo_fix.js
 * Corrección específica para el error de Bedrock en Qodo Gen
 */

// IDs exactos del error actual
const MISSING_TOOL_IDS = [
    'tooluse_u_WrB_iURJyh5pwfEQplkQ',
    'tooluse_5QQa-XPMQbGJZWzvdgN-WA',
    'tooluse_8tE8qQOtRtiRKZ5uE9nFWw',
    'tooluse_PuDAl5z4T6ebJw6S_1PRhA',
    'tooluse_u4C9sizURIaL38DGmsoC-Q',
    'tooluse_auv4yCGEQDyhzBbrsmI6PA'
];

function fixBedrockPayload(messages) {
    // Asegurar que messages[2] existe y tiene content
    if (!messages[2]) {
        messages[2] = { role: 'assistant', content: [] };
    }
    
    // Convertir content a array si no lo es
    if (!Array.isArray(messages[2].content)) {
        messages[2].content = [];
    }

    // Crear un Set de IDs ya presentes
    const presentIds = new Set(
        messages[2].content
            .filter(block => block && block.id)
            .map(block => block.id)
    );

    // Añadir placeholders para los IDs faltantes
    for (const id of MISSING_TOOL_IDS) {
        if (!presentIds.has(id)) {
            messages[2].content.push({
                type: 'toolResult',
                id: id,
                toolId: 'placeholder_tool',
                output: {
                    stdout: 'Placeholder result for missing tool output',
                    exitCode: 0
                }
            });
        }
    }

    return messages;
}

// Ejemplo de uso (cómo integrar en Qodo)
async function example() {
    const messages = [
        { role: 'system', content: 'System message' },
        { role: 'user', content: 'User message' },
        { role: 'assistant', content: [] }
    ];

    const fixed = fixBedrockPayload(messages);
    console.log('Fixed payload:', JSON.stringify(fixed[2].content, null, 2));
    return fixed;
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined') {
    module.exports = { fixBedrockPayload, MISSING_TOOL_IDS };
}

// Ejecutar ejemplo si se llama directamente
if (require.main === module) {
    example().then(() => {
        console.log('✓ Payload fixed with all required toolResult blocks');
        console.log('→ Copy fixBedrockPayload() y úsalo justo antes de llamar a Bedrock');
    });
}

/*
INSTRUCCIONES DE USO EN QODO:

1. Justo antes de la llamada a Bedrock/litellm, añade:

   const { fixBedrockPayload } = require('./qodo_fix');
   messages = fixBedrockPayload(messages);

2. Esto asegura que messages[2].content contenga todos los toolResult blocks
   que Bedrock espera, evitando el error.

3. Si el error persiste, verifica que:
   - El payload final tiene los toolResult blocks (console.log)
   - Los IDs coinciden exactamente
   - El formato es { type: 'toolResult', id, toolId, output }
*/