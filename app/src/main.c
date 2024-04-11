#include "../../hal/include/icm20948.h"
#include "../../hal/include/motionSensor.h"
#include "network.h"
#include <stdio.h>

int main(void)
{
    // ICM20948_init();
    MotionSensor_init();
    Network_init();

    // Shutdown_waitForShutdown();
    // resetDistance();
    // resetTimePassed();
    while (1) {
        // getDistance();
    };
    // double time = returnTimePassed();
    // double distance = returnDistance();
    // double totalDistance = distance*time;
    // printf("%f", totalDistance);
    // Shutdown_cleanup();
    // Accelerometer_cleanup();
    // beatPattern_cleanup();
    // AudioMixer_cleanup();
    // Joystick_cleanup();
    Network_cleanup();
    ICM20948_cleanup();

    return 0;
}