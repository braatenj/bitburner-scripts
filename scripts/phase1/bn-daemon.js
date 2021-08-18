/**
 * Author:  Jacob Braaten
 * Desc:    Maps the network from "home" computer and drops in it file 'nmap.txt'
 * Updated: 8/13/2021
 * RAM Cost: 
 */

//defined variables
 var serversByName = [];
 var serversByValue = [];
 var serversByMaxMoney = [];
 var serversByRam = [];
 var serversByPortsRequired = [];
 var serversNotRooted = [];
 var portCrackers = [];
 var daemonHost = null;
 
 //constants
 const RAM_COST_TO_PREP_PER_THREAD = 2.35;
 const RAM_COST_TO_HACK_PER_THREAD = 2.45;

 export async function main(ns) {
    daemonHost = ns.getHostname();
    serversByName = [];
    serversByValue = [];
    serversByMaxMoney = [];
    serversByRam = [];
    serversByPortsRequired = [];
    serversNotRooted = [];
    portCrackers = [];
    ns.sprintf("bn-daemon started on host: %s", daemonHost);
    
    buildServerList(ns);
    buildPortCrackerList(ns);

    var phase1 = true;

    while(phase1) {
        await doTargetingLoop(ns);
    }


}



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
    };
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

async function doTargetingLoop(ns) {
    updateServersNotRootedList();
    await getRootOnPossibleServers(ns);
    sortServers('ports');

    for(var i = 0; i < serversByPortsRequired.length; i++) {
        var currentTarget = serversByPortsRequired[i];

        if(currentTarget.name == "home") {
            continue;
        }

        if(currentTarget.canCrack() && (!currentTarget.isPrepping() && !currentTarget.isTarget()) && (currentTarget.security() > currentTarget.minSecurity || currentTarget.money() < currentTarget.maxMoney)) {
            ns.tprint("[BN-DAEMON] Prepping Host: " + currentTarget.name);
            ns.tprint("CanCrack: " + currentTarget.canCrack());
            ns.tprint("isPrepping: " + currentTarget.isPrepping());
            ns.tprint("isTarget: " + currentTarget.isTarget());
            ns.tprint("security: " + currentTarget.security());
            ns.tprint("minSecurity: " + currentTarget.minSecurity);
            ns.tprint("security > minSecurity: " + currentTarget.security() > currentTarget.minSecurity);
            ns.tprint("money: " + currentTarget.money());
            ns.tprint("maxMoney: " + currentTarget.maxMoney);
            ns.tprint("money < maxMoney: " + currentTarget.money() < currentTarget.maxMoney);


            await prepServer(ns, currentTarget);
            await ns.sleep(1000);
        }

        if(!currentTarget.isPrepping() && !currentTarget.isTarget() && (currentTarget.money() == currentTarget.maxMoney && currentTarget.security() == currentTarget.minSecurity)) {
            ns.tprint("[BN-DAEMON] Hacking Host: " + currentTarget.name);
            await hackServer(ns, currentTarget);
            await ns.sleep(1000);
        }
    }
}

async function getRootOnPossibleServers(ns) {
    if(serversNotRooted.length > 0) {
        for(var i = 0; i < serversNotRooted.length; i++) {
            var target = serversNotRooted[0];
            if(!target.isRooted()) {
                if(target.canCrack()) {
                    await doRoot(ns, target);
                    await ns.sleep(200);
                }
            }
        }
    }
}

async function doRoot(ns, server) {
    for(var i = 0; i < server.portsRequired; i++) {
        if(portCrackers[i].exists()) {
            portCrackers[i].runAt(server.name);
        }
        await ns.sleep(200);
    }
    ns.nuke(server.name);
}

async function hackServer(ns, server) {
    if(!server.isRooted()) {
        if(server.canCrack()) {
            await doRoot(ns, server);
        }
    }

    if(!doesFileExistOnServer(ns, "/scripts/phase1/bn-hack-host.js", server)) {
        copyFiles(ns, ["/scripts/phase1/bn-hack-host.js"], server);
    }

    var maxThreads = Math.floor(server.getRam() / RAM_COST_TO_HACK_PER_THREAD);
    ns.exec("/scripts/phase1/bn-hack-host.js", server.name, maxThreads);
}

async function prepServer(ns, server) {
    if(!server.isRooted()) {
        if(server.canCrack()) {
            await doRoot(ns, server);
        }
    }

    if(!doesFileExistOnServer(ns, "/scripts/phase1/bn-prep-host.js", server)) {
        copyFiles(ns, ["/scripts/phase1/bn-prep-host.js", "/scripts/phase1/bn-hack-host.js"], server);
    }

    var maxThreads = Math.floor(server.getRam() / RAM_COST_TO_PREP_PER_THREAD);

    ns.exec("/scripts/phase1/bn-prep-host.js", server.name, maxThreads);  
}

function doesFileExistOnServer(ns, file, server) {
    return ns.fileExists(file, server.name);
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
        security: function() { return this.instance.getServerSecurityLevel(this.name); },
        hackingRequired: ns.getServerRequiredHackingLevel(serverNode),
        portsRequired: ns.getServerNumPortsRequired(serverNode),
        canHack: function() { return (this.hackingRequired <= this.instance.getHackingLevel() && this.name !== "home"); },
        canCrack: function() { return (this.portsRequired <= getPortCrackers(ns) && this.name !== "home"); },
        isRooted: function() { return this.instance.hasRootAccess(this.name); },
        timeToWeaken: function() { return this.instance.getWeakTime(this.name); },
        timeToGrow: function() { return this.instance.getGrowTime(this.name); },
        timeToHack: function() { return this.instance.getHackTime(this.name); },
        growthRate: ns.getServerGrowth(serverNode),
        value: 1,
        isPrepping: function() { return isFileRunningOnServer(this.instance, "bn-prep-host.js", this); },
        isTarget: function() { return isFileRunningOnServer(this.instance, "bn-hack-host.js", this); },
        toString: function() { return "Name: " + this.name + " MaxMoney: " + this.maxMoney; }
    };
    return server;
}

function isFileRunningOnServer(ns, file, server) {
    return ns.scriptRunning(file, server.name);
}

//
function buildServerList(ns) {
    var startingNode = daemonHost;
    var hostsToScan = [];
    hostsToScan.push(startingNode);

    while(hostsToScan.length > 0) {
        var hostName = hostsToScan.pop();
        if(!serversByName.includes(hostName)) {
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

 


