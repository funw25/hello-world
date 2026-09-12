#include <stdio.h>

int main() {
    int count = 0;
    for (int num = 2; num <= 300; num++) {
        int is_prime = 1;
        for (int i = 2; i * i <= num; i++) {
            if (num % i == 0) {
                is_prime = 0;
                break;
            }
        }
        if (is_prime) {
            printf("%d ", num);
            count++;
            if (count % 10 == 0) {
                printf("\n");
            }
        }
    }
    return 0;
}
