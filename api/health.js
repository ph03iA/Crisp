module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Log the request for debugging
  console.log('Health check requested:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  })

  return res.status(200).json({ 
    ok: true, 
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    method: req.method
  })
}

