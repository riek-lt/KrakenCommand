//pkg index.js --output livesquid
const LiveSplitClient = require('livesplit-client');
const request = require('request');

var greenBody = "{'seg': [{'fx': 0, 'col': [[8, 255, 0]]}]}";


(async () => {
    try {
        // Initialize client with LiveSplit Server's IP:PORT
        const client = new LiveSplitClient('127.0.0.1:16834');

        // Connected event
        client.on('connected', () => {
            console.log('Connected!');
        });

        // Disconnected event
        client.on('disconnected', () => {
            console.log('Disconnected!');
        });

        // Error event
        client.on('error', (err) => {
            console.log(err);
        });

        // Some async sleep sugar for this example
        const sleep = (time) => {
            return new Promise((r) => {
                setTimeout(() => r(), time);
            });
        };

        // Connect to the server, Promise will be resolved when the connection will be succesfully established
        await client.connect();
		
		let previousSplitName = '';

        // Function to check split name every 2000ms
        setInterval(async () => {
            try {
                // Get current split name
                const currentSplitName = await client.getCurrentSplitName();

                // Check if split name has changed
                if (currentSplitName !== previousSplitName) {
                    // Display split name and delta
                    const delta = await client.getDelta();
                    console.log(`Split Name: ${currentSplitName}, Delta: ${delta}`);
                    // Update previous split name
                    previousSplitName = currentSplitName;
        const info = await client.getAll();
        console.log('Summary:', info);
				sendPost(greenBody);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }, 2000);
		
		await client.getDelta();


    } catch (err) {
        console.error(err); // Something went wrong
    }
})();

function sendPost(input) {
    request.post({
        url: "http://192.168.2.31/json/state",
        headers: {
            'Content-Type': 'application/json',
            'Accept': "application/json"
        },
		body: input
    }, (error, response, body) => {
        if (error) {
            console.error('Error:', error);
        } else if (response.statusCode !== 200) {
            console.error('Error:', body);
        } else {
            // Do something with the successful response if needed
        }
    });
}
