//输出100-200之间个位数不是7的所有素数，每行显示5个。

#include <stdio.h>
#include <math.h>

int main() {
    int count = 0;
    int n, i;
    for (n = 100; n <= 200; n++) {
        if (n % 10 == 7) continue;
        int isPrime = 1;
        for (i = 2; i <= sqrt(n); i++) {
            if (n % i == 0) {
                isPrime = 0;
                break;
            }
        }
        if (isPrime) {
            printf("%d ", n);
            count++;
            if (count % 5 == 0) {
                printf("\n");
            }
        }
    }
    return 0;
}

