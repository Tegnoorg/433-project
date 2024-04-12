#include "../../hal/include/icm20948.h"
#include "../../hal/include/motionSensor.h"
#include "network.h"
#include "../../hal/include/joystick.h"
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
                while(1){
                    if(Joystick_getDirectionPressed() == JOYSTICK_LEFT ){
                        printf("saving distance of teg's beagle\n");
                        printf("total distance: %2.f", totalDistance(2));
                        ICM20948_cleanup();
                        break;
                    }
                    getDistance();
                }
            }

            if(Joystick_getDirectionPressed() == JOYSTICK_RIGHT){
                
                resetDistance(3);
                ICM20948_init(3);
                printf("starting distance from steven's beagle: \n");
                while(1){
                    if(Joystick_getDirectionPressed() == JOYSTICK_RIGHT ){
                        printf("saving distance of steven's beagle\n");
                        printf("total distance: %2.f", totalDistance(3));
                        ICM20948_cleanup();
                        break;
                    }
                    getDistance();
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