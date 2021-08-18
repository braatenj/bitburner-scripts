/**
 * Author:  Jacob Braaten
 * Desc:    Maps the network from "home" computer and drops in it file 'nmap.txt'
 * Updated: 8/13/2021
 * RAM Cost: 
 */

var purchasedServers = [];

const maxPurchasedServerRam = 1048576;
const purchasedServerCostPerRam = 55000;
const maxPurchasedServerRamExponent = 20;
const maxPurchasedServers = 25;
const minPurchasedServerRam = 8;
const buyServers = true;

export async function main(ns) {
    while(buyServers) {
        //get status 0 = maxRamCanBuy is less than minimum defined, 1 = server purchased successfully, 2 = no longer able to buy servers (at limit and all servers are max ram)
        buyBestServerPossible(ns);
        if(allServersMaxed(ns)) {
            buyServers = false;
        }
        await ns.sleep(1000);
    }
}

function getCurrentMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}

function buyBestServerPossible(ns) {
    var money = getCurrentMoney(ns);
    var maxRamExponent = 1;
    var existingServers = ns.getPurchasedServers();

    while(Math.pow(2, maxRamExponent + 1) * purchasedServerCostPerRam <= money && maxRamExponent < maxPurchasedServerRamExponent) {
        maxRamExponent++;
    }

    var maxRamCanBuy = Math.pow(2,maxRamExponent);

    if(maxRamCanBuy < minPurchasedServerRam && maxRamCanBuy < Math.pow(2,maxPurchasedServerRamExponent)) {
        return 0;
    }

    if(existingServers.length < maxPurchasedServers) {
        if(getCurrentMoney(ns) >= maxRamCanBuy * purchasedServerCostPerRam) {
            var server = ns.purchaseServer("daemon", maxRamCanBuy);
            if(server !== "") {
                purchasedServers.push(server);
                return 1;
            }
            else {
                return 0;
            }
        }
    } else {
        var worstServer = null;
        var worstRam = maxPurchasedServerRam;
        for(var i = 0; i < purchasedServers.length; i++) {
            var maxRam = ns.getServerMaxRam(purchasedServers[i]);
            if(maxRam < worstRam) {
                worstServer = purchasedServers[i];
            }
        }

        if(worstServer !== null && maxRamCanBuy > ns.getServerMaxRam(worstServer)) {
            sellPurchasedServer(ns, worstServer);
        }
        if(getCurrentMoney(ns) >= maxRamCanBuy * purchasedServerCostPerRam) {
            var server = ns.purchaseServer("daemon", maxRamCanBuy);
            if(server !== "") {
                purchasedServers.push(server);
                return 1;
            }
            else {
                return 0;
            }
        }
    }
}

function sellPurchasedServer(ns, serverName) {
    ns.killall(serverName);
    ns.deleteServer(serverName);
}

function allServersMaxed(ns) {
    var maxed = false;
    if(purchasedServers.length == maxPurchasedServers) {
        for(var i = 0; i < purchasedServers.length; i++) {
            if(ns.getServerMaxRam(purchasedServers[i]) < maxPurchasedServerRam) {
                return false;
            }
        }
        maxed = true;
    }

    return maxed;
}

