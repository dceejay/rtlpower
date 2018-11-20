
module.exports = function(RED) {
    "use strict";
    var spawn = require('child_process').spawn;

    function RtlPowerNode(n) {
        RED.nodes.createNode(this, n);
        this.low = n.low;
        this.high = n.high;
        this.bw = n.bw;
        this.time = n.time || 10;
        this.gain = n.gain;
        var node = this;

        // rtl_power -f 433.42M:434.42M:1M -i 1 -g 0
        node.cmd = "rtl_power"
        node.args = ["-i",node.time,"-g",node.gain,"-f",node.low+":"+node.high+":"+node.bw]

        try {
            node.child = spawn(node.cmd, node.args);
            if (RED.settings.verbose) { node.log(node.cmd+" "+JSON.stringify(node.args)); }
            node.status({fill:"green",shape:"dot",text:"running"});

            node.child.stdout.on('data', function (data) {
                //console.log("STDOUT",data.toString().trim());
                if (RED.settings.verbose) { console.log("STDOUT:\n"+data.toString().trim()); }
                var lines = data.toString().trim().split("\n");
                for (var i = 0; i < lines.length; i++ ) {
                    var l = lines[i].trim().split(',');
                    var yr = l.shift();
                    var ts = l.shift();
                    var lo = parseInt(l.shift());
                    var hi = parseInt(l.shift());
                    var bw = parseInt(l.shift());
                    var sa = parseInt(l.shift());
                    var result = l.map(function (x) {
                        return parseFloat(x, 10);
                    });
                    node.send({topic:((hi+lo)/2), payload:result});
                }
            });

            node.child.stderr.on('data', function (data) {
                if (RED.settings.verbose) { console.log("STDERR:",data.toString().trim()); }
                if (data.toString().trim().indexOf("No supported devices found.") !== -1) {
                    node.error("No SDR device found - stopped.");
                    node.status({fill:"red",shape:"ring",text:"stopped - no SDR"});
                }
            });

            node.child.on('close', function (code,signal) {
                if (RED.settings.verbose) { node.log("ret: "+code+" : "+signal); }
                node.child = null;
                // node.status({fill:"red",shape:"ring",text:"stopped"});
            });

            node.child.on('error', function (err) {
                var words = err.toString();
                if (err.errno === "ENOENT") { words = node.cmd+' not found'; }
                else if (err.errno === "EACCES") { words = node.cmd+' not executable'; }
                node.error(words);
                node.status({fill:"red",shape:"ring",text:words});
            });
        }
        catch(err) {
            var words = err.toString();
            if (err.errno === "ENOENT") { words = node.cmd+' not found'; }
            else if (err.errno === "EACCES") { words = node.cmd+' not executable'; }
            node.error(words);
            node.status({fill:"red",shape:"ring",text:words});
        }

        node.on("close", function(done) {
            if (node.child != null) {
                var tout = setTimeout(function() {
                    node.child.kill("SIGKILL"); // if it takes more than 3 secs kill it anyway.
                    done();
                }, 3000);
                node.child.on('exit', function() {
                    if (tout) { clearTimeout(tout); }
                    done();
                });
                if (RED.settings.verbose) { node.log(node.cmd+" stopped"); }
            }
            else { setTimeout(function() { done(); }, 100); }
            node.status({});
        });

    }
    RED.nodes.registerType("rtlpower", RtlPowerNode);
}
