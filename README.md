# Microbit Sunona App

This is a simple app that allows two users to connect their microbits over WebRTC and send messages to each other remotely.

## How to use

1. Flash the code `microbit-code/microbit-sunona.hex` to both microbits. Simple drag and drop works.

2. Start the signalling server by running `npm install` and then `node server.js` in the terminal.

3. Start the react app by running `npm install` and then `npm start` in the terminal. (Inside the `react-app` directory)

## Deployment instructions
1. get an VM.
2. Update your namecheap domain to point to the new VM's IP address.
3. Get the ssl certificate.
3. update the nginx config with something like this.
```
server {
    listen 80;
    server_name microbit.rcher.me;
    proxy_buffering off;
    location /ws {
        proxy_pass http://localhost:4000;  # Replace with the address of your WebSocket server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
    location / {
        proxy_pass http://localhost:3000;  # Replace with the address of your Go server
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
        # listen 443 ssl;
    listen 443 ssl http2;
    server_name microbit.rcher.me;
    proxy_buffering off;

    ssl_certificate /etc/letsencrypt/live/microbit.rcher.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/microbit.rcher.me/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location /ws {
        proxy_pass http://localhost:4000;  # Replace with the address of your WebSocket server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://localhost:3000;  # Replace with the address of your Go server
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
4. Update the ip of the VM in the `react-app/src/SignalingServer.js` file.

## How to make changes
1. Use MakeCode to make changes to the microbit code.
2. Add more messages to send in `react-app/src/App.js`