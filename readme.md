# HearChat: Accessible and Enhanced ChatGPT

A Chrome extension to make ChatGPT more accessible and friendly for screen reader users.

## Features

1. automatically Adds headings to the ChatGPT assistant name for easier navigation.
- works with all GPTs, along with old, and shared chats.
- Allows the user to set their preferred heading level, or to turn the feature off if they prefer.

2. Sound effects to indicate when ChatGPT starts and stops responding
- Provides 15 sound effects to choose from to make all the notifications unique.

- Screen reader announcements when ChatGPT starts/stops
- Ability to change the announcement messages in the options page.

4. Labels most unlabeled buttons in the interface using helpful aria-labels

5. As referenced above, provides an options page to customize the behavior of the extension and its features.

### To do

1. Add option to speak the full text of each response once generated.
2. Generally improve the handling of the options page.
3. Add more options for sound effects, and ability for users to upload their own.
4. Try to improve the accessibility of the GPT Store's search feature.
5. Finish adding labels to all buttons and popups in the interface.

### Disclaimer and limitations

This extension is currently at a very early beta level and thus it should not be relighed on to work at all times. The underlying code relighs heavily on ChatGPT's current HTML structure, so any changes to that structure could break it parshally or completely at any time.

#### Installation

As this extension is not currently published in the Chrome Web Store, it must be loaded manually using Chrome's developer tools:

1. Download or clone the extension's repo.
2. Navigate to `chrome://extensions/` in the Chrome browser.
3. Enable 'Developer Mode'.
4. Click 'Load unpacked' and select the extension folder from your local drive.
5. Access the ChatGPT web app, and the extension will be activated automatically.

### Usage 

Once installed, the extension will automatically run when visiting chat.openai.com. Headings, labels, sounds, and announcements should be added automatically when navigating and interacting with ChatGPT.

The extension's options page includes some settings to customize the extension's notifications and heading level adding feature.

### License

This project is licensed under the MIT license - see the [LICENSE](LICENSE) file for details.

### Credits

Created by [Robert Eggleston](https://github.com/AERobert)
