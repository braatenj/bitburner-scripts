/**
 * Author:  Jacob Braaten
 * Desc:    Maps the network from "home" computer and drops in it file 'nmap.txt'
 * Updated: 8/13/2021
 * RAM Cost: 
 */

 export async function main(ns) {
    buildServerList(ns);
    buildPortCrackerList(ns);


}

const serversByName = [];
const serversByValue = [];
const serversByMaxMoney = [];
const serversByRam = [];
const serversByPortsRequired = [];
const serversNotRooted = [];
const portCrackers = [];


function buildPortCracker(ns, crackName) {
    var crack = {
        instance: ns,
        name: crackName,
        exists: function() {return this.instance.fileExists(crackName, "home"); },
        runAt: function(target) {
            switch(this.name) {
                case "BruteSSH.exe":
                    this.instance.brutessh(target);
                    break;
                case "FTPCrack.exe":
                    this.instance.ftpcrack(target);
                    break;
                case "relaySMTP.exe":
                    this.instance.relaysmtp(target);
                    break;
                case "HTTPWorm.exe":
                    this.instance.httpworm(target);
                    break;
                case "SQLInject.exe":
                    this.instance.sqlinject(target);
                    break;
            }
        }
    }
    return crack;
}

function buildPortCrackerList(ns) {
    var cracks = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
    for(var i = 0; i < cracks.length; i++) {
        var cracker = buildPortCracker(ns, cracks[i]);
        portCrackers.push(cracker);
    }
}

function getPortCrackers(ns) {
    var count = 0;
    for(var i = 0; i < portCrackers.length; i++) {
        if(portCrackers[i].exists()) {
            count++;
        }
    }
    return count;
}

function updateServersNotRootedList() {

    if(serversNotRooted.length == 0) {
        return;
    }

    for(var i = 0; i < serversNotRooted; i++) {
        if(serversNotRooted[i].isRooted()) {
            serversNotRooted[i].pop();
        }
    }
}

function doTargetingLoop(ns) {
    updateServersNotRootedList();
    getRootOnPossibleServers(ns);


}

function getRootOnPossibleServers(ns) {
    if(serversNotRooted.length > 0) {
        for(var i = 0; i < serversNotRooted.length; i++) {
            var target = serversNotRooted[0];
            if(!target.isRooted()) {
                if(target.canCrack()) {
                    doRoot(ns, target);
                }
            }
        }
    }
}

function doRoot(ns, server) {
    for(var i = 0; i < server.portsRequired; i++) {
        if(portCrackers[i].exists()) {
            portCrackers[i].runAt(server.name);
        }
    }
    ns.nuke(server.name)
}

function prepServer(ns, server) {
    if(!server.isRooted()) {
        if(server.canCrack()) {
            doRoot(ns, server);
        }
    }

    copyFiles(ns, ["bn-prep-host-phase-1.js", "bn-hack-host-phase-1.js"], server);
    
}

function copyFiles(ns, files, server) {
    ns.scp(files, server.name);

}

//function cost .85GB
function buildServerObject(ns, serverNode) {
    var server = {
        instance: ns,
        name: serverNode,
        getRam: function() { return this.instance.getServerMaxRam(this.name); },
        maxMoney: ns.getServerMaxMoney(serverNode),
        money: function() { return this.instance.getServerMoneyAvailable(this.name); },
        minSecurity: ns.getServerMinSecurityLevel(serverNode),
        security: function() { return this.instance.getServerMinSecurityLevel(this.name); },
        hackingRequired: ns.getServerRequiredHackingLevel(serverNode),
        portsRequired: ns.getServerNumPortsRequired(serverNode),
        canHack: function() { return this.hackingRequired <= this.instance.getHackingLevel(); },
        canCrack: function() { return this.portsRequired <= getPortCrackers(ns); },
        isRooted: function() { return this.instance.hasRootAccess(this.name); },
        timeToWeaken: function() { return this.instance.getWeakTime(this.name); },
        timeToGrow: function() { return this.instance.getGrowTime(this.name); },
        timeToHack: function() { return this.instance.getHackTime(this.name); },
        growthRate: ns.getServerGrowth(serverNode),
        value: 1,
        isPrepping: function() { /*function to see if prep files are on this server and running*/},
        isTarget: function() { /** function to see if a server is targeting this one */},
    }
    return server;
}

//
function buildServerList(ns) {
    var startingNode = daemonHost;
    var hostsToScan = [];
    hostsToScan.push(startingNode);

    while(hostsToScan.length > 0) {
        var hostName = hostsToScan.pop();
        if(!serverNames.includes(hostName)) {
            var connectHosts = ns.scan(hostName);
            for(var i = 0; i < connectHosts.length; i++) {
                hostsToScan.push(connectHosts[i]);
            }
            addServer(buildServerObject(ns, hostName));
        }
    }
}

function addServer(server) {
    serversByName.push(server.name);
    serversByRam.push(server);
    serversByMaxMoney.push(server);
    serversByValue.push(server);
    serversByPortsRequired.push(server);
    serversNotRooted.push(server);
}

function sortServers(sortBy) {
    switch(sortBy) {
        case 'name':
            return serversByName.sort((a,b) => {
                nameA = a.name.toUpperCase();
                nameB = b.name.toUpperCase();
                if(nameA < nameB) {
                    return -1;
                } else if(nameA > nameB) {
                    return 1;
                } else {
                    return 0;
                }
            });
            break;
        case 'ram':
            return serversByRam.sort((a,b) => {
                return a.getRam() - b.getRam();
            });
            break;
        case 'maxMoney':
            return serversByMaxMoney.sort((a,b) => {
                return a.maxMoney - b.maxMoney;
            });
            break;
        case 'value':
            return serversByValue.sort((a,b) => {
                return a.value - b.value;
            });
            break;
        case 'ports':
            return serversByPortsRequired.sort((a,b) => {
                return a.portsRequired - b.portsRequired;
            });
            break;
    }
}

 


