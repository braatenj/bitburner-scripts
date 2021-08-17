/**
 * Author:  Jacob Braaten
 * Desc:    Starting point for botnet, does calculations and holds data
 *          Run botnet by using "run bn-daemon.js"
 */

var serverNames = [];
var serverList = [];
var serverListRAM = [];
var serverListMoney = [];
var portCrackers = [];
var daemonHost = null;
var hacknetNodes = [];
const hacknetNodesToBuy = 4;

const hackSecurityHardening = 0.002;
const growSecurityHardening = 0.004;
const weakenThreadStrength = .05;

export async function main(ns) {
    //reset stuff
    serverList = [];
    serverListRAM = [];
    serverListMoney = [];
    portCrackers = [];

    //get daemon host name
    daemonHost = ns.getHostname();

    await buildPortCrackerList(ns);
    buildServerList(ns);

    while(true) {

        await ns.sleep(200);
    }

}

function doSomething() {

}

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
        
    }
    return server;
}

function serverToString(server) {
    var string = "Name: " + server.name + "\r\n" +
    "RAM: " + server.getRam() + "GB\r\n" +
    "MaxMoney: " + server.maxMoney + "\r\n" +
    "CurrentMoney: " + server.money() + "\r\n" +
    "MinSecurity: " + server.minSecurity + "\r\n" +
    "CurrentSecurity: " + server.security() + "\r\n" +
    "HackingRequired: " + server.hackingRequired + "\r\n" +
    "PortsRequired: " + server.portsRequired + "\r\n" +
    "canHack: " + server.canHack() + "\r\n" +
    "canCrack: " + server.canCrack() + "\r\n" +
    "isRooted: " + server.isRooted() + "\r\n";
    
    return string;
}

function printAllServers(ns) {
    for(var i = 0; i < serverList.length; i++) {
        ns.tprint(serverToString(serverList[i]));
    }
}

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
    serverList.push(server);
    serverNames.push(server.name);
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

function doNuke(ns, serverName) {
    ns.nuke(serverName);
}

function getRoot(ns, server) {
    if(server.canCrack) {
        for(var i = 0; i < server.portsRequired; i++) {
            if(portCrackers[i].exists()) {
                portCrackers[i].runAt(server.name);
            }
        }

        doNuke(ns, server.name);
    }
}

