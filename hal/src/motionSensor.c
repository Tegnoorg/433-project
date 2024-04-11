#include "hardwareCommands.h"
#include <pthread.h>
#include <stdbool.h>
#include <stdlib.h>

static bool stop = false;
static bool lastMotionDetected = false;
static bool motionDetected = false;
static pthread_t pid;
static void* motionThread(void* args);

void MotionSensor_init()
{
    runCommand("config-pin p9.23 gpio");
    writeToFile("/sys/class/gpio/gpio49/direction", "in");
    stop = false;
    pthread_create(&pid, NULL, &motionThread, NULL);    
}

void MotionSensor_cleanup()
{
    stop = true;
    pthread_join(pid, NULL);
}

bool isMotionDetected(void)
{
    return motionDetected;
}

static void* motionThread(void* args){
    (void)args;
    
    while(!stop) {
        motionDetected = readIntFromFile("/sys/class/gpio/gpio49/value");
        if (motionDetected != lastMotionDetected) {
            //send val to db
            lastMotionDetected = motionDetected;
        }
        sleepForMs(2000);
    }

    return NULL;
}

