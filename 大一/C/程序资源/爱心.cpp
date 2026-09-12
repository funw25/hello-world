#include <stdio.h>
#include <math.h>
int main() {
    int i, j;
    double x, y, equation;
    
    for (i = -30; i <= 30; i++) {
        for (j = -30; j <= 30; j++) {
            x = j * 0.041;
            y = -i * 0.041;
            
            equation = pow(x * x + y * y - 1, 3) - x * x * y * y * y;
            
            if (equation <= 0.0) {
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    
    return 0;
}
