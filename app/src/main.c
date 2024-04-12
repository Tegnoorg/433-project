#include "../../hal/include/icm20948.h"
#include "../../hal/include/motionSensor.h"
#include "network.h"
#include <stdio.h>

#define BEAGLE_ID 1

int main(void)
{

    if(BEAGLE_ID == 0){
        ICM20948_init();
        // Network_init();
        // Network_cleanup();
        // ICM20948_cleanup();
    }
    
    if(BEAGLE_ID == 1){
        Network_init();
        Network_cleanup();
    }

    if(BEAGLE_ID == 2){
        Network_init();
        MotionSensor_init();
    }  

    while(1){

    }
    return 0;
}