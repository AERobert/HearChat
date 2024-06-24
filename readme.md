# HearChat: Accessible and Enhanced ChatGPT

A Chrome extension to make AI chatbots more accessible and friendly for screen reader users.

Full support for ChatGPT and parshall support for Claude.ai.

### Features

1. automatically Adds headings to the ChatGPT assistant name for easier navigation.
- works with all GPTs, along with old, and shared chats.
- Allows the user to set their preferred heading level, or to turn the feature off if they prefer.

2. Sound effects to indicate when ChatGPT starts and stops responding
- Provides 25 sound effects to choose from to make all the notifications unique.

- Screen reader announcements when ChatGPT starts/stops
- Ability to change the announcement messages in the options page.

4. Labels most unlabeled buttons in the interface using helpful aria-labels

5. Adds several keyboard shortcuts to make navigating ChatGPT faster.

6. Includes an option to speak each response automatically using OpenAI's speech synthesizer.

7. Includes various other accessibility fixes to the interface.

8. As referenced above, provides an options page to customize the behavior of the extension and its features.

### To do

1. Update all features to work with Claude.ai, and to other chatbots that may be supported in the future.
2. Add more options for sound effects, and ability for users to upload their own.
3. Add ability to speak each response and announcement using the Web Speech API (which would allow much more control compared to OpenAI's synthesizer).
4. Port the extension to other browsers, like Firefox and Safari.
5. Continue fixing labels.
6. The Juce update to ChatGPT broke the headingifying feature, and I still need to fix that.

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

Once installed, the extension will automatically run when visiting [chat.openai.com](https://chat.openai.com/). Headings, labels, sounds, and announcements should be added automatically when navigating and interacting with ChatGPT.

The extension's options page includes some settings to customize the extension's notifications and heading level adding feature. This extension automatically adds a button to open these options at the bottom of every ChatGPT page.

# Legal Disclaimer for Multi-Chatbot Chrome Extension

### Disclaimer and Limitations

**Independence and Non-Affiliation:** The developers of this extension are independent and are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any chatbot providers, including but not limited to OpenAI (ChatGPT), Anthropic (Claude), or any of their subsidiaries or affiliates. This extension is not an official product of any chatbot provider, and no rights to their intellectual property, including trademarks, are claimed or implied.

**Beta Version:** This extension is in beta testing. It is still under development and may have bugs or stability issues. The extension is provided on an "as is" and "as available" basis, and you use it at your own risk.

**Data Handling:** This extension does not collect or transmit any personal data. All interactions are processed locally on your device.

**No Warranty:** This extension is provided without warranty of any kind, either express or implied, including, but not limited to, the implied warranties of merchantability or fitness for a particular purpose.

**Limitation of Liability:** In no event shall the developers be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of this extension.

**User Responsibility:** By using this extension, you agree to use it in compliance with all applicable laws, rules, and regulations. You are solely responsible for any actions you take based on the information provided by this extension and any consequences that may arise from such actions.

**Modification and Termination:** The developers reserve the right, at their sole discretion, to modify, suspend, or terminate the extension at any time, for any reason, without prior notice. The developers may also impose limits on certain features and services or restrict access to parts or all of the extension without notice or liability.

**Dependence on External Changes:** The functionality of this extension depends on the current HTML structure and APIs of the supported chatbot platforms. Changes to these structures or APIs by their respective developers can affect the functionality of this extension, potentially rendering it partially or completely inoperative.

By using this extension, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.

### License

This project is licensed under the MIT license - see the [LICENSE](LICENSE) file for details.

### Credits

Created by [Robert Eggleston](https://github.com/AERobert)

All sound effects taken from [Pixabay’s Sound Effects](https://pixabay.com/sound-effects/).