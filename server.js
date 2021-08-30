const http = require('http');
const path = require('path');
const fs = require('fs');
let wwwroot = 'public';
let defaultRessource = 'index.html';

function requestedStaticRessource(url) {
    let ressourceName = url === '/' ? defaultRessource : url;
    return path.join(__dirname, wwwroot, ressourceName);
}

function sendRequestedFile(filePath, res){
    let contentType = extToContentType(filePath);
    fs.readFile(filePath,(err, content) => {
        if (err){
            if (err.code == 'ENOENT') {
                if (contentType == 'text/html') {
                    // Page not found
                    fs.readFile(path.join(__dirname, wwwroot, '404.html'), (err, content) => { 
                        // we assume here there will be no error ;-)
                        res.writeHead(200, {'Content-Type' : 'text/html'});
                        res.end(content,'utf8');
                    });
                } else {
                    // ressource not found
                    res.writeHead(404);
                    res.end();
                }
            } else {
                // Some server error
                res.writeHead(500);
                res.end(`Server error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content);
        }
    });  
}
function extToContentType(filePath){
    let contentType = 'text/html';
    switch (path.extname(filePath)){
        // complete MIME list define @ https://developer.mozilla.org/fr/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
        case '.js': 
            contentType = 'text/javascript';
            break;
        case '.css': 
            contentType = 'text/css';
            break;
        case '.png': 
            contentType = 'image/png';
            break;
        case '.jpg': 
            contentType = 'image/jpg';
        break;
        case '.ico': 
            contentType = 'image/x-icon';
            break;
        case '.json': 
            contentType = 'application/json';
            break;
    }
    return contentType;
}
const server = http.createServer((req, res) => {
    console.log(`URL requested: ${req.url}`);
    let filePath = requestedStaticRessource(req.url);
    sendRequestedFile(filePath, res);
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));