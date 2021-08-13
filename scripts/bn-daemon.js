/**
 * Author:  Jacob Braaten
 * Desc:    Starting point for botnet, does calculations and holds data
 *          Run botnet by using "run bn-daemon.js"
 */


var serverList = [];
var serverListRAM = [];
var serverListMoney = [];
var portCrackers = [];
var daemonHost = null;

export async function main(ns) {
    //reset stuff
    serverList = [];
    serverListRAM = [];
    serverListMoney = [];
    portCrackers = [];

    //get daemon host name
    daemonHost = ns.getHostname();

    await buildPortCrackerList(ns);


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
        canHack: function() { return this.hackingRequired <= this.instance.getServerRequiredHackingLevel(); },
        canCrack: function() { return this.portsRequired <= getPortCrackers(ns); },
        isRooted: function() { return this.instance.hasRootAccess(this.name); },
    }


}

function buildServerList(ns) {

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
        },
        doNuke: function(target) {
            this.instance.doNuke(target);
        }
    }
    return crack;
}

async function buildPortCrackerList(ns) {
    var cracks = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
    for(var i = 0; i < cracks.length; i++) {
        var cracker = buildPortCracker(ns, cracks[i]);
        portCrackers.push(cracker);
    }
}

function getPortCrackers(ns) {
    var count = 0;
    for(i = 0; i < portCrackers.length; i++) {
        if(portCrackers[i].exists()) {
            count++;
        }
    }
    return count;
}