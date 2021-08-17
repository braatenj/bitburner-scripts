/**
 * Author:  Jacob Braaten
 * Desc:    Maps the network from "home" computer and drops in it file 'nmap.txt'
 * Updated: 8/13/2021
 * RAM Cost: 2.45GB
 */

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