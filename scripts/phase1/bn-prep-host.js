/**
 * Author:  Jacob Braaten
 * Desc:    Maps the network from "home" computer and drops in it file 'nmap.txt'
 * Updated: 8/13/2021
 * RAM Cost: 2.35GB
 */

export async function main(ns) {
    var host = ns.getHostname();
    var hostMinSecurity = ns.getServerMinSecurityLevel(host);
    var hostMaxMoney = ns.getServerMaxMoney(host);

    while(hostMinSecurity < ns.getServerSecurityLevel(host) || ns.getServerMoneyAvailable(host) < hostMaxMoney) {
        if(ns.getServerSecurityLevel(host) > hostMinSecurity) {
            await ns.weaken(host);
        } else if(ns.getServerMoneyAvailable(host) < hostMaxMoney) {
            await ns.grow(host);
        }
    }

    ns.tprint("[BN-PREP-HOST] Completed prepping host: " + host);
}

