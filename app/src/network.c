// Use: netcat -u 192.168.7.2 12345
// to test on host

#define MAX_LEN 1500
#define PORT 12345

#include "network.h"
#include <pthread.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <netdb.h>
#include <unistd.h>
#include "../../hal/include/lightSensor.h"
#include "../../hal/include/forceSensor.h"
#include "../../hal/include/motionSensor.h"
#include "../../hal/include/icm20948.h"

static pthread_t networkThreadId;
static bool stopping = false; 

static void* rx(void* args);

static void sendResponse(struct sockaddr_in sinRemote, int socketDescriptor,
                        char* messageRx);

void Network_init(void)
{
    pthread_create(&networkThreadId, NULL, &rx, NULL);
}

void Network_cleanup(void)
{
    stopping = true;
    pthread_join(networkThreadId, NULL);
}

static void* rx(void* args)
{
    (void)args;

    // Address
	struct sockaddr_in sin;
	memset(&sin, 0, sizeof(sin));
	sin.sin_family = AF_INET;                   // Connection may be from network
	sin.sin_addr.s_addr = htonl(INADDR_ANY);    // Host to Network long
	sin.sin_port = htons(PORT);                 // Host to Network short

    // Create the socket for UDP
    int socketDescriptor = socket(PF_INET, SOCK_DGRAM, 0);

    // Bind the socket to the port (PORT) that we specify
    bind(socketDescriptor, (struct sockaddr*) &sin, sizeof(sin));

    while (!stopping) {
        // Get the data (blocking)
        // Will change sin (the address) to be the address of the client.
        // Note: sin passes information in and out of call!
        struct sockaddr_in sinRemote;
        unsigned int sin_len = sizeof(sinRemote);
        char messageRx[MAX_LEN];

        // Pass buffer size - 1 for max # bytes so room for the null (string data)
        int bytesRx = recvfrom(socketDescriptor,
                messageRx, MAX_LEN - 1, 0, 
                (struct sockaddr *) &sinRemote, &sin_len);

        // Make it null terminated (so string functions work)
        // - recvfrom given max size - 1, so there is always room for the null
        messageRx[bytesRx] = 0;

        // Extract the value from the message:
        // (process the message any way your app requires).

        sendResponse(sinRemote, socketDescriptor, messageRx);

    }
    
    // Close
    close(socketDescriptor);

    return NULL;
}

static void sendResponse(struct sockaddr_in sinRemote, int socketDescriptor,
                        char* messageRx)
{
        // Compose the reply message:
        // (NOTE: watch for buffer overflows!).
        char messageTx[MAX_LEN];
        

        if (strncmp(messageRx, "stop", strnlen("stop", MAX_LEN)) == 0) {
            snprintf(messageTx, MAX_LEN, "Program terminating.\n");
        } 
        else if (strncmp(messageRx, "motion", strnlen("motion", MAX_LEN)) == 0) {
            snprintf(messageTx, MAX_LEN, "%d", isMotionDetected());
        } else if (strncmp(messageRx, "force", strnlen("force", MAX_LEN)) == 0) {
            snprintf(messageTx, MAX_LEN, "%d", hasForce());
        } else if (strncmp(messageRx, "light", strnlen("light", MAX_LEN)) == 0) {
            snprintf(messageTx, MAX_LEN, "%d", isLightOn());
 
        } else if (strncmp(messageRx, "distance2", strnlen("distance2", MAX_LEN)) == 0) {
            snprintf(messageTx, MAX_LEN, "%.2fm", totalDistance(2));
        } else if (strncmp(messageRx, "distance3", strnlen("distance3", MAX_LEN)) == 0) {
            snprintf(messageTx, MAX_LEN, "%.2fm", totalDistance(3));
        } else {
            snprintf(messageTx, MAX_LEN, "Unknown command.\n");
        }

        // Transmit a reply:
        unsigned int sin_len = sizeof(sinRemote);
        sendto( socketDescriptor, 
                messageTx, strnlen(messageTx, MAX_LEN), 
                0, 
                (struct sockaddr*) &sinRemote, sin_len);
}
