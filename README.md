## Technologies Used

- React Native
- Expo
- Expo Camera
- Expo Media Library
- @react-native-community/slider

## Setup and Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/khaoulasdevtutos/CameraApp.git
    cd CameraApp
    ```

2. **Install dependencies:**

    Make sure you have `npx` installed. Then, install the project dependencies:

    ```sh
    npx expo install
    ```

3. **Run the app:**

    Start the Expo development server:

    ```sh
    npx expo start
    ```

    You can then open the app in an emulator or on a physical device using the Expo Go app.

## Usage

1. **Grant Permissions:**
    - When the app first loads, it will request camera and media library permissions. Grant the necessary permissions to proceed.

2. **Capture a Photo:**
    - Use the camera view to capture a photo by pressing the capture button.

3. **Save a Photo:**
    - After capturing a photo, you can save it to the device's media library.

4. **View Last Saved Photo:**
    - The last saved photo will be displayed, and you can view it by pressing the preview button.

## Notes

- Ensure you have a physical device or a simulator with camera functionality to test the application.
- This project demonstrates the integration of camera functionality in a React Native app using Expo.
