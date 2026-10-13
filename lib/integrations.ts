/**
 * Integration utilities for testing third-party service credentials
 */

export async function testSunoApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.suno.ai/api/clips', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    // If we get a 401, the key is invalid; anything else means the API is reachable
    return response.status !== 401;
  } catch (error) {
    console.error('Suno API test error:', error);
    return false;
  }
}

export async function testElevenLabsApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
      }
    });
    // If we get a 401, the key is invalid; anything else means the API is reachable
    return response.status !== 401;
  } catch (error) {
    console.error('ElevenLabs API test error:', error);
    return false;
  }
}

export async function testHiggsFieldAccount(accountId: string): Promise<boolean> {
  try {
    // Basic validation - HiggsField might not have a public API endpoint to test
    // For now, just check if it's a valid email or account identifier
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(accountId) || accountId.length > 3;
  } catch (error) {
    console.error('HiggsField account test error:', error);
    return false;
  }
}
