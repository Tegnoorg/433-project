#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdint.h>
#include <time.h>
#include <sys/ioctl.h>
#include <linux/i2c-dev.h>

#define BUS1 "/dev/i2c-1"
#define I2C_ADDRESS 0x1C
#define WHO_AM_I 0x2A
#define XMSB 0x01
#define XLSB 0x02
#define YMSB 0x03
#define YLSB 0x04
#define ZMSB 0x05
#define ZLSB 0x06

static int i2cFile;
void AccelStart();
void AccelStop();
int *getAccel();

static int initI2cBus(char* bus, int address)
{
int i2cFileDesc = open(bus, O_RDWR);
int result = ioctl(i2cFileDesc, I2C_SLAVE, address);
if (result < 0) {
perror("I2C: Unable to set I2C device to slave address.");
exit(1);
}
return i2cFileDesc;
}

void AccelStart() {
    i2cFile = initI2cBus( BUS1, I2C_ADDRESS);
    char ar[2];
    ar[0] = WHO_AM_I;
    ar[1] = 0x01;
    write(i2cFile, ar, 2);
}

void AccelStop() {
       char ar[2];
    ar[0] = 0x2A;
    ar[1] = 0x00;
    write(i2cFile, ar, 2);
    close(i2cFile);
}

int *getAccel() {
    char ar[7];
    static int array[3];

    write(i2cFile, 0x0, 1);
    if(read(i2cFile, ar, 7) != 7){
        printf("Error getting accel\n");
    }else{
        int16_t x = (ar[1] << 8) | ar[2];
        int16_t y = (ar[3] << 8) | ar[4];
        int16_t z = (ar[5] << 8) | ar[6];

        array[0] = x / 10000;
        array[1] = y / 10000;
        array[2] = z / 10000;
    }
    return array;
}


int main() {
    AccelStart();

    time_t start_time = time(NULL);

    int total_x = 0, total_y = 0, total_z = 0;

    while (1) {
        int *accel = getAccel();
        total_x += accel[0];
        total_y += accel[1];
        total_z += accel[2];
        if (1) { //add a terminate value
            break;
        }
        usleep(1000000);
    }

    time_t end_time = time(NULL);
    double elapsed_time = difftime(end_time, start_time);
    int total_distance = total_x + total_y + total_z;

    printf("Total distance traveled: %d\n", total_distance);
    printf("Total time elapsed: %.2f seconds\n", elapsed_time);

    AccelStop();
    return 0;
}