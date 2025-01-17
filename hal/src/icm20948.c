#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdint.h>
#include <sys/ioctl.h>
#include <pthread.h>
#include <linux/i2c-dev.h>
#include <math.h>
#include "icm20948.h"
#include "hardwareCommands.h"

#define I2CDRV_LINUX_BUS1 "/dev/i2c-1"
#define I2C_DEVICE_ADDRESS 0x69
#define WHO_AM_I 0x00
#define AXMSB 0x2d
#define AXLSB 0x2e
#define AYMSB 0x2f
#define AYLSB 0x30
#define AZMSB 0x31
#define AZLSB 0x32
#define GXMSB 0x33
#define GXLSB 0x34
#define GYMSB 0x35
#define GYLSB 0x36
#define GZMSB 0x37
#define GZLSB 0x38 
#define ACCELERATION_THRESHOLD 0.05
#define GYRO_THRESHOLD 0.5
#define GRAVITY 9.8
#define CALLIBRATION 0.1

// #define AXMSB 0
// #define AXLSB 1
// #define AYMSB 2
// #define AYLSB 3
// #define AZMSB 4
// #define AZLSB 5
// #define GXMSB 6
// #define GXLSB 7
// #define GYMSB 8
// #define GYLSB 9
// #define GZMSB 10
// #define GZLSB 11

// config-pin P9_18 i2c
// config-pin P9_17 i2c
// i2cset -y 1 0x69 0x06 0x00 this enables the icm 20948

// static double oldVelocityX = 0.0;
// static double oldDistanceX = 0.0;
// static double totalTime = 0.0;


static pthread_t accelerometerThreadId;
// static pthread_t terminalThreadId;
static int i2cFileDesc;
static double lastXValAcc = 0;
static double lastYValAcc = 0;
static double lastZValAcc = 0;
static double lastXValGyro = 0;
static double lastYValGyro = 0;
static double lastZValGyro = 0;
static double xgc = 0;//total x gyro scope movemnt
static double ygc = 0;
// static double zgc = 0;
static double velocityx = 0;
static double velocityy = 0;
static double distance = 0;
static double distance1 = 0;
static int bid = 0;

static int initI2cBus(char* bus, int address);
static void writeI2cReg(int i2cFileDesc, unsigned char regAddr,
                        unsigned char value);
static void* accelThreadFn(void* args);
static void readI2cReg(int i2cFileDesc, unsigned char regAddr);
static bool stopping = false;


void ICM20948_init(int id)
{
    bid = id;
    stopping = false;
    runCommand("config-pin P9_18 i2c");
    runCommand("config-pin P9_17 i2c");
    i2cFileDesc = initI2cBus(I2CDRV_LINUX_BUS1, I2C_DEVICE_ADDRESS);
    writeI2cReg(i2cFileDesc, 0x06, 0x01); // turn on CTRL_REG1
    pthread_create(&accelerometerThreadId, NULL, &accelThreadFn, NULL);
}

void ICM20948_cleanup(void)
{
    stopping = true;
    pthread_join(accelerometerThreadId, NULL);
}

static void* accelThreadFn(void* args)
{
    (void)args;
    while (!stopping) {
        writeI2cReg(i2cFileDesc, 0x06, 0x01);
       
        readI2cReg(i2cFileDesc, 0xad);
        getDistance();
        // sleepForMs is in getDistance
    }
    return NULL;
}

static int initI2cBus(char* bus, int address)
{
    i2cFileDesc = open(bus, O_RDWR);
    int result = ioctl(i2cFileDesc, I2C_SLAVE, address);
    if (result < 0) {
        perror("I2C: Unable to set I2C device to slave address.");
        exit(1);
    }
    return i2cFileDesc;
}

static void writeI2cReg(int i2cFileDesc, unsigned char regAddr,
                        unsigned char value)
{
        unsigned char buff[2];
        buff[0] = regAddr;
        buff[1] = value;
        int res = write(i2cFileDesc, buff, 2);
        if (res != 2) {
        perror("I2C: Unable to write i2c register.");
        exit(1);
    }
}

static void readI2cReg(int i2cFileDesc, unsigned char regAddr)
{
    // To read a register, must first write the address
    int res = write(i2cFileDesc, &regAddr, sizeof(regAddr));
    if (res != sizeof(regAddr)) {
        perror("I2C: Unable to write to i2c register.");
        exit(1);
    }
    // Now read the value and return it
    unsigned char buff[12];
    res = read(i2cFileDesc, &buff, 12*sizeof(unsigned char));
    if (res != sizeof(buff)) {
        perror("I2C: Unable to read from i2c register");
        exit(1);
    }
  
    int16_t xa = (buff[0] << 8) | (buff[1]);
    int16_t ya = (buff[2] << 8) | (buff[3]);
    int16_t za = (buff[4] << 8) | (buff[5]);
    int16_t xg = (buff[6] << 8) | (buff[7]);
    int16_t yg = (buff[8] << 8) | (buff[9]);
    int16_t zg = (buff[10] << 8) | (buff[11]);
    

    lastXValAcc = xa / 16384.0;
    lastYValAcc = ya / 16384.0;
    lastZValAcc = za / 16384.0;
    lastXValGyro = xg / 131.0;
    lastYValGyro = yg / 131.0;
    lastZValGyro = zg / 131.0;
}



// v = a*t
static double getVelocity(double acceleration, int n){
    double newVelocity = acceleration * 0.1;  // Calculate new velocity
    if(n == 0){
        velocityx += newVelocity;  // Update velocity only if acceleration is non-zero
    } 
    if(n == 1){
        velocityy += newVelocity;
    }

    return newVelocity;  // Return the new velocity
}

// d = absolute value of (v*t)
static void calculateDistance(double acceleration, int n, int id){
        if (id == 3){
            distance1 += fabs(getVelocity(acceleration, n)) + acceleration *0.01;
        }else{
            distance += fabs(getVelocity(acceleration, n)) + acceleration *0.01;
        }
          // Accumulate distance
}
//returns the distance every 100ms
void getDistance(void){
    double correctedX = 0;
     double correctedY = 0;
    writeI2cReg(i2cFileDesc, 0x06, 0x01);

    if(fabs(lastXValGyro) > GYRO_THRESHOLD ){
        xgc += lastXValGyro*0.1;
    }
    if(fabs(lastYValGyro) > GYRO_THRESHOLD){
        ygc += lastYValGyro*0.1;
    }

    //takes x-accel value and subtracts - depending on how much it is tilted on the 
    //x gyro. shifts value from x-accel to z-acc so that the x accel becomes the new 
    //z accel and vice versa


    if(fabs(lastXValAcc)> ACCELERATION_THRESHOLD){
        correctedX = lastXValAcc+sin((ygc)*M_PI/180);
        calculateDistance(correctedX*GRAVITY*CALLIBRATION,0,bid);
    }
    
    if(fabs(lastYValAcc) > ACCELERATION_THRESHOLD){ 
        correctedY = lastYValAcc+sin((xgc)*M_PI/180);
        calculateDistance(correctedY*GRAVITY*CALLIBRATION,1,bid);
        //printf("repeating Cor Y \n");
    }

    // printf("GX: %.2f  GY: %.2f || CX: %.2f CY: %.2f || AX: %.2f AY: %.2f  || DISTANCE: %.2f m \n", xgc, ygc, correctedX, correctedY, lastXValAcc, lastYValAcc, distance);

    sleepForMs(100);
}

double totalDistance(int id){
    if(id == 3){
        return distance1;
    }else{
        return distance;
    }
}

void resetDistance(int id){
    velocityx = 0;
    velocityy = 0;
    ygc = 0;
    xgc = 0;
    if(id == 3){
        distance1 = 0;
    } else{
        distance = 0;
    }
    
}
