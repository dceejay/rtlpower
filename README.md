node-red-contrib-rtl-power
==========================

A <a href="http://nodered.org" target="new">Node-RED</a> node that uses an SDR receiver and
the rtl_power application to report radio emission strength.

Note: This is not a decoder - it is purely meant to detect strength of signal at a particular (or small range) of frequencies. You then need to decide what to do with that...

Install
-------

Either use the Menu - Manage Palette option within Node-RED or run the following command in the root directory of your Node-RED install, usually ~/.node-red

    npm install node-red-contrib-rtl-power

Pre-requisites
--------------

The rtl-sdr suite that includes the `rtl_power` command must be installed and available to call from the command line.
The main project is here https://github.com/osmocom/rtl-sdr - but do read instructions first on how to get it installed... On Mac there it is available via Brew.

The rtl_power command runs on a SDR USB Stick so that must also be plugged in.


Usage
-----

Set the low frequency, high frequency, size of bucket/step between them, gain, and amount of time to scan over before reporting. It is very easy to get wrong and you may need to experiment just using the command line command outside of Node-RED in order to find combinations that work for you.

For example

    rtl_power -f 433.42M:434.42M:1M -i 1 -g 0

seems to work for detecting common 433.92 MHz devices, like car key fobs, etc.
