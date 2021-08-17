export async function main(ns) {
    var host = ns.getHostname();
    var hostMinSecurity = ns.getServerMinSecurityLevel(host);
    var hostMaxMoney = ns.getServerMaxMoney(host);

    while(hostMinSecurity < ns.getServerSecurityLevel(host) || ns.getServerMoneyAvailable(host) < hostMaxMoney) {
        if(ns.getServerSecurityLevel(host) > hostMinSecurity) {
            await ns.weaken(host);
        }
    
        if(ns.getServerMoneyAvailable(host) < hostMaxMoney) {
            await ns.grow(host);
        }
    }
}

