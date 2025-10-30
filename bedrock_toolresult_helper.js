/**
 * bedrock_toolresult_helper.js
 * Helper utilities to validate and attach toolResult blocks to a Bedrock/litellm payload.
 *
 * Usage:
 * - Call `validateAndAttachToolResults(messages, expectedIds, toolResults)` before sending the
 *   payload to Bedrock to ensure messages[2].content contains the toolResult objects that Bedrock
 *   expects. If any are missing, placeholders are inserted with an `error` field so Bedrock receives
 *   toolResult blocks and doesn't reject the request.
 * - Integrate in your agent code just before the final call to litellm/Bedrock.
 *
 * This file is a local helper example and should be adapted to the exact schema your integration
 * expects. The format below uses objects with: { type: 'toolResult', id, toolId, output }
 */

/**
 * Validate that messages[2].content contains toolResult blocks for all expectedIds.
 * If not present, attach placeholders (with error info) or the provided toolResults.
 *
 * @param {Array} messages - the messages array to be sent to Bedrock
 * @param {Array<string>} expectedIds - list of tooluse_* ids Bedrock reported as required
 * @param {Array<Object>} toolResults - array of tool result objects produced by tools (may be empty)
 *        each toolResult should include at least: { id, toolId, output }
 * @returns {Object} { ok: boolean, missing: string[], messages: Array }
 */
function validateAndAttachToolResults(messages, expectedIds = [], toolResults = []){
  if(!Array.isArray(messages)) throw new Error('messages must be an array');

  // Ensure there is an assistant slot at index 2
  if(!messages[2]){
    messages[2] = { role: 'assistant', content: [] };
  }

  // Normalize content to an array
  if(!Array.isArray(messages[2].content)){
    messages[2].content = [ messages[2].content || [] ];
  }

  const presentMap = new Map();
  for(const block of messages[2].content){ if(block && block.id) presentMap.set(block.id, block); }

  // Index provided toolResults by id for easy lookup
  const provided = new Map();
  for(const tr of (toolResults || [])){
    if(tr && tr.id) provided.set(tr.id, tr);
  }

  const missing = [];
  for(const id of expectedIds){
    if(!presentMap.has(id)){
      // Try to find in provided toolResults
      if(provided.has(id)){
        const tr = provided.get(id);
        const block = { type: 'toolResult', id: tr.id, toolId: tr.toolId || null, output: tr.output || {} };
        messages[2].content.push(block);
        presentMap.set(id, block);
      } else {
        // Create a placeholder so Bedrock receives a toolResult block and doesn't reject
        const placeholder = {
          type: 'toolResult',
          id,
          toolId: null,
          output: { error: `Missing tool result for ${id}`, time: new Date().toISOString() }
        };
        messages[2].content.push(placeholder);
        missing.push(id);
      }
    }
  }

  // Return status
  return { ok: missing.length === 0, missing, messages };
}

/**
 * Example convenience function to build messages and attach results from async tool calls.
 * toolCallFunctions should be an array of async functions that return an object { id, toolId, output }
 */
async function buildMessagesWithToolCalls(systemText, userText, toolCallFunctions = [], expectedIds = []){
  // run tools in parallel and get results
  const toolResults = await Promise.all(toolCallFunctions.map(fn => fn().catch(err => ({ id: `error_${Math.random().toString(36).slice(2)}`, toolId: null, output: { error: String(err) } }))));

  const messages = [
    { role: 'system', content: systemText },
    { role: 'user', content: userText },
    { role: 'assistant', content: [] }
  ];

  // Attach provided tool results directly
  for(const tr of toolResults){
    if(tr && tr.id){
      messages[2].content.push({ type: 'toolResult', id: tr.id, toolId: tr.toolId || null, output: tr.output || {} });
    }
  }

  // Ensure all expectedIds are present (fill placeholders if required)
  const validation = validateAndAttachToolResults(messages, expectedIds, toolResults);
  return validation;
}

// Export for CommonJS and ESM
if(typeof module !== 'undefined') module.exports = { validateAndAttachToolResults, buildMessagesWithToolCalls };

/*
  INTEGRATION NOTES:
  - Place this helper in the code path right before you call litellm/Bedrock.
  - If your tool runner returns an object with another id field name (e.g. toolUseId), map it to `id` before calling helper.
  - If Bedrock expects a slightly different schema, adapt the block shape accordingly.
  - Logging: add console.log(JSON.stringify(messages[2].content, null, 2)) for debugging if Bedrock rejects again.

  Example usage (pseudo):
    const { buildMessagesWithToolCalls } = require('./bedrock_toolresult_helper');
    const validation = await buildMessagesWithToolCalls(sys, user, [() => runTerminal(cmd), () => fetchWeb(url)], expectedToolIds);
    if(!validation.ok) console.warn('Missing tool results', validation.missing);
    // send validation.messages to litellm/Bedrock
*/
