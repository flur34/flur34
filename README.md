<div style="display: flex; place-content: center; padding: 1rem">
    <img src=".github/brand/logo.svg" alt="logo" height="100px"/>
    <img src=".github/brand/cross.svg" alt="cross" height="80px">
    <img src=".github/brand/docker.svg" alt="docker" height="80px">
</div>

# KuroSearch X Docker

A Project that aims to containerize Kurosearch to jork it in privacy. Self-host it if you want!

## Tag explanation

| Tag            | Description                         |
| :------------- | :---------------------------------- |
| `latest`       | Latest stable release (recommended) |
| `canary`       | Latest development build            |
| `x.y.z[-rc.n]` | Specific release                    |

## Getting Started

Prerequisites:

- [Docker](https://docs.docker.com/get-started/)
- rule34 API credentials

1. Copy [compose.yaml](./compose.yaml) and [.env](./.env.example) to your project folder
2. Edit the .env file. Every variable is required!
3. Run `docker-compose up -d`
4. Enjoy!

### Bring your own reverse proxy

> ⚠️ All traffic is sent over TLS. If you specifically require HTTP, modify the [Caddyfile](./Caddyfile).
>
> > Remove the `tls` line and mount it as a volume so you don't have to rebuild the container.

For users who want to plug this container into an existing reverse proxy, do the following:

- Set `KUROSEARCH_HOST=localhost` (or to whatever your subdomain is.)
- Set `KUROSEARCH_TLS=internal`
- Map the port in the `compose.yaml` to a free port on your host.
- Point your reverse proxy to the port.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

> ⚠️ Running tests outside the container might fail!
>
> > This is due to the rewrites in the Caddyfile.

Please make sure to update tests as appropriate.

## Got Issues?

Open 'em up in the issues tab (preferably) or contact me. Info below.

Discord: `@flurbudurbur`
