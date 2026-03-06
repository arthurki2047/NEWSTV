
# NewsTV - KaiOS Deployment Guide

This app is designed as a Next.js simulation of a KaiOS feature phone app. To deploy this to a physical KaiOS device, follow these steps:

## Requirements
- KaiOS Simulator or a real device (Nokia 8110, 2720 Flip, etc.)
- Firefox 48-59 (needed for WebIDE) or Capyloon.

## Conversion Steps
1. **Build the Project**: Run `npm run build` to generate the static files.
2. **Export Static**: Ensure Next.js is configured for static export (`output: 'export'`).
3. **Manifest**: Create a `manifest.webapp` file in the root of your static export folder:
   ```json
   {
     "name": "NewsTV",
     "description": "Live News TV for Keypad Phones",
     "launch_path": "/index.html",
     "icons": {
       "56": "/icons/icon56.png",
       "112": "/icons/icon112.png"
     },
     "developer": {
       "name": "Your Name",
       "url": "http://yourdomain.com"
     },
     "type": "privileged",
     "permissions": {
       "systemXHR": {
         "description": "Required to load remote streams"
       }
     }
   }
   ```
4. **YouTube API**: Ensure the device's Browser engine allows `youtube.com` embeds.
5. **Install**: Use the KaiOS WebIDE to load the packaged folder onto the device.

## Key Controls Mapping
- **Arrow Keys**: Navigate lists and categories.
- **Enter / SoftCenter**: Open channel / Toggle fullscreen.
- **Backspace**: Return to list.
