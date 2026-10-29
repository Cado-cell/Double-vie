# Deploying Double Vie on Dokploy

The game is a static PWA, so the image is just nginx plus the published files (`index.html`, `app.js`, `sw.js`,
`manifest.webmanifest`, icons). Files involved:

| File | Role |
| --- | --- |
| `docker-compose.yml` | Compose file for Dokploy (one service, `double-vie`, port 80, joined to `dokploy-network`) |
| `Dockerfile` | `nginx:1.27-alpine` + the published files |
| `deploy/nginx.conf` | Cache headers (service worker never cached), gzip, `/healthz` |
| `.dockerignore` | Allow-list of the files sent to the build |

## Steps in Dokploy

1. **Create service → Compose.** Provider: Git, repository `Cado-cell/double-vie`, branch `main`,
   compose path `./docker-compose.yml`, type "Docker Compose".
2. **Domains tab:** add your domain, service `double-vie`, container port `80`, HTTPS on (Let's Encrypt).
   HTTPS is required for the PWA install and the service worker.
3. **Deploy.** Enable *Auto Deploy* and add the webhook to GitHub to redeploy on every push.

No Traefik labels are needed in the compose file: Dokploy generates them from the Domains tab.

## Updating the game

The published files at the repository root are the ones served. They are produced by
`python3 tools/build_pwa.py --publish`; a normal push to `main` then a redeploy is enough. Players get the new
version the next time they open the app (the service worker is network-first and `sw.js` is never cached).

## Testing locally

```sh
docker build -t double-vie .
docker run --rm -p 8080:80 double-vie
# open http://localhost:8080  (health check: http://localhost:8080/healthz)
```

`docker compose up` only works on a host where the `dokploy-network` network exists
(`docker network create dokploy-network` creates it for a local test).
