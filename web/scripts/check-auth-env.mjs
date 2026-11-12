const secret=process.env.JWT_SECRET?.trim();
if(!secret||secret.length<32){console.error("[auth] JWT_SECRET must be configured with at least 32 random characters");process.exit(1)}
console.log("[auth] JWT configuration is ready");
