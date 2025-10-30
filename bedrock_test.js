/**
 * bedrock_test.js
 * Script de prueba que demuestra cómo usar bedrock_toolresult_helper.js
 * para validar y corregir el error "Expected toolResult blocks"
 */

const { validateAndAttachToolResults, buildMessagesWithToolCalls } = require('./bedrock_toolresult_helper');

// Simula herramientas que devuelven resultados asíncronos
async function fakeTool(name, resultText, delay = 100) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return {
    id: `tooluse_${Math.random().toString(36).slice(2)}`,
    toolId: name,
    output: { text: resultText }
  };
}

// Test 1: Payload sin toolResults (reproduce el error)
async function testMissingToolResults() {
  console.log('\nTest 1: Payload sin toolResults (error case)\n' + '-'.repeat(50));
  
  const messages = [
    { role: 'system', content: 'System message' },
    { role: 'user', content: 'User message' },
    { role: 'assistant', content: [] }
  ];

  const expectedIds = [
    'tooluse_u_WrB_iURJyh5pwfEQplkQ',
    'tooluse_5QQa-XPMQbGJZWzvdgN-WA'
  ];

  console.log('Antes de validar:', JSON.stringify(messages[2].content, null, 2));
  
  const validation = validateAndAttachToolResults(messages, expectedIds);
  console.log('\nDespués de validar:', JSON.stringify(messages[2].content, null, 2));
  console.log('\nEstado:', validation.ok ? 'OK' : 'Faltan resultados', validation.missing);
}

// Test 2: Payload con herramientas reales
async function testWithTools() {
  console.log('\nTest 2: Payload con herramientas reales\n' + '-'.repeat(50));

  const tools = [
    () => fakeTool('tool1', 'Resultado 1'),
    () => fakeTool('tool2', 'Resultado 2')
  ];

  const validation = await buildMessagesWithToolCalls(
    'System message',
    'User message',
    tools
  );

  console.log('Messages[2].content:', JSON.stringify(validation.messages[2].content, null, 2));
  console.log('Estado:', validation.ok ? 'OK' : 'Error', validation.missing);
}

// Test 3: Payload mezclado (algunos resultados presentes, otros faltan)
async function testMixedResults() {
  console.log('\nTest 3: Payload mezclado\n' + '-'.repeat(50));

  const messages = [
    { role: 'system', content: 'System message' },
    { role: 'user', content: 'User message' },
    { 
      role: 'assistant',
      content: [{
        type: 'toolResult',
        id: 'tooluse_existing_result',
        toolId: 'some_tool',
        output: { text: 'existing result' }
      }]
    }
  ];

  const expectedIds = [
    'tooluse_existing_result',
    'tooluse_missing_one',
    'tooluse_missing_two'
  ];

  const validation = validateAndAttachToolResults(messages, expectedIds);
  console.log('Messages[2].content:', JSON.stringify(messages[2].content, null, 2));
  console.log('Estado:', validation.ok ? 'OK' : 'Faltan', validation.missing);
}

// Ejecuta todos los tests
async function runAllTests() {
  try {
    await testMissingToolResults();
    await testWithTools();
    await testMixedResults();
  } catch (err) {
    console.error('Error en tests:', err);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllTests().then(() => {
    console.log('\nTests completados. El helper puede:\n' +
      '1. Detectar toolResults faltantes\n' +
      '2. Insertar placeholders para evitar el error de Bedrock\n' +
      '3. Validar el payload antes de enviarlo');
  });
}

/*
Para usar en tu código:

1. Antes de llamar a Bedrock/litellm:
   const validation = validateAndAttachToolResults(messages, expectedIds, toolResults);
   if (!validation.ok) console.warn('Faltan tool results:', validation.missing);
   // usar validation.messages

2. O si ejecutas herramientas:
   const validation = await buildMessagesWithToolCalls(sys, user, toolFunctions);
   // usar validation.messages
*/