# Teleprompter App

A modern teleprompter application built using **TypeScript** and **Tailwind CSS**, designed for creating professional-quality teleprompter recordings. The app is fully mobile-friendly, features a dark theme, and is optimized for deployment on **Netlify** via GitHub.

## Features

1. **Teleprompter Text Area**: Editable area for writing or modifying scrolling text.
2. **Customizable Scrolling**:
   - Range slider to adjust font size.
   - Range slider to control text scroll speed.
3. **Scroll Preview**: Preview scrolling text from the beginning to test settings.
4. **Teleprompter Text Input Fields**: Allows adding, editing, and formatting text for readability.
5. **Recording Options**:
   - Choose to record **Camera Only** or **Screen Only**.
   - Select specific camera and microphone devices.
   - Choose video aspect ratio: **9:16 (Portrait)** or **16:9 (Landscape)**.
   - Preview selected camera or screen before recording.
6. **Recording Controls**:
   - **Start Recording**: Begins recording and scrolling text.
   - **Pause/Resume Recording**: Pauses or resumes recording and text scrolling.
   - **Stop Recording**: Ends recording and provides video preview.
7. **Video Preview**: View and download the recorded video in **WebM** format at **30 FPS**.
8. **Responsive Design**: Optimized for desktop, tablet, and mobile devices.
9. **Dark Theme**: Professional modern UI with a maximum width of 900px.

## Technology Stack

- **TypeScript**: For type-safe application logic.
- **React**: For building interactive UI components.
- **Tailwind CSS**: For responsive and modern UI design.
- **Vite**: For fast development and build processes.
- **Netlify**: For seamless hosting and deployment.
- **MediaRecorder API**: For recording video and audio.

## Setup and Deployment

This app is ready to deploy on **Netlify** directly from GitHub.

### Steps to Deploy:

1. **Fork or Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/teleprompter-app.git
   cd teleprompter-app
