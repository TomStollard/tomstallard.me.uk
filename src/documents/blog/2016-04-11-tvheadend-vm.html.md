---
title: "Running TVheadend in a VM"
date: 2016-04-11
subtitle: "Or how I went from trying to watch HD TV to changing hypervisor..."
---
For the past year or so, I've been running a headless virtualisation server, with a number of both Linux and Windows VMs to store files and for other home server tasks, as well as a load of Linux VMs that I'd spin up for testing software.
One of these servers streams live TV from Freeview across the network, allowing clients (usually Kodi or VLC) to watch TV. However, the quality of this system wasn't always great, and when I got a shiny new DVB T2 tuner to have a go with Freeview HD, I had a number of issues.
-split-


At this point, the VM server was running VMWare ESXi, and making use of its USB passthrough options to allow a VM to use the USB Tuner. This worked OK(ish) with the standard definition tuner, but once I started using the HD tuner, there were a large number of data errors, making it completely impossible to watch TV.

While I was always impressed with ESXi and its features, even though I used very few of these, I still had some major issues:
- It's not free - yes, there are free licenses available, but this locks users out of a large number of new features (if you don't pay for vCenter). As well as all of this, it's still not *free* - I want to be able to see the code!
- It requires either a copy of vCenter, allowing you to use a web UI (but that isn't free), or use a native client, which needed a fairly large installer and was a bit of a pain
- It still doesn't work with my fancy tuner.

So, I started to look for a replacement. Firstly, I tried Virtualbox - it's free and open source, and I've used it for years to run VMs on my main machines. Sadly, that had even more issues with the tuner, to the extent where Tvheadend couldn't see it at all. After installing Ubuntu server many tomes, I finally thought to try KVM/Qemu, which is again open source and free. I tried this on a spare Ubuntu install on my laptop, and it worked! I was finally able to watch terrible TV again, but now in HD!

Now that I had the core virtualisation system sorted, I still needed some nice management system. While there was a package for Ubuntu to manage KVM, I normally run Windows, and also wanted to avoid native clients. Let me introduce the solution to all of these problems - Proxmox. It's a full bare-metal hypervisor with a fairly nice Web UI (built upon the same framework as Tvheadend), has a great auth system that'll use various external services (LDAP with AD works well), and supports both full virtualisation with KVM as well as spinning up Linux containers with LXC.

USB passthrough works fine, and I now have Tvheadend sitting in a Linux VM, recording from a USB tuner to a file share hosted in a Windows VM on the same machine, with no issues! I'm also able to create and start linux containers super quickly (< 1 min), which is great for development use.

Quick update (September 2017): I've since moved TVH to an LXC container, using a mountpoint to directly pass through the /dev/dvb device through to the container. After adding some extra LXC cgroups options, this works excellently.
