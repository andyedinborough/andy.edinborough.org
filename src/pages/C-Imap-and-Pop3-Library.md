---
title: C# IMAP and POP3 Library
layout: ../components/Layout.astro
created: "2010-6-23"
description: "Sigh.  These are text-based services… it’s not that hard, and yet all the projects I found out there were nasty—bloated and severely error prone.  So, I rebuilt one.  This is based heavily on xemail-net.  I simplified it quite a bit—created standard methods, methods …"
---

Sigh.

These are text-based services… it’s not that hard, and yet all the projects I found out there were nasty—bloated and severely error prone. So, I rebuilt one. This is based heavily on <a href="http://sourceforge.net/projects/xemail-net/" rel="external noopener" target="_blank">xemail-net</a>. I simplified it quite a bit—created standard methods for repeated code blocks and implemented a base class to simplify the creation of the Pop3 client.

http://github.com/andyedinborough/aenetmail
