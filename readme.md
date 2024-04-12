# HearChat: Accessible and Enhanced ChatGPT

A Chrome extension to make ChatGPT more accessible and friendly for screen reader users.

### Features

1. automatically Adds headings to the ChatGPT assistant name for easier navigation.
- works with all GPTs, along with old, and shared chats.
- Allows the user to set their preferred heading level, or to turn the feature off if they prefer.

2. Sound effects to indicate when ChatGPT starts and stops responding
- Provides 25 sound effects to choose from to make all the notifications unique.

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

This extension is currently at a very early beta level and thus it should not be relied on to work at all times. The underlying code relies heavily on ChatGPT's current HTML structure, so any changes to that structure could break it partially or completely at any time.

### Installation
Install the extension from the Chrome Web Store! [https://chromewebstore.google.com/detail/hearchat-accessible-and-e/jpgbcgnbpcplkbnihjmohdodnpdldacb](https://chromewebstore.google.com/detail/hearchat-accessible-and-e/jpgbcgnbpcplkbnihjmohdodnpdldacb)
See below for basic instructions to install the latest version from this repo.


1. Clone the extension's repo by running the following command in your terminal:
   ```
	git clone https://github.com/AERobert/HearChat.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable 'Developer Mode' by toggling the switch in the top right corner.
4. Click 'Load unpacked' and navigate to the `HearChat` folder you just cloned to your local drive. Select this folder.
5. Access the [ChatGPT web app](https://chat.openai.com/). The extension will activate automatically when you use the web app.

### Usage 

Once installed, the extension will automatically run when visiting chat.openai.com. Headings, labels, sounds, and announcements should be added automatically when navigating and interacting with ChatGPT.

The extension's options page includes some settings to customize the extension's notifications and heading level adding feature. This extension automatically adds a button to open these options at the bottom of every ChatGPT page.

### License

This project is licensed under the MIT license - see the [LICENSE](LICENSE) file for details.

### Credits

Created by [Robert Eggleston](https://github.com/AERobert)

All sound effects taken from [Pixabay’s Sound Effects](https://pixabay.com/sound-effects/).