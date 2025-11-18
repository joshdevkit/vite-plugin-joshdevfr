export function resolveDevServerUrl(config) {
    const { server } = config;
    const protocol = server.https ? "https" : "http";
    const host = server.host || "localhost";
    const port = server.port || 5173;

    return `${protocol}://${host}:${port}`;
}
