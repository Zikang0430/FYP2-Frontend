# Camera and Media Library App

This is a Camera application built with React Native, Expo Camera, and Media Library. The app allows users to capture and save photos to their device.

# Author : Khaoula's DEV Tutos
# Date : 22 July 2024

# Description :

## Features

- Capture photos using the device camera
- Save photos to the device's media library
- View the last saved photo
- Zoom in and out
- Toggle flash and torch
- Switch between front and back cameras
- Animated shutter effect

## Technologies Used

- React Native
- Expo
- Expo Camera
- Expo Media Library
- @react-native-community/slider

## Components and Hooks

- `CameraView`: This component from Expo Camera is used to display the camera view.
- `useCameraPermissions`: This hook is used to request and check camera permissions.
- `usePermissions` from Expo Media Library: This hook is used to request and check media library permissions.
- `Button`: Custom button component to handle various camera actions.

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
