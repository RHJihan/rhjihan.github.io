---
title: Setting Up LUKS with TPM2 Auto-Unlock on Debian
tags: [Linux, Debian, LUKS, TPM]
style: border
color: primary
comments: true
description: A step by step guide to setting up LUKS full disk encryption with automatic TPM2 unlocking on Debian, from checking hardware support through the final reboot. Covers the exact configuration for dracut, GRUB, and crypttab, with a full troubleshooting reference for when things go wrong.
---

If you run full disk encryption on a machine that stays on your desk, gets rebooted for updates while you're not around, or needs to survive a Wake on LAN without you standing there typing a passphrase, retyping your LUKS password at every boot gets old fast. A TPM chip can hold that key for you and unlock the disk automatically, as long as the machine boots into the state it expects.

This guide walks through the full setup on Debian, from checking your hardware to the final reboot, and then spends just as much time on the part most guides skip: what to do when it stops working after a routine update, because at some point it will.

## Why bother with TPM auto unlock

A normal LUKS setup asks for your passphrase every single boot, before the system even reaches a login screen. That's fine for a laptop you carry around and unlock by hand anyway. It's a lot less fine for a desktop tucked under your monitor, a home server, or anything you plan to wake up remotely and expect to just come back online.

Sealing the LUKS key to your TPM chip solves that. The key only gets released if the machine's boot measurements (firmware, bootloader, Secure Boot state) match what they were when you enrolled it. You get automatic unlock on every normal boot, and if someone tampers with your firmware or bootloader, the TPM refuses to hand over the key and you fall back to typing your password.

That protection comes with a small tax: legitimate updates to your firmware or bootloader change those same measurements, and your TPM will refuse to unlock too, exactly as designed. The second half of this guide covers that in detail, since it's the part that actually causes support questions.

## What you need before starting

- A TPM 2.0 chip. Most machines built in the last several years have one, either a discrete chip or a firmware based one (Intel PTT or AMD fTPM, both work fine).
- UEFI boot mode, not legacy BIOS.
- Debian already installed with LUKS full disk encryption set up through the installer, either the guided encrypted LVM option or a manual partition layout.
- Secure Boot can be on or off. This guide assumes it's on, since that's the more common and more secure setup, and it's the one that actually needs the troubleshooting section later.

## Step 1: Confirm your TPM is visible to the system

Boot into your installed system (or a live environment if you're checking before install) and run:

```bash
systemd-cryptenroll --tpm2-device=list
```

You should see something like:

```
PATH        DEVICE      DRIVER
/dev/tpmrm0 MSFT0101:00 tpm_crb
```

If nothing shows up but you know your hardware has a TPM, go into your BIOS or UEFI settings and make sure it's enabled. On Intel systems look for "PTT" or "Intel Platform Trust Technology," on AMD systems look for "fTPM" or "AMD PSP fTPM." A reboot after flipping that setting is usually enough for it to show up.

## Step 2: A quick look at partitioning

Before enrolling anything, it helps to know what your disk layout actually looks like. Run:

```bash
lsblk -o NAME,SIZE,TYPE,MOUNTPOINTS
```

There are two common Debian layouts people end up with. The guided "encrypted LVM" installer option gives you one LUKS container holding an LVM volume group, split into root and home logical volumes:


```
NAME                                            SIZE TYPE  MOUNTPOINTS
sda                                           931.5G disk  
└─sda1                                        931.5G part  
  └─luks-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx 931.5G crypt /media/jihan/Data
sr0                                            1024M rom   
nvme0n1                                       232.9G disk  
├─nvme0n1p1                                     487M part  /boot/efi
├─nvme0n1p2                                     977M part  /boot
└─nvme0n1p3                                   231.5G part  
  └─luks-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx 231.4G crypt 
    ├─jihan--pc--vg-root                       95.4G lvm   /
    └─jihan--pc--vg-home                      136.1G lvm   /home
```

A manual partition layout usually looks simpler, one encrypted partition holding a single filesystem directly:

```
nvme0n1
├─nvme0n1p1     1G   part  /boot/efi
├─nvme0n1p2     1G   part  /boot
└─nvme0n1p3     1T   part
  └─luks-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  crypt  /
```

Either works fine for everything below. What matters is knowing the block device that holds the actual LUKS header, in these examples `/dev/nvme0n1p3`.

## Step 3: Enroll the TPM2 key

With your system mounted and running normally, enroll a TPM2 key slot on the encrypted partition:

```bash
sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+7 /dev/nvme0n1p3
```

It will ask for your existing LUKS passphrase to authorize adding the new key slot. Your original password slot is not touched or removed, it stays there as a fallback, and you should never delete it.

The `--tpm2-pcrs=0+7` part is what ties the key to your boot state. PCR 0 covers the core firmware code, PCR 7 covers the Secure Boot state (which keys and certificates validated your boot chain). Together they mean the disk only auto-unlocks if your firmware and Secure Boot state haven't changed since enrollment.

A small tip worth doing here: if you have more than one drive, consider pointing this at a stable path instead of `/dev/sda1` or similar, since those names can shift around if drive order changes. Find the UUID with `blkid`, then use `/dev/disk/by-uuid/<uuid>` in the command above instead of the raw device name.

If you have a second encrypted disk, repeat this same command against it.

## Step 4: Install the tools that make the initramfs TPM aware

```bash
sudo apt install dracut tpm2-tools
```

`tpm2-tools` gives you the userspace utilities for talking to the TPM. `dracut` rebuilds your initramfs with the modules needed to unseal a TPM2 key that early in the boot process, something Debian's default `initramfs-tools` doesn't handle the same way.

## Step 5: Tell dracut what to include

Create `/etc/dracut.conf.d/99-crypt-tpm.conf`:

```
add_dracutmodules+=" crypt systemd tpm2-tss "
install_items+=" /etc/crypttab /etc/fstab /lib/systemd/system-generators/systemd-cryptsetup-generator /lib/systemd/systemd-cryptsetup "
hostonly="no"
```

This bakes the crypt, systemd, and tpm2-tss dracut modules into the initramfs, along with the binaries and config files they need to find the TPM and unseal the key before your root filesystem is mounted.

## Step 6: Update the kernel command line

Edit `/etc/default/grub` and add to `GRUB_CMDLINE_LINUX`:

```
GRUB_CMDLINE_LINUX="rd.auto rd.luks=1"
```

This tells dracut's early boot code to automatically detect and unlock LUKS devices instead of waiting for a passphrase prompt.

## Step 7: Turn off the old crypttab prompt

Debian's installer sets up `/etc/crypttab` to ask for your passphrase at every boot. Now that TPM is handling that, comment out the line for the device you just enrolled:

```
# nvme0n1p3_crypt UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx none luks,discard
```

If you have more than one encrypted disk, only comment out the lines for the disks you actually enrolled with TPM. Leave any others alone, otherwise you may end up getting prompted for a password anyway during boot, just for the wrong reason.

## Step 8: Rebuild and reboot

```bash
sudo dracut -f
sudo update-grub
sudo reboot
```

If everything is in order, you'll boot straight past the passphrase prompt and land on your login screen with no manual typing.

## Troubleshooting

This is the part most guides leave out, and it's the part you'll actually come back to read again someday.

### "It worked for months, then suddenly asked for the passphrase again, on every disk at once"

This is by far the most common issue, and it's not actually a bug.

What's happening: a system update touched something in your boot chain, most often `shim-signed`, `shim-unsigned`, `grub-efi-amd64-signed`, or a firmware update pushed through `fwupd`. Any of these can shift the values measured into PCR 0 or PCR 7. Since your TPM key is sealed against the old values, it correctly refuses to release the key. It's doing exactly what PCR binding is supposed to do, detecting that your boot chain changed. If you have multiple disks enrolled with the same PCR policy, they'll all fail together, since they're all checking the same boot state.

To confirm this is what happened, first check that the enrollment itself is still intact:

```bash
sudo systemd-cryptenroll --tpm2-device=list
sudo systemd-cryptenroll /dev/nvme0n1p3
```

If you still see both a `password` and a `tpm2` slot listed, the enrollment is fine, this is a stale PCR policy, not a broken setup.

Then check the boot log for the actual failure:

```bash
sudo journalctl -b | grep -iE "tpm|luks|crypt|pcr"
```

Look for a line like:

```
Failed to unseal secret using TPM2: Operation not permitted
```

That confirms it. You can also check what got updated recently to see the likely trigger:

```bash
grep -iE "upgrade|install" /var/log/apt/history.log | tail -60
```

Look for `shim-signed`, `shim-unsigned`, `grub-efi`, or `fwupd` in that list. Those are the usual suspects.

### The fix: re-enroll the TPM key

For each affected disk, wipe the stale `tpm2` slot and create a fresh one against your current boot state:

```bash
sudo systemd-cryptenroll --wipe-slot=tpm2 /dev/nvme0n1p3
sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+7 /dev/nvme0n1p3
```

If you have a second disk, repeat both commands against it too:

```bash
sudo systemd-cryptenroll --wipe-slot=tpm2 /dev/sda1
sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+7 /dev/sda1
```

Confirm the slot came back:

```bash
sudo systemd-cryptenroll /dev/nvme0n1p3
```

Reboot to test. You should be back to normal, no passphrase prompt.

One thing worth knowing: you do not need to run `dracut -f` or `update-grub` again just for this fix. The TPM policy lives inside the LUKS2 header itself, not in the initramfs. The only time you need to rebuild the initramfs is the very first setup, step 8 above. Running it again after a re-enroll doesn't hurt anything, but it's not solving the problem either.

### "Encountered unknown /etc/crypttab option '-', ignoring" in the logs

This one looks alarming but is harmless. It doesn't come from the real `/etc/crypttab` file you commented out, it comes from a synthetic crypttab entry that dracut generates internally while parsing the `rd.luks=1` kernel parameter during early boot. It's a cosmetic quirk, not a cause of anything. You can safely ignore it.

### TPM shows up in a live environment but not after installing

Boot into a Debian live USB and run the same check:

```bash
systemd-cryptenroll --tpm2-device=list
dmesg | grep -i tpm
```

Make sure Secure Boot and the TPM are both still enabled in your BIOS (some firmware updates or BIOS resets can quietly flip these back to defaults). Also confirm `/dev/tpmrm0` exists, that's the resource manager device `systemd-cryptenroll` actually talks to, not `/dev/tpm0` directly.

### dracut vs initramfs-tools stepping on each other

Debian ships `initramfs-tools` by default. Installing `dracut` should make it the tool actually building your initramfs going forward. Check which one is installed and confirm dracut actually built your current initramfs:

```bash
dpkg -l | grep -E "dracut|initramfs-tools"
lsinitramfs /boot/initrd.img-$(uname -r) | grep -i tpm2
```

If that last command comes back empty, your initramfs doesn't have the TPM2 support baked in, which means it was rebuilt by the wrong tool at some point, usually after a kernel update. Run `sudo dracut -f` to force a rebuild with the correct modules and reboot to confirm it worked.

### The real passphrase isn't being accepted at all

Don't wipe any key slots yet. First rule out something simple, Caps Lock, or a keyboard layout mismatch on the Plymouth boot screen (it sometimes defaults to a US layout even if your desktop uses something else).

If you're genuinely locked out, boot from Debian live media, unlock the drive manually to confirm your password still works, and back up anything important before troubleshooting the TPM side further:

```bash
sudo cryptsetup luksOpen /dev/nvme0n1p3 recovery
```

This is exactly why you never remove your original password key slot. It's your way back in if TPM enrollment ever goes sideways.

### Only some of your disks are asking for a password

This is expected if you've only run the enrollment steps on some of your disks, or if you left the `/etc/crypttab` entry uncommented for one of them. Go back to Step 7 and make sure every disk you want auto-unlocked has both a TPM2 enrollment and a commented out crypttab line.

## Keeping it from breaking again

Since routine Secure Boot and firmware updates are the whole cause of the "sudden passphrase prompt" problem, it's worth deciding how you want to handle that going forward. There are a few options, roughly in order of least to most effort.

**Drop PCR binding entirely.** Enroll without the `--tpm2-pcrs` flag, so the key only checks that it's talking to the same TPM chip, not the boot state. This never breaks on updates, but you lose the tamper detection that PCR 7 gives you. For a stationary home desktop this is a reasonable trade, just know what you're giving up.

**Automate the re-enroll.** Keep the PCR binding, and add a hook to your update process (an APT hook, or a step in whatever update script you use) that watches for `shim`, `grub`, `fwupd`, or kernel package updates, warns you, and offers to re-enroll before you reboot. This keeps the real security property while removing the annoyance, at the cost of a bit of scripting up front.

**Move to systemd-pcrlock.** This is the newer, more resilient replacement for raw PCR pinning, and it's what `--tpm2-pcrs` was really meant to evolve into. It builds a policy from your actual measured boot log rather than raw PCR values, and it's designed to be re-approved automatically after trusted updates. The catch is it's built around Unified Kernel Images and systemd-boot, not the classic GRUB plus separate initramfs setup Debian ships by default, so getting it fully automatic on a GRUB system takes real extra setup work.

For most people running a stock Debian install with GRUB, the middle option is the sweet spot.

## Quick reference

A cheat sheet for the commands you'll actually reach for:

```bash
# Is a TPM visible at all
systemd-cryptenroll --tpm2-device=list

# What key slots exist on a device
sudo systemd-cryptenroll /dev/nvme0n1p3

# Enroll a TPM2 key bound to firmware + Secure Boot state
sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+7 /dev/nvme0n1p3

# Remove a stale TPM2 slot before re-enrolling
sudo systemd-cryptenroll --wipe-slot=tpm2 /dev/nvme0n1p3

# Check current PCR 0 and 7 values
sudo tpm2_pcrread sha256:0,7

# Check what's causing an unlock failure
sudo journalctl -b | grep -iE "tpm|luks|crypt|pcr"

# Check recent updates for the usual suspects
grep -iE "upgrade|install" /var/log/apt/history.log | tail -60

# Rebuild the initramfs (only needed on first setup, or after a dracut config change)
sudo dracut -f
sudo update-grub
```

## Closing thoughts

TPM auto unlock on Debian is genuinely low maintenance once it's set up, and it removes a real annoyance for any machine that isn't sitting on your lap. The one thing worth internalizing going in is that a sudden password prompt after an update isn't your system breaking, it's your TPM doing exactly its job and noticing your boot chain changed. Once you know that, the fix is two commands per disk and you're back to normal in under a minute.

## Further reading

The original walkthrough that got me started on this setup is worth a look too: [Debian with LUKS and TPM auto decryption](https://blog.fernvenue.com/archives/debian-with-luks-and-tpm-auto-decryption/) on fernvenue.
