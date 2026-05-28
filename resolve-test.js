const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.resolve4("quote-api.jup.ag", (err, addresses) => {
    if (err) {
        console.log("DNS error:", err.code);
    } else {
        console.log("Resolved:", addresses);
    }
});
