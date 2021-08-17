export async function main(ns) {
    var host = ns.getHostname();
    var hostMinSecurity = ns.getServerMinSecurityLevel(host);
    var hostMaxMoney = ns.getServerMaxMoney(host);

    while(true) {
        if(ns.getServerSecurityLevel(host) > hostMinSecurity + 0.05) {
            await ns.weaken(host);
        } else if(ns.getServerMoneyAvailable(host) < hostMaxMoney) {
            await ns.grow(host);
        } else {
            await ns.hack(host);
        }
    }
}