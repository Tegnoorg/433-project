#include "../../hal/include/icm20948.h"
#include <stdio.h>

int main(void)
{
    ICM20948_init();

    // Shutdown_waitForShutdown();
    resetDistance();
    resetTimePassed();
    while (1) {
        getDistance();
    };
    double time = returnTimePassed();
    double distance = returnDistance();
    double totalDistance = distance*time;
    printf("%f", totalDistance);
    // Network_cleanup();
    // Shutdown_cleanup();
    // Accelerometer_cleanup();
    // beatPattern_cleanup();
    // AudioMixer_cleanup();
    // Joystick_cleanup();
    ICM20948_cleanup();

    return 0;
}