# -*- coding: utf-8 -*-
import os
import mimetypes

def handler(environ, start_response):
    path = environ.get('PATH_INFO', '/')
    
    if path == '/' or path == '':
        path = '/index.html'
    
    file_path = '.' + path
    
    if os.path.isfile(file_path):
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        
        with open(file_path, 'rb') as f:
            content = f.read()
        
        status = '200 OK'
        response_headers = [
            ('Content-Type', content_type),
            ('Content-Length', str(len(content)))
        ]
        start_response(status, response_headers)
        return [content]
    else:
        status = '404 Not Found'
        content = b'Not Found'
        response_headers = [
            ('Content-Type', 'text/plain'),
            ('Content-Length', str(len(content)))
        ]
        start_response(status, response_headers)
        return [content]
