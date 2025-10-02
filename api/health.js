module.exports = function handler(req, res) {
  console.log('Health endpoint called:', { method: req.method, url: req.url })
  res.status(200).json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    message: 'Health check successful'
  })
}

