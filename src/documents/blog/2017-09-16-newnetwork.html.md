---
title: "Building a shiny new home network"
date: 2017-09-16
subtitle: "Running (mostly) IPv6-only at home"
---

For quite some tome, I've been working on a new "home network", in order to have a properly designed network that spans multiple sites. Previously I had a complete mess - a single local private v4 subnet behind double NAT, as well as some remote LXC containers on a VPS that lived behind NAT. Connecting this up were several OpenVPN tunnels/bridges to allow access between the networks (but only in specific directions!), as well as for external access. In summary, a big tangled mess of NAT!

Therefore, when building this new network, I wanted to solve a few issues:
1. I'd like routing between every server, allowing me to SSH into remote containers/VMs without having to jump through the host, and for pushing backups between sites
2. Several of my sites (both at home and at university) will be stuck behind NAT, and I would like to be able to connect to the rest of the network from there
3. Everything should have both a logical IP address and hostname to identify what site and VLAN it is on
4. I wanted to learn about IPv6 :)

-split-

After testing various configurations over several months, I eventually settled on the design below (click to enlarge):

<a href="/img/blog/2017-09-16-newnetwork/diagram.svg" target="_blank"><img src="/img/blog/2017-09-16-newnetwork/diagram.svg" width="100%" /></a>

## Core Design
To get around the NAT/firewall restrictions, I'm running a central OpenVPN server, and a VM on each site bridging an interface on a VLAN back to the core network. This means that all of my routers effectively appear to be on the same layer 2 network, and I have nice isolation between my systems and the external network.

Each site has a /56, and each VLAN a /64, with OSPF running between all the routers on the core network. This also means that when my "home" (which is often at Uni) and "house" network are both actually in the same location, the core network can be a local layer 2 network, and I can do full gigabit routing directly between these sites.

Most of my externally accessible services (eg this website) live on a remote server, which also hosts the core router and the VPN server as VMs. Since I'm fairly familiar with it, the edge router is running pfsense - for IPv6 I also terminate a he.net tunnel on there. Originally the per-site routers were also running pfsense, but after encountering some performance issues I moved these to VyOS, which has worked excellently.

## Hosting all this
When I started this project, I only had a single VM host running Proxmox, as mentioned some tome ago on this blog. I added an offsite dedicated Proxmox host for running external services (like this site), to replace an old VPS, and built a new low-power host to leave at home during Uni for offsite backups.

Proxmox works nicely for my uses - I have the majority of my services running in LXC containers, which has allowed me to run a large number of isolated containers with relatively little RAM, especially compared to when I was previously running full VMs.

I also moved my VM/container storage from qcow2 and raw disks on ext4, over to ZFS. This means that I'm no longer stacking file systems (eg ext4 in a VM on qcow2 on ext4), since I can use raw ZFS zvols for VMs. The key advantage of this is that I can also use ZFS send-recv for both file and VM backups, which allows for fast and efficient offsite backups.

## DHCP and DNS
Since I don't own any actual IPv6 space (I'm just using Hurricane Electric's tunnel broker service), I wanted to be able to relatively easily move all of my internal services to a new subnet if required. I settled on running DHCPv6 for every device, and only using static addresses on critical devices (eg routers, VM hosts and DHCP servers).

I initially started using pfsense for DHCP and DNS, but found this was a bit of a pain for setting static addresses for certain servers. I now run a single LXC container running ISC DHCP per site, which allows me to assign static addresses by MAC address, since the link-local addresses are derrived from MAC addresses. I also have a central name server running BIND, which each DHCP server does dynamic updates to.

This means that every server can then automatically have both AAAA and PTR records added for *hostname*.*vlan*.*site*.tomstollard.me.uk. For example, this site is hosted on "www.srv.dedi1.tomstollard.me.uk".

Unlike with running the network in private v4 space, this also finally removes the need for split DNS - all servers have public addresses, and records for these live on a single public name server.

## NAT64/DNS64
From when I initially started testing IPv6, I concluded that I'm lazy, so I'd much rather maintain a single stack v6 network than a dual stack one. The first thing to solve is outgoing connections - for this I set up a VM running Jool for NAT64, which does NAT and maps each address in the 64:ff9b::/96 subnet to the entire IPv4 space. Combined with a resolver doing DNS64, I can then talk to the rest of the internet, dispite my local machine not having a v4 address!

However, not every application works properly with IPv6 - the main one that caused issues for me was Spotify. After some tinkering I found that it supports using a HTTP proxy, so running one on my local machine (I'm using tinyproxy) resolves this. Spotify will talk over v4 (just on 127.0.0.1) to tinyproxy, which can communicate through NAT64 to Spotify's servers.

After all of this, everything worked fine for a few weeks, until I tried to look at the Student Union's website - my resolver wasn't returning an AAAA record for it! After some investigation, I found that this was the first v4-only site I'd visited with DNSSEC enabled, and when a DNS request was sent with the DNSSEC OK flag, the resolver wasn't synthesizing the record. This makes sense, since adding these records would break DNSSEC. However, my internal machines don't run their own DNSSEC validating resolvers, so the simple solution is to add `break-dnssec yes;` to the dns64 section of the BIND config.

## v6-only web servers
Incoming connections were slightly more difficult. Initially, I just gave my primary web server (running Apache) a private v4 address, and forwarded all incoming v4 80/443 traffic to it, and also unfirewalled 80/443 on every individual v6 web server. For v6 traffic, I added AAAA records, and connections went directly to the web servers. For v4, I used my old design, with the web server acting as a reverse proxy for various internal servers.

However, this approach seemed rather cumbersome - SSL was being terminated twice for v4 connections (on the proxy and the web server), meaning I needed to maintain two SSL certificates for each service. I use Let's Encrypt for this, so was able to use plain HTTP verification on the backend web server, but DNS verification on the reverse proxy. This worked, but the entire system felt a bit clunky - it meant that compromising this single web server would allow inspection of all traffic, and modification of any DNS records.

After watching some excellent [presentations online by Mythic Beasts](https://www.youtube.com/watch?v=91hN3PvYUrc), I changed this approach to using a proxy that passes through SSL traffic directly to the backend server, based on the SNI hostname - I'm using sniproxy for this. This makes hosting on v6 only servers very easy, and I can do plain HTTP validation directly on the backend server. In fact, the web server hosting this site does not have a v4 address!

This also means that other services using SSL (eg my IRC bouncer) can also be passed directly through the proxy, and function fine from v4 connections, despite the backend server being single stack v6. Sniproxy is also able to forward raw TCP connections, meaning I can use this same system for forwarding other non-SSL protocols such as SSH to v6-only hosts.
