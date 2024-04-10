#ifndef ICM20948_H
#define ICM20948_H

//inits the accel
void ICM20948_init(void);
//cleans up the accel
void ICM20948_cleanup(void);
//gets distance and is stored in distance variable
float getDistance(void);
//returns distance variable
double returnDistance(void);
//resets the distance variable
void resetDistance(void);
//resets time
void resetTimePassed(void);
//returns the time
double returnTimePassed(void);

#endif 