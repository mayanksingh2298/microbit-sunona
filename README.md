# Microbit Sunona App

This is a simple app that allows two users to connect their microbits over WebRTC and send messages to each other remotely.

## How to use

1. Flash the code `microbit-code/microbit-sunona.hex` to both microbits. Simple drag and drop works.

2. Start the signalling server by running `npm install` and then `node server.js` in the terminal.

3. Start the react app by running `npm install` and then `npm start` in the terminal. (Inside the `react-app` directory)

## Deployment instructions
TODO

## How to make changes
1. Use MakeCode to make changes to the microbit code.
2. Add more messages to send in `react-app/src/App.js`