#include "../../hal/include/icm20948.h"
#include "../../hal/include/motionSensor.h"
#include "network.h"
#include "../../hal/include/joystick.h"
#include "../../hal/include/hardwareCommands.h"
#include <stdio.h>
#include <stdlib.h>

#define BEAGLE_ID 3

int main(void)
{

    if(BEAGLE_ID == 1){
        // ICM20948_init();
        // Network_init();
        // Network_cleanup();
        // ICM20948_cleanup();
        printf("beaglebone id %d is now on \n", BEAGLE_ID);
        while(1){
            if(Joystick_getDirectionPressed() == JOYSTICK_DOWN ){
                break;
            }

            if(Joystick_getDirectionPressed() == JOYSTICK_LEFT){
                
                resetDistance(2);
                ICM20948_init(2);
                printf("starting distance from teg's beagle: \n");
                sleepForMs(500);
                while(1){
                    if(Joystick_getDirectionPressed() == JOYSTICK_LEFT ){
                        ICM20948_cleanup();\
                        sleepForMs(500);
                        printf("saving distance of teg's beagle\n");
                        printf("total distance: %.2f\n", totalDistance(2));
                        
                        break;
                    }
                    // getDistance();
                }
            }

            if(Joystick_getDirectionPressed() == JOYSTICK_RIGHT){
                
                resetDistance(3);
                ICM20948_init(3);
                printf("starting distance from steven's beagle: \n");
                sleepForMs(500);
                while(1){
                    if(Joystick_getDirectionPressed() == JOYSTICK_RIGHT ){
                        ICM20948_cleanup();
                        sleepForMs(500);
                        printf("saving distance of steven's beagle\n");
                        printf("total distance: %.2f\n", totalDistance(3));
                        
                        break;
                    }
                    // getDistance();
                }
            }

        }
    }
    
    if(BEAGLE_ID == 2){
        Network_init();
        MotionSensor_init();
        printf("beaglebone id %d is now on \n", BEAGLE_ID);
        while(1){
            if(Joystick_getDirectionPressed() == JOYSTICK_DOWN ){
                break;
            }
        }
        printf("beaglebone id %d is now off \n", BEAGLE_ID);
    }  

        if(BEAGLE_ID == 3){
        Network_init();
        Joystick_init();
        printf("beaglebone id %d is now on \n", BEAGLE_ID);
        while(1){
            if(Joystick_getDirectionPressed() == JOYSTICK_DOWN ){
                break;
            }
        }
        Joystick_cleanup();
        Network_cleanup();
        printf("beaglebone id %d is now off \n", BEAGLE_ID);
    }

    return 0;
}