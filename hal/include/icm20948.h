#ifndef ICM20948_H
#define ICM20948_H

//inits the accel
void ICM20948_init(int id);
//cleans up the accel
void ICM20948_cleanup(void);
//gets distance and is stored in distance variable
void getDistance(void);
//returns the total distnace
double totalDistance(int id);
//resets the distance values
void resetDistance(int id);


#endif 