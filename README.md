# 2021 NAEP Tutorial and Tutorial-on-the-web Development

Repository for developing the 2021 NAEP tutorials for Social Studies, Reading, and Mathematics. 
----

# Overview

NAEP digitally based assessments (DBA) include tutorials for partipating students to introduce the assessment 
user interface (UI), item format, navigation, and digital tools NAEP provides. The tutorials are specific for
each year, subject, and grade. These tutorials will be later integrated with the NAEP DBA platform as part of 
the student experience.

The tutorials are also available on the web (Tutorial-on-the-web, or TOTW) for the public to review and be 
familiarized with NAEP. This requires minor updates. 

# Dev setup
To work on the site, start a local web server in the root of this project. The easiest way to do this is to install node.js and then run the following:

```bash
cd /path/to/project
npx http-server
```

The site will now be available at `http://localhost:8080`.

# Bookmaps
The bookmap order is configured in the `web/app/en/bookmaps.js` file. For debugging or demonstration purposes, this configuration can be overridden by url paramaters. Just add the modules as comma separated values:

[https://naepdev.github.io/2021-tutorial-on-the-web/app/en/main.html?subject=Reading8&**bookmap=Outro,Placeholder**](https://naepdev.github.io/2021-tutorial-on-the-web/app/en/main.html?subject=Reading8&bookmap=Outro,Placeholde)

# Sound autoplay
Chrome will disable the autoplay of audio unless the user has interacted with the page. If the tutorial has been started from the home page then there will be no issues. 

However, if you go directly to a module via a url then the audio will not autoplay. The current workaround for this is to allow autoplay in the site settings for Chrome. In the address bar click on the information icon and then change the sound setting to "allow".


----
# Video recording of tutorial modules

The tutorial modules do not have the ability to be paused; there's not a timer either, which make it difficult
for review and comments. An alternative is to provide video recordings of the modules, which allows the reviewer
to pause and rewind. We can further annotate the videos utilizing subtitle functions to document issues and 
places for improvement.

We strongly recommend using the Open Source VLC video player (https://www.videolan.org/vlc/index.html) for replay. 

## Using RecordRTC for recording

One way to record the session is to use RecordRTC (https://recordrtc.org/) as a [Chrome Extension](https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp
). You can then start recording the session, 
going through the happy path where we have no user interaction and let the system go through the default actions. 
RecordRTC will offer the option to save the video locally, typically in a `mp4` format with `webm` codec. 

## Using FFMPEG to transcode/resize video

The resulting mp4 video may have issues when you try to fast forward, rewind, or to move to a particular timestamp, depending
on the video player you use (hopefully [VLC](https://www.videolan.org/vlc/index.html)). In addition, you may wish to resize
the video to shrink its size.

To that end, 

- install [FFMPEG](https://www.ffmpeg.org/) on your OS; let's say your RecordRTC output is `input.mp4`
- in commandline, `ffmpeg -i input.mp4 -filter:v scale=720:-1 -c:a copy output.mp4`
- you will get a `output.mp4` with the video width scaled to 720pixels and codec fixed so that you can rewind.

TODOs:
- [ ] automate this process using a CI/CD pipeline or Github action. 

## Adding SubRip subtitles for annotation

To annotate the video for issues and improvements, we can create a subtitle file for the video so that timestamped 
annotations can show up on the video. VLC supports many formats (see https://www.vlchelp.com/load-external-subtitle/). 
The `SubRip` format (https://wiki.videolan.org/SubRip/) is easy. 

- create a text file named `output.srt` (note the extension; it's not .txt) and open in a plain text editor
- create annotations following the examples from the above link
- save, and make sure the `output.srt` file is in the same folder as `output.mp4`; in general, same file names as the video. 
- open/play the video `output.mp4`, and you should see the subtitles at the designated times. 

For sharing, make sure the two files are shared together. 
