#include "hardwareCommands.h"
#include <pthread.h>
#include <stdbool.h>
#include <stdlib.h>

static bool stop = false;
static bool motionDetected = false;

void MotionSensor_init()
{
    runCommand("config-pin p9.15 gpio");
    writeToFile("/sys/class/gpio/gpio48/direction", "in");
    stop = false;
    // pthread_create();    
}

void MotionSensor_cleanup()
{
    stop = true;
    // pthread_join();
}

bool isMotionDetected(void)
{
    return motionDetected;
}

static void* motionThread(void* args){
    (void)args;
    
    while(!stop) {
        motionDetected = readIntFromFile("/sys/class/gpio/gpio48/value");
        sleepForMs(2000);
    }

    return NULL;
}

