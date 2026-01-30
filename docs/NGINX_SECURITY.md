# Nginx Container Security Best Practices

This document outlines the security measures implemented in our production nginx configuration (`docker/nginx.conf`) and Docker setup.

## Server Hardening

### Hide Server Version
```nginx
server_tokens off;
```
Prevents nginx from disclosing its version in error pages and response headers, reducing information leakage to potential attackers.

## Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking by disallowing embedding in iframes from other origins |
| `X-Content-Type-Options` | `nosniff` | Prevents browsers from MIME-type sniffing, reducing drive-by download attacks |
| `X-XSS-Protection` | `1; mode=block` | Enables XSS filter in legacy browsers (modern browsers use CSP) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls how much referrer information is sent with requests |
| `Permissions-Policy` | Disable unused APIs | Restricts access to browser features like camera, microphone, geolocation |
| `Content-Security-Policy` | See below | Controls which resources the browser can load |

### Content Security Policy (CSP)

Our CSP configuration:
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';  # Required for Angular component styles
img-src 'self' data: https:;
font-src 'self';
connect-src 'self';                 # Update when API is available
frame-ancestors 'self';
form-action 'self';
base-uri 'self';
```

**Note:** `unsafe-inline` for styles is required because Angular injects component styles dynamically. This is a known trade-off.

## DoS Protection

### Request Size Limits
```nginx
client_max_body_size 1k;        # No file uploads expected
client_body_buffer_size 1k;
client_header_buffer_size 1k;
large_client_header_buffers 2 1k;
```

### Timeouts
```nginx
client_body_timeout 10s;
client_header_timeout 10s;
keepalive_timeout 15s;
send_timeout 10s;
```

These limits prevent:
- Buffer overflow attacks
- Slowloris attacks
- Resource exhaustion from large requests

## Path Security

### Block Hidden Files
```nginx
location ~ /\.(?!well-known) {
    deny all;
}
```
Blocks access to hidden files (`.env`, `.git`, etc.) while allowing `.well-known` for ACME certificate challenges.

### Block Sensitive File Types
```nginx
location ~* \.(bak|conf|dist|fla|in[ci]|log|orig|psd|sh|sql|sw[op])$ {
    deny all;
}
```

### Block Source Maps
```nginx
location ~* \.map$ {
    deny all;
}
```
Source maps can expose original source code. Block in production unless needed for debugging.

## Docker Security

### Dockerfile (`docker/Dockerfile`)

1. **Multi-stage build**: Reduces final image size and attack surface
2. **Non-root user**: Runs nginx as `nginx-app` (UID 1001)
3. **Health check**: Enables container orchestration monitoring

### Docker Compose (`docker/docker-compose.yml`)

```yaml
security_opt:
  - no-new-privileges:true  # Prevents privilege escalation
read_only: true              # Read-only root filesystem
tmpfs:
  - /var/cache/nginx         # Writable temp storage for nginx
  - /var/run                 # Writable for PID file
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 128M
```

## Caching Strategy

### Static Assets (JS, CSS, images, fonts)
```nginx
expires 1y;
add_header Cache-Control "public, immutable";
```
Angular uses content hashing, so assets can be cached indefinitely.

### HTML Entry Point
```nginx
expires -1;
add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
```
Never cache `index.html` to ensure users get the latest app version.

## Important Notes

1. **Security headers in location blocks**: When using `add_header` in a location block, it replaces (not appends to) headers from the parent context. Re-add critical security headers in each location block.

2. **CSP connect-src**: Update the `connect-src` directive when the backend API URL is known.

3. **HTTPS termination**: This config assumes HTTPS is terminated by a load balancer or reverse proxy. If nginx handles TLS directly, additional SSL configuration is required.

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [nginx Security Controls](https://docs.nginx.com/nginx/admin-guide/security-controls/)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
