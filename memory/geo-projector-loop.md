# Geo — Hisense PX3-PRO Video Loop Kiosk Project

**Owner:** George "Geo" Watts (+13038879556)
**Started:** 2026-09-11

## Hardware / Software
- **Projector:** Hisense PX3NU / L253919 (PX3-PRO) ultra short throw laser
- **Mfg date:** Jan 9, 2026
- **OS:** Android TV / Google TV
- **Storage:** USB-C drive + SanDisk Ultra 128GB microSDXC (Class 1 / A1)
- **Content:** folder of numerically-named .mp4 files
- **Player:** VLC for Android v3.7.1
- **Autostart helper:** AutoStart Manager app

## Goal
Boot projector → brief pause for USB/SD mount → VLC launches automatically →
immediately begins seamless continuous loop of the mp4 folder. No remote input.

## Status
- Geo has tried for ~1 week with existing instructions; not working
- 2026-09-11: First consult. Diagnosis questions sent, full procedure provided.
- 2026-09-11 EOD: **ROOT CAUSE CONFIRMED** — AutoStart Manager launches the APP
  only, not a FILE. VLC opens to its idle home screen. Not a timing problem.

## Confirmed facts (2026-09-11)
- Content is now ONE combined file, .mov, **3.71 GB** (just under FAT32 4GB cap)
- microSD = FAT32; connected via **Belkin USB-C multiport dock**
- Projector internal storage free: **16 GB** (file would fit — backup plan)
- Geo electing to stay on external SD for now
- Boot timeline: 18s Hisense splash / 45s Google Home / 51s USB verifying
- AutoStart Manager **Launch Delay capped at 10 sec**
- TEST: YouTube autostarted fine => AutoStart Manager IS working, NOT blocked
- VLC now autostarts, opens to **home screen idle** (answer A)
- Manual playback of the .mov loops correctly => VLC config is CORRECT

## ROOT CAUSE
AutoStart Manager can only launch an app. It cannot pass a file path / play
intent. VLC launches with no media argument -> idle browse screen. Swapping to
a different autostart manager will NOT fix this.

## Key technical notes / gotchas
- Google TV (newer builds) is MUCH more aggressive about blocking boot-time
  autostart than plain Android TV. BOOT_COMPLETED receivers for 3rd-party
  apps are frequently killed.
- AutoStart Manager needs a **delay** set — mounting USB storage takes
  10-30s after boot. Default 0s delay = VLC opens before media exists.
- VLC must have the loop set as **Repeat All** (not Repeat One) and this
  setting persists per-playlist, not globally, unless set in Settings.
- VLC "resume playback" prompt can block auto-play — must be disabled.
- Screensaver / Ambient mode on Google TV will interrupt long playback.
- Seamless (gapless) loop is NOT guaranteed in VLC — there is a black frame
  between files. True seamless requires either one concatenated file or a
  dedicated signage app.

## Resolved questions
1. VLC autostarts? YES (after permissions/config work)
2. Connection: Belkin USB-C multiport dock w/ microSD
3. Filesystem: FAT32
4. AutoStart Manager delay: capped at 10s (not the blocker after all)

## Recommendations made
- Disable Google TV screensaver + auto-sleep  [DONE]
- VLC Repeat All, disable resume-playback dialog  [DONE]
- Concatenate mp4s into one file for seamless loop  [DONE - 3.71GB .mov]
- 2026-09-11: Recommend switching from AutoStart Manager to a dedicated
  **digital signage / video kiosk looper app** that owns both autostart AND
  file playback in one tool. This is the correct architecture.
- Secondary option: keep AutoStart Manager but pair with an automation app
  (e.g. a task automation tool) that can fire a play intent at the file path.
- Fallback if signage app fails: move file to internal storage to remove the
  mount-timing variable entirely.

## Next step (awaiting Geo)
Geo to try a dedicated signage/looper app. Needs one that: autostarts on boot,
takes a fixed file path, loops indefinitely, no UI chrome.
